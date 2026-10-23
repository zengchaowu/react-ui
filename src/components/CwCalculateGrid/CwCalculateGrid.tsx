import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { HTMLAttributes } from 'react'
import processFormulaDeps from './functions/processFormulaDeps'
import type { CwCalculateGridProps, DisplayRow } from './types'
import converSourceRowToDisplayRow from './functions/converSourceRowToDisplayRow'
import processFormulaFieldGlobalAlias from './functions/processFormulaFieldGlobalAlias'
import getScopeFromSourceRow from './functions/getScopeFromSourceRow'
import getScopeFromKeypath from './functions/getScopeFromKeypath'
import processSourceRowChildren from './functions/processSourceRowChildren'
import handleAction from './functions/handleAction'
import {
  retainFormulaScheduler,
  type CalculateIdleTiming,
} from './functions/formulaScheduler'
import {
  refreshCalculateGrids,
  registerCalculateGridRefresh,
} from './functions/calculateGridRefreshRegistry'
import {
  beginEditTiming,
  recordBuildRows,
  takeEditTiming,
  type CalculateEditTiming,
  type CalculateLoadTiming,
} from './functions/editTiming'
import { getVirtualWindow } from '../CwVirtualScroll/virtual-scroll'
import { calculateGridBase } from './styles'
import { defaultTexts } from './texts'
import CwDataTable from '../CwDataTable/CwDataTable'
import type { CwDataTableHandle } from '../CwDataTable/types'
import type { CwDataTableColumn, CwDataTableConfig, CwDataTableRow } from '../CwDataTable/types'
import CwCalculateGridCell from './CwCalculateGridCell'

export interface CwCalculateGridComponentProps
  extends CwCalculateGridProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  className?: string
}

const FIRST_PAINT_ROWS = 100
const VIRTUAL_BUFFER = 3

/** 与表体 `py-2` + `text-sm` 行框实测一致，虚拟滚动按这个高度切片 */
const CALCULATE_GRID_ROW_HEIGHT = 37

/**
 * React 版 CwDataTable 未埋点虚拟窗口准备耗时，这里恒为 0（计时字段保留）。
 */
function consumeVirtualPrepareMs() {
  return 0
}

function roundMs(value: number) {
  return Math.round(value * 10) / 10
}

export function CwCalculateGrid({
  sourceRows,
  keyPathDepsMap,
  keyPathFuncStrMap,
  scopeDisplayRowMap,
  globalScope,
  colDefs,
  texts = defaultTexts,
  onEditTiming,
  onLoadTiming,
  onIdleTiming,
  className,
  ...rest
}: CwCalculateGridComponentProps) {
  const displayRowsRef = useRef<DisplayRow[]>([])
  const materializedCountRef = useRef(0)
  const [renderRevision, setRenderRevision] = useState(0)
  const tableRef = useRef<CwDataTableHandle | null>(null)
  const schedulerRef = useRef<
    ReturnType<typeof retainFormulaScheduler>['scheduler'] | null
  >(null)

  function materializeIndex(index: number) {
    const sourceRow = sourceRows[index]
    const scope = getScopeFromSourceRow(sourceRow)
    if (scopeDisplayRowMap.has(scope)) {
      displayRowsRef.current[index] = scopeDisplayRowMap.get(scope) as DisplayRow
      return scope
    }
    for (const [key, field] of Object.entries(sourceRow)) {
      if (field?.type === 'formula') {
        processFormulaFieldGlobalAlias(
          field,
          globalScope,
          scope,
          key,
          keyPathDepsMap,
        )
      }
    }
    const displayRow = converSourceRowToDisplayRow(
      sourceRow,
      globalScope,
      scopeDisplayRowMap,
    )
    scopeDisplayRowMap.set(scope, displayRow)
    displayRowsRef.current[index] = displayRow
    for (const [key, field] of Object.entries(sourceRow)) {
      if (field?.type === 'formula') {
        processFormulaDeps(
          key,
          field,
          keyPathDepsMap,
          keyPathFuncStrMap,
          sourceRow,
        )
      }
    }
    processSourceRowChildren(
      sourceRow,
      scopeDisplayRowMap,
      keyPathDepsMap,
      keyPathFuncStrMap,
    )
    return scope
  }

  function materializeThrough(index: number) {
    const last = Math.min(index, sourceRows.length - 1)
    const scopes: string[] = []
    while (materializedCountRef.current <= last) {
      scopes.push(materializeIndex(materializedCountRef.current))
      materializedCountRef.current += 1
    }
    return scopes
  }

  function processData() {
    const buildStarted = performance.now()
    materializedCountRef.current = 0
    displayRowsRef.current = new Array<DisplayRow>(sourceRows.length)
    materializeThrough(FIRST_PAINT_ROWS - 1)
    recordBuildRows(performance.now() - buildStarted)
  }

  function idleAdvance() {
    const total = sourceRows.length
    if (materializedCountRef.current >= total) return false
    const started = performance.now()
    const scopes: string[] = []
    while (
      materializedCountRef.current < total &&
      performance.now() - started < 8
    ) {
      scopes.push(materializeIndex(materializedCountRef.current))
      materializedCountRef.current += 1
    }
    if (scopes.length > 0) schedulerRef.current?.ensureScopes(scopes)
    return materializedCountRef.current < total
  }

  function rowScopes(start: number, end: number) {
    const scopes: string[] = []
    const rows = displayRowsRef.current
    const last = Math.min(end, rows.length - 1)
    for (let index = Math.max(0, start); index <= last; index += 1) {
      scopes.push(rows[index]._data.id.value)
    }
    return scopes
  }

  function visibleBounds() {
    const total = sourceRows.length
    const body = tableRef.current?.bodyRef ?? null
    const height = body?.clientHeight ?? 0
    if (total === 0 || height <= 0) {
      return { start: 0, end: Math.min(total - 1, FIRST_PAINT_ROWS - 1) }
    }
    const scrollTop = Number(tableRef.current?.scrollTop ?? 0)
    const win = getVirtualWindow(
      total,
      CALCULATE_GRID_ROW_HEIGHT,
      scrollTop,
      height,
      VIRTUAL_BUFFER,
    )
    return { start: win.startIndex, end: win.endIndex }
  }

  function materializeRange(start: number, end: number) {
    const scopes: string[] = []
    const last = Math.min(end, sourceRows.length - 1)
    for (let index = Math.max(0, start); index <= last; index += 1) {
      scopes.push(materializeIndex(index))
    }
    return scopes
  }

  function visibleScopes() {
    if (sourceRows.length === 0) return []
    const { start, end } = visibleBounds()
    if (end < start) return []
    return materializeRange(start, end)
  }

  function syncVisibleFormulas() {
    const scheduler = schedulerRef.current
    if (!scheduler) return false
    const touched = scheduler.ensureReady(visibleScopes())
    if (touched.length === 0) return false
    refreshCalculateGrids(keyPathDepsMap, new Set(touched))
    return true
  }

  const commitCell = useCallback(
    (row: DisplayRow, key: string, value: string) => {
      const scheduler = schedulerRef.current
      if (!scheduler) return
      beginEditTiming()
      consumeVirtualPrepareMs()
      const started = performance.now()
      const affectedKeyPaths = handleAction(
        row._data.id.value,
        key,
        value,
        keyPathDepsMap,
        keyPathFuncStrMap,
        scopeDisplayRowMap,
        globalScope,
        false,
        false,
      )
      scheduler.invalidate(affectedKeyPaths)
      scheduler.ensureVisible()
      const refreshStarted = performance.now()
      refreshCalculateGrids(
        keyPathDepsMap,
        new Set(affectedKeyPaths.map(getScopeFromKeypath)),
      )
      const refreshMs = performance.now() - refreshStarted
      const renderStarted = performance.now()
      requestAnimationFrame(() => {
        const renderedAt = performance.now()
        const virtualMs = consumeVirtualPrepareMs()
        requestAnimationFrame(() => {
          const paintedAt = performance.now()
          const snap = takeEditTiming()
          if (!snap) return
          const flashMs = snap.flashMs
          onEditTiming?.({
            topoMs: roundMs(snap.topoMs),
            logMs: roundMs(snap.logMs),
            formulaCompileMs: roundMs(snap.formulaCompileMs),
            formulaRunMs: roundMs(snap.formulaRunMs),
            formulaCount: snap.formulaCount,
            refreshMs: roundMs(refreshMs),
            virtualMs: roundMs(virtualMs),
            renderMs: roundMs(
              Math.max(0, renderedAt - renderStarted - flashMs - virtualMs),
            ),
            flashMs: roundMs(flashMs),
            flashCount: snap.flashCount,
            paintMs: roundMs(paintedAt - renderedAt),
            totalMs: roundMs(paintedAt - started),
          })
        })
      })
    },
    [
      keyPathDepsMap,
      keyPathFuncStrMap,
      scopeDisplayRowMap,
      globalScope,
      onEditTiming,
    ],
  )

  function refreshThisGrid(affectedScopes: ReadonlySet<string> | null) {
    if (affectedScopes) {
      const { start, end } = visibleBounds()
      const rows = displayRowsRef.current
      let hit = false
      for (let index = start; index <= end; index += 1) {
        const row = rows[index]
        if (row && affectedScopes.has(row._data.id.value)) {
          hit = true
          break
        }
      }
      if (!hit) return
    }
    setRenderRevision((revision) => revision + 1)
  }

  function finishLoadTiming(
    started: number,
    refreshMs: number,
    renderMs: number,
    virtualMs: number,
    renderedAt: number,
  ) {
    requestAnimationFrame(() => {
      const paintedAt = performance.now()
      const snap = takeEditTiming()
      if (snap) {
        onLoadTiming?.({
          buildRowsMs: roundMs(snap.buildRowsMs),
          sortMs: roundMs(snap.topoMs),
          formulaCompileMs: roundMs(snap.formulaCompileMs),
          formulaRunMs: roundMs(snap.formulaRunMs),
          formulaCount: snap.formulaCount,
          refreshMs: roundMs(refreshMs),
          virtualMs: roundMs(virtualMs),
          renderMs: roundMs(renderMs),
          paintMs: roundMs(paintedAt - renderedAt),
          totalMs: roundMs(paintedAt - started),
        })
      }
      schedulerRef.current?.start()
    })
  }

  /** 注册到调度器/刷新注册表的回调始终取最新一次渲染的闭包 */
  const engineRef = useRef({
    visibleScopes: (): string[] => [],
    idleAdvance: (): boolean => false,
    syncVisibleFormulas: (): boolean => false,
    refreshThisGrid: (_affectedScopes: ReadonlySet<string> | null): void => {},
  })
  engineRef.current = {
    visibleScopes,
    idleAdvance,
    syncVisibleFormulas,
    refreshThisGrid,
  }

  const columns = useMemo<CwDataTableColumn[]>(() => {
    const revision = renderRevision
    return colDefs.map((column) => ({
      key: column.field,
      title: column.headerName,
      width: column.width,
      minWidth: column.minWidth,
      flex: column.flex,
      fixed:
        column.pinned === 'left' || column.pinned === 'right'
          ? column.pinned
          : undefined,
      sortable: false,
      resizable: false,
      showOverflowTooltip: false,
      cellRender: (ctx) => (
        <CwCalculateGridCell
          row={ctx.row as unknown as DisplayRow}
          fieldKey={column.field}
          editable={column.editable !== false}
          revision={revision}
          onCommit={(value: string) =>
            commitCell(ctx.row as unknown as DisplayRow, column.field, value)
          }
        />
      ),
    }))
  }, [colDefs, renderRevision, commitCell])

  const tableConfig = useMemo<CwDataTableConfig>(
    () => ({
      columns,
      resizable: false,
      showOverflowTooltip: false,
      rowKey: 'id',
      fixedHeader: true,
      bodyLayout: 'fill',
      virtualScroll: true,
      rowHeight: CALCULATE_GRID_ROW_HEIGHT,
    }),
    [columns],
  )

  useLayoutEffect(() => {
    const retained = retainFormulaScheduler(
      keyPathDepsMap,
      keyPathFuncStrMap,
      scopeDisplayRowMap,
      globalScope,
      (timing: CalculateIdleTiming) => onIdleTiming?.(timing),
    )
    schedulerRef.current = retained.scheduler
    const unregisterScopes = retained.scheduler.registerScopes(() =>
      engineRef.current.visibleScopes(),
    )
    retained.scheduler.setAdvance(() => engineRef.current.idleAdvance())
    retained.scheduler.setOnBatch((scopes) => {
      refreshCalculateGrids(keyPathDepsMap, new Set(scopes))
    })
    const unregisterRefresh = registerCalculateGridRefresh(
      keyPathDepsMap,
      (affectedScopes) => engineRef.current.refreshThisGrid(affectedScopes),
    )
    beginEditTiming()
    consumeVirtualPrepareMs()
    const started = performance.now()
    processData()
    setRenderRevision((revision) => revision + 1)
    retained.scheduler.ensureScopes(rowScopes(0, FIRST_PAINT_ROWS - 1))
    const refreshStarted = performance.now()
    refreshCalculateGrids(keyPathDepsMap, null)
    const refreshMs = performance.now() - refreshStarted
    const renderStarted = performance.now()
    let frame = requestAnimationFrame(() => {
      const firstRenderedAt = performance.now()
      const virtualFirst = consumeVirtualPrepareMs()
      const extended = syncVisibleFormulas()
      if (!extended) {
        finishLoadTiming(
          started,
          refreshMs,
          Math.max(0, firstRenderedAt - renderStarted - virtualFirst),
          virtualFirst,
          firstRenderedAt,
        )
        return
      }
      const extendStarted = performance.now()
      frame = requestAnimationFrame(() => {
        const renderedAt = performance.now()
        const virtualSecond = consumeVirtualPrepareMs()
        finishLoadTiming(
          started,
          refreshMs,
          Math.max(0, firstRenderedAt - renderStarted - virtualFirst) +
            Math.max(0, renderedAt - extendStarted - virtualSecond),
          virtualFirst + virtualSecond,
          renderedAt,
        )
      })
    })

    return () => {
      cancelAnimationFrame(frame)
      unregisterScopes()
      retained.release()
      unregisterRefresh()
      schedulerRef.current = null
    }
    // 与 Vue onBeforeMount/onUnmounted 一致：只在挂载/卸载时初始化一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      engineRef.current.syncVisibleFormulas()
    })
    let frame = requestAnimationFrame(() => {
      const body = tableRef.current?.bodyRef
      if (body) resizeObserver.observe(body)
    })
    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
    }
  }, [])

  const rootClass = [
    calculateGridBase.root,
    calculateGridBase.container,
    'flex min-h-0 flex-col',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  void texts

  return (
    <div {...rest} className={rootClass}>
      <CwDataTable
        ref={tableRef}
        className="h-full min-h-0 w-full flex-1"
        config={tableConfig}
        modelValue={displayRowsRef.current as unknown as CwDataTableRow[]}
        onScroll={() => {
          engineRef.current.syncVisibleFormulas()
        }}
      />
    </div>
  )
}

export default CwCalculateGrid
