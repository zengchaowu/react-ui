import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  CSSProperties,
  FocusEvent as ReactFocusEvent,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  UIEvent as ReactUIEvent,
} from 'react'
import type {
  CwDataTableColumn,
  CwDataTableEmits,
  CwDataTableExternalRowScope,
  CwDataTableHandle,
  CwDataTableProps,
  CwDataTableSlots,
  CwDataTableSortState,
  CwDataTableStyles,
  CwDataTableTreeRowMeta,
} from './types'
import {
  getDataTableBodyCwDivViewportClass,
  getDataTableContentBodyViewportClass,
  resolveDataTableStyles,
} from './styles'
import { defaultTexts } from './texts'
import { useContainerSize } from '../CwVirtualScroll/hooks/useContainerSize'
import CwDiv from '../CwDiv/CwDiv'
import type { CwDivHandle } from '../CwDiv/CwDiv'
import { resolveCwDivViewport } from '../CwDiv/resolveCwDivViewport'
import CwIcon from '../CwIcon/CwIcon'
import CwDataTableHeaderRenderer from './CwDataTableHeaderRenderer'
import CwDataTableBodyRows from './CwDataTableBodyRows'
import CwDataTableBodyPanel from './CwDataTableBodyPanel'
import { useVirtualScroll } from './hooks/useVirtualScroll'
import { useBrowserFocusVisible } from '../../hooks/useBrowserFocusVisible'
import {
  calculateColumnStyle,
  calculateColumnWidth,
  calculateHeaderProps,
  calculateNextSortOrder,
  collectExpandableTreeKeys,
  columnKeysSignature,
  computeLeftoverShares,
  computeScrollLeftToCenterColumn,
  computeShouldExpandFillColumns,
  flattenTreeRows,
  getHeaderCellClasses,
  getBodyCellClasses,
  getFirstBodyDataRow,
  getAllBodyDataRows,
  getHeaderRow,
  getHorizontalScrollMetrics,
  getTreeRowMeta,
  isElasticFillColumn,
  isSortedAsc,
  isSortedDesc,
  layoutBoundedFitColumns,
  mergeColumnStyleTransparentLateralBorders,
  mergeColumnStyleTransparentRight,
  pinHorizontalScrollToRight,
  resolveResizeTargetAt,
  resolveTableEdgeBorderOmits,
  resizeHandleId as toResizeHandleId,
  stripFixedBodyFirstBorderClasses,
  syncFitContentColumnWidths,
  syncFlexColumnWidthsFromBodyRow,
  type CwDataTableResizeEdge,
} from './functions'
import { calculateScrollbarWidth } from './functions/scrollbarUtils'

export interface CwDataTableComponentProps
  extends CwDataTableProps,
    CwDataTableEmits,
    CwDataTableSlots,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'onScroll'> {
  className?: string
}

type ClassVariants = {
  base: string[]
  idle: string[]
  selected: string[]
  hovered: string[]
}

const OVERFLOW_EPSILON = 1

function computeVisibleColumns(
  columns: CwDataTableColumn[],
  fixedLeftColumns: number,
  fixedRightColumns: number,
): CwDataTableColumn[] {
  const cols = columns.filter((c) => c.visible !== false)

  const leftFixed: CwDataTableColumn[] = []
  const rightFixed: CwDataTableColumn[] = []
  const normal: CwDataTableColumn[] = []

  cols.forEach((col) => {
    if (col.fixed === 'left') {
      leftFixed.push({ ...col, fixedIndex: leftFixed.length })
    } else if (col.fixed === 'right') {
      rightFixed.push({ ...col, fixedIndex: -(rightFixed.length + 1) })
    } else {
      normal.push(col)
    }
  })

  if (fixedLeftColumns > 0) {
    const needFixed = fixedLeftColumns - leftFixed.length
    if (needFixed > 0) {
      const autoLeft = normal.splice(0, needFixed)
      autoLeft.forEach((col, index) => {
        leftFixed.push({
          ...col,
          fixed: 'left' as const,
          fixedIndex: leftFixed.length + index,
        })
      })
    }
  }

  if (fixedRightColumns > 0) {
    const needFixed = fixedRightColumns - rightFixed.length
    if (needFixed > 0) {
      const autoRight = normal.splice(-needFixed)
      autoRight.forEach((col, index) => {
        rightFixed.unshift({
          ...col,
          fixed: 'right' as const,
          fixedIndex: -(rightFixed.length + index + 1),
        })
      })
    }
  }

  return [...leftFixed, ...normal, ...rightFixed]
}

function fixedSideHasWidth(
  columns: readonly CwDataTableColumn[],
  columnWidths: Record<string, number>,
  side: 'left' | 'right',
): boolean {
  if (side === 'left') {
    for (const column of columns) {
      if (column.fixed !== 'left') break
      if ((columnWidths[column.key] ?? column.width ?? 0) > 0) return true
    }
    return false
  }
  for (let i = columns.length - 1; i >= 0; i--) {
    const column = columns[i]!
    if (column.fixed !== 'right') break
    if ((columnWidths[column.key] ?? column.width ?? 0) > 0) return true
  }
  return false
}

interface ResizeSession {
  column: CwDataTableColumn
  edge: CwDataTableResizeEdge
  startX: number
  startWidth: number
  pinScrollRight: boolean
  captureEl: HTMLElement | null
  pointerId: number | null
}

export const CwDataTable = forwardRef<CwDataTableHandle, CwDataTableComponentProps>(
  function CwDataTable(props, ref) {
    const {
      config,
      modelValue,
      collapsibleBody = false,
      loading = false,
      lifecycle,
      appearance = 'default',
      texts: textsProp,
      bodyExpanded: bodyExpandedProp,
      expandedKeys: expandedKeysProp,
      onUpdateBodyExpanded,
      onUpdateModelValue: _onUpdateModelValue,
      onUpdateSort,
      onSortChange,
      onColumnResizing,
      onColumnResize,
      onScroll,
      onUpdateColumnSelect,
      onColumnSelectChange,
      onUpdateExpandedKeys,
      onTreeExpandChange,
      externalRowSlot,
      headerOverlaySlot,
      bodyOverlaySlot,
      emptySlot,
      loadingSlot,
      className,
      ...rest
    } = props

    const columns = config.columns
    const showHeader = config.showHeader !== false
    const fixedHeader = config.fixedHeader ?? false
    const fixedLeftColumns = config.fixedLeftColumns ?? 0
    const fixedRightColumns = config.fixedRightColumns ?? 0
    const rowHeight = config.rowHeight ?? 50
    const rowHeightKey = config.rowHeightKey
    const virtualScroll = config.virtualScroll ?? false
    const virtualBuffer = config.virtualBuffer ?? 3
    const resizable = config.resizable !== false
    const showOverflowTooltip = config.showOverflowTooltip !== false
    const defaultSortable = config.sort?.defaultSortable ?? false
    const sortState = config.sort?.state
    const rowKeyField = config.rowKey
    const columnSelectConfig = config.columnSelect
    const columnSelectEnabled = columnSelectConfig?.enabled ?? false
    const columnSelectRequired = columnSelectConfig?.required ?? false
    const syncWidthsFromBody = config.syncColumnWidthsFromBody !== false
    const stretchFitColumnsToContainer = config.stretchFitColumnsToContainer === true
    const bodyLayoutFill = (config.bodyLayout ?? 'fill') === 'fill'

    const styles = useMemo<CwDataTableStyles>(
      () =>
        resolveDataTableStyles(appearance ?? 'default', {
          borderless: config.borderless,
          plainHeader: config.plainHeader,
          bodyLayout: config.bodyLayout,
        }),
      [appearance, config.borderless, config.plainHeader, config.bodyLayout],
    )

    const texts = useMemo(
      () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
      [textsProp],
    )

    const headerRef = useRef<HTMLDivElement | null>(null)
    const externalRowRef = useRef<HTMLDivElement | null>(null)
    const cwDivHandleRef = useRef<CwDivHandle | null>(null)
    const bodyElRef = useRef<HTMLElement | null>(null)

    const [cwDivHandle, setCwDivHandle] = useState<CwDivHandle | null>(null)
    const [bodyEl, setBodyEl] = useState<HTMLElement | null>(null)

    const attachCwDiv = useCallback((handle: CwDivHandle | null) => {
      cwDivHandleRef.current = handle
      setCwDivHandle(handle)
    }, [])

    useLayoutEffect(() => {
      const viewport = resolveCwDivViewport(cwDivHandle)
      bodyElRef.current = viewport
      setBodyEl(viewport)
      cwDivHandle?.remeasure()
    }, [cwDivHandle])

    // 树形表格
    const treeConfig = config.tree
    const treeEnabled = treeConfig?.enabled === true
    const childrenKey = treeConfig?.childrenKey ?? 'children'
    const treeIndentSize = treeConfig?.indentSize ?? 16
    const indentColumnKey =
      treeConfig?.indentColumnKey ?? columns.find((c) => c.visible !== false)?.key

    const [expandedKeysState, setExpandedKeysState] = useState<Array<string | number>>(
      () => expandedKeysProp ?? [],
    )
    const expandedKeysRef = useRef(expandedKeysState)
    expandedKeysRef.current = expandedKeysState

    useEffect(() => {
      if (expandedKeysProp === undefined) return
      setExpandedKeysState((prev) => {
        if (prev.length === expandedKeysProp.length && prev.every((k, i) => k === expandedKeysProp[i])) {
          return prev
        }
        return expandedKeysProp
      })
    }, [expandedKeysProp])

    useEffect(() => {
      if (!treeEnabled || modelValue.length === 0) return
      if (expandedKeysRef.current.length > 0) return

      let next: Array<string | number> | null = null
      if (treeConfig?.defaultExpandAll) {
        next = collectExpandableTreeKeys(modelValue, childrenKey, rowKeyField)
      } else if (treeConfig?.defaultExpandedKeys?.length) {
        next = [...treeConfig.defaultExpandedKeys]
      }
      if (next && next.length > 0) {
        setExpandedKeysState(next)
        onUpdateExpandedKeys?.(next)
      }
    }, [
      treeEnabled,
      modelValue,
      treeConfig,
      childrenKey,
      rowKeyField,
      onUpdateExpandedKeys,
    ])

    const prevExpandedKeysRef = useRef(expandedKeysState)
    useEffect(() => {
      if (prevExpandedKeysRef.current === expandedKeysState) return
      prevExpandedKeysRef.current = expandedKeysState
      onTreeExpandChange?.(expandedKeysState)
    }, [expandedKeysState, onTreeExpandChange])

    const toggleTreeExpand = useCallback(
      (row: Record<string, unknown>) => {
        const meta = getTreeRowMeta(row)
        if (!meta?.hasChildren) return
        const next = new Set(expandedKeysRef.current)
        if (next.has(meta.rowKey)) next.delete(meta.rowKey)
        else next.add(meta.rowKey)
        const nextKeys = [...next]
        setExpandedKeysState(nextKeys)
        onUpdateExpandedKeys?.(nextKeys)
      },
      [onUpdateExpandedKeys],
    )

    const isIndentColumn = useCallback(
      (column: CwDataTableColumn) => treeEnabled && column.key === indentColumnKey,
      [treeEnabled, indentColumnKey],
    )

    const flatRows = useMemo(
      () =>
        treeEnabled
          ? flattenTreeRows(modelValue, {
              childrenKey,
              rowKey: rowKeyField,
              expandedKeys: new Set(expandedKeysState),
            })
          : modelValue,
      [treeEnabled, modelValue, childrenKey, rowKeyField, expandedKeysState],
    )

    const displayedRows = flatRows

    // 可见列
    const visibleColumns = useMemo(
      () => computeVisibleColumns(columns, fixedLeftColumns, fixedRightColumns),
      [columns, fixedLeftColumns, fixedRightColumns],
    )
    const visibleColumnsRef = useRef(visibleColumns)
    visibleColumnsRef.current = visibleColumns

    // 列宽管理
    const [columnWidths, setColumnWidthsState] = useState<Record<string, number>>({})
    const columnWidthsRef = useRef(columnWidths)
    columnWidthsRef.current = columnWidths

    const setColumnWidths = useCallback((next: Record<string, number>) => {
      columnWidthsRef.current = next
      setColumnWidthsState(next)
    }, [])

    // fill / 剩余空间
    const [expandFillColumns, setExpandFillColumns] = useState(
      config.defaultExpandFillColumns === true,
    )
    const expandFillColumnsRef = useRef(expandFillColumns)
    expandFillColumnsRef.current = expandFillColumns
    const [layoutContainerWidth, setLayoutContainerWidth] = useState(0)

    const expandFillRafRef = useRef(0)
    const syncRafRef = useRef(0)
    const syncRunRef = useRef<() => void>(() => {})

    const updateScrollbarWidthRef = useRef<() => void>(() => {})

    const updateExpandFillLayout = useCallback(() => {
      const width = bodyElRef.current?.clientWidth ?? 0
      setLayoutContainerWidth((prev) => (Math.abs(prev - width) >= 0.5 ? width : prev))
      const next = computeShouldExpandFillColumns(
        visibleColumnsRef.current,
        columnWidthsRef.current,
        bodyElRef.current,
      )
      setExpandFillColumns((prev) => (next === prev ? prev : next))
      cwDivHandleRef.current?.remeasure()
    }, [])

    const scheduleExpandFillUpdate = useCallback(() => {
      if (expandFillRafRef.current) cancelAnimationFrame(expandFillRafRef.current)
      expandFillRafRef.current = requestAnimationFrame(() => {
        expandFillRafRef.current = 0
        updateExpandFillLayout()
      })
    }, [updateExpandFillLayout])

    const flushExpandFillUpdate = useCallback(() => {
      if (expandFillRafRef.current) {
        cancelAnimationFrame(expandFillRafRef.current)
        expandFillRafRef.current = 0
      }
      updateExpandFillLayout()
    }, [updateExpandFillLayout])

    useLayoutEffect(() => {
      if (!bodyEl) return
      // 首帧前同步量一次表体宽度：剩余空间分摊必须赶在第一次绘制前生效，
      // 否则会先画出未分摊的列宽再跳一次（Vue 版在绘制前就完成了）。
      flushExpandFillUpdate()
      if (typeof ResizeObserver === 'undefined') return
      const observer = new ResizeObserver(() => scheduleExpandFillUpdate())
      observer.observe(bodyEl)
      return () => observer.disconnect()
    }, [bodyEl, flushExpandFillUpdate, scheduleExpandFillUpdate])

    useEffect(() => {
      scheduleExpandFillUpdate()
    }, [visibleColumns, columnWidths, scheduleExpandFillUpdate])

    const tableStyles = useMemo<CwDataTableStyles>(
      () => ({
        ...styles,
        scrollContent: expandFillColumns
          ? styles.scrollContentFitContainer
          : styles.scrollContent,
      }),
      [styles, expandFillColumns],
    )

    const headerScrollClass = useMemo(
      () =>
        expandFillColumns
          ? styles.header.replace(/\boverflow-x-auto\b/g, 'overflow-x-hidden')
          : styles.header,
      [styles, expandFillColumns],
    )

    const bodyShellClass = bodyLayoutFill
      ? `${styles.body} flex min-h-0 flex-1 flex-col`
      : `${styles.body} flex flex-col`
    const cwDivRootClass = bodyLayoutFill
      ? `${styles.body} w-full min-h-0 flex-1`
      : 'w-full shrink-0'
    const bodyCwDivViewportClass = bodyLayoutFill
      ? getDataTableBodyCwDivViewportClass(expandFillColumns)
      : getDataTableContentBodyViewportClass(expandFillColumns)

    // 滚动同步
    const [scrollTop, setScrollTop] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)
    const scrollLeftRef = useRef(0)
    scrollLeftRef.current = scrollLeft
    const isSyncingRef = useRef(false)

    const stopSyncing = useCallback(() => {
      requestAnimationFrame(() => {
        isSyncingRef.current = false
      })
    }, [])

    const handleHeaderScroll = useCallback(
      (event: ReactUIEvent<HTMLDivElement>) => {
        if (isSyncingRef.current) return
        const target = event.currentTarget
        isSyncingRef.current = true
        const body = bodyElRef.current
        if (body && Math.abs(target.scrollLeft - body.scrollLeft) > 1) {
          body.scrollLeft = target.scrollLeft
        }
        stopSyncing()
      },
      [stopSyncing],
    )

    const handleBodyScroll = useCallback(
      (event: Event) => {
        if (isSyncingRef.current) return
        const target = event.target as HTMLElement | null
        if (!target) return
        setScrollTop(target.scrollTop)
        setScrollLeft(target.scrollLeft)
        scrollLeftRef.current = target.scrollLeft

        isSyncingRef.current = true
        const header = headerRef.current
        if (header && Math.abs(target.scrollLeft - header.scrollLeft) > 1) {
          header.scrollLeft = target.scrollLeft
        }
        stopSyncing()

        onScroll?.(target.scrollTop, target.scrollLeft)
      },
      [onScroll, stopSyncing],
    )

    // 外部行横向滚动同步
    const handleExternalRowScroll = useCallback(
      (event: ReactUIEvent<HTMLDivElement>) => {
        if (isSyncingRef.current) return
        const target = event.currentTarget
        isSyncingRef.current = true
        const header = headerRef.current
        if (header && Math.abs(target.scrollLeft - header.scrollLeft) > 1) {
          header.scrollLeft = target.scrollLeft
        }
        const body = bodyElRef.current
        if (body && Math.abs(target.scrollLeft - body.scrollLeft) > 1) {
          body.scrollLeft = target.scrollLeft
        }
        stopSyncing()
      },
      [stopSyncing],
    )

    useEffect(() => {
      const el = externalRowRef.current
      if (!el || isSyncingRef.current) return
      if (Math.abs(el.scrollLeft - scrollLeft) <= 1) return
      isSyncingRef.current = true
      el.scrollLeft = scrollLeft
      stopSyncing()
    }, [scrollLeft, stopSyncing])

    const { containerHeight } = useContainerSize(bodyEl)

    // 滚动条对齐
    const [scrollbarWidth, setScrollbarWidth] = useState(0)
    const updateScrollbarWidth = useCallback(() => {
      setScrollbarWidth(calculateScrollbarWidth(bodyElRef.current))
    }, [])
    updateScrollbarWidthRef.current = updateScrollbarWidth

    const headerStyle = useMemo<CSSProperties>(
      () => (scrollbarWidth > 0 ? { paddingRight: `${scrollbarWidth}px` } : {}),
      [scrollbarWidth],
    )

    useEffect(() => {
      const frame = requestAnimationFrame(updateScrollbarWidth)
      return () => cancelAnimationFrame(frame)
    }, [
      containerHeight,
      displayedRows.length,
      columnWidths,
      visibleColumns.length,
      loading,
      updateScrollbarWidth,
    ])

    useEffect(() => {
      if (!bodyEl || typeof ResizeObserver === 'undefined') return
      const observer = new ResizeObserver(() => {
        requestAnimationFrame(updateScrollbarWidth)
      })
      observer.observe(bodyEl)
      return () => observer.disconnect()
    }, [bodyEl, updateScrollbarWidth])

    // 边缘线
    const [omitLastRowBottomBorder, setOmitLastRowBottomBorder] = useState(true)
    const [omitLastColumnRightBorder, setOmitLastColumnRightBorder] = useState(true)
    const edgeRafRef = useRef(0)
    const lastEdgeScrollLeftRef = useRef(-1)

    const syncTableEdgeBorders = useCallback(() => {
      const next = resolveTableEdgeBorderOmits(bodyElRef.current)
      setOmitLastRowBottomBorder((prev) =>
        prev === next.omitLastRowBottomBorder ? prev : next.omitLastRowBottomBorder,
      )
      setOmitLastColumnRightBorder((prev) =>
        prev === next.omitLastColumnRightBorder ? prev : next.omitLastColumnRightBorder,
      )
    }, [])

    const scheduleTableEdgeSync = useCallback(() => {
      if (edgeRafRef.current) return
      edgeRafRef.current = requestAnimationFrame(() => {
        edgeRafRef.current = 0
        syncTableEdgeBorders()
      })
    }, [syncTableEdgeBorders])

    useEffect(() => {
      const el = bodyEl
      if (!el || typeof ResizeObserver === 'undefined') {
        scheduleTableEdgeSync()
        return
      }
      const observer = new ResizeObserver(() => scheduleTableEdgeSync())
      observer.observe(el)
      const inner = el.firstElementChild
      if (inner) observer.observe(inner)
      scheduleTableEdgeSync()
      return () => observer.disconnect()
    }, [bodyEl, scheduleTableEdgeSync])

    useEffect(() => {
      scheduleTableEdgeSync()
    }, [
      displayedRows.length,
      columnWidths,
      containerHeight,
      loading,
      virtualScroll,
      scheduleTableEdgeSync,
    ])

    useEffect(() => {
      const el = bodyElRef.current
      if (!el) return
      if (scrollLeft === lastEdgeScrollLeftRef.current) return
      lastEdgeScrollLeftRef.current = scrollLeft

      const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth)
      let shouldMeasure = false
      if (maxLeft <= 0) {
        shouldMeasure = omitLastColumnRightBorder === false
      } else {
        const distToEnd = maxLeft - scrollLeft
        shouldMeasure =
          distToEnd <= 48 || (omitLastColumnRightBorder && distToEnd > 48)
      }
      if (shouldMeasure) scheduleTableEdgeSync()
    }, [scrollLeft, omitLastColumnRightBorder, scheduleTableEdgeSync])

    // 虚拟滚动
    const { renderRows, offsetTop, offsetBottom } = useVirtualScroll({
      displayedRows,
      virtualScroll,
      rowHeight,
      containerHeight,
      scrollTop,
      virtualBuffer,
      rowKey: rowKeyField,
      rowHeightKey,
    })

    // 列宽调整
    const [activeResizeHandleId, setActiveResizeHandleId] = useState<string | null>(null)
    const [isResizing, setIsResizing] = useState(false)
    const isResizingRef = useRef(false)
    const resizeSessionRef = useRef<ResizeSession | null>(null)
    const pinScrollRafRef = useRef(0)

    const onColumnResizeRef = useRef(onColumnResize)
    onColumnResizeRef.current = onColumnResize
    const onColumnResizingRef = useRef(onColumnResizing)
    onColumnResizingRef.current = onColumnResizing

    const setDraggingChrome = useCallback((active: boolean) => {
      document.body.style.cursor = active ? 'col-resize' : ''
      document.body.style.userSelect = active ? 'none' : ''
    }, [])

    const pinScrollBarsToRight = useCallback(() => {
      pinHorizontalScrollToRight(headerRef.current)
      pinHorizontalScrollToRight(bodyElRef.current)
    }, [])

    const schedulePinScrollRight = useCallback(() => {
      if (!resizeSessionRef.current?.pinScrollRight) return
      if (pinScrollRafRef.current) cancelAnimationFrame(pinScrollRafRef.current)
      pinScrollRafRef.current = requestAnimationFrame(() => {
        pinScrollRafRef.current = 0
        pinScrollBarsToRight()
      })
    }, [pinScrollBarsToRight])

    const afterWidthCommitted = useCallback(
      (pinRight: boolean) => {
        flushExpandFillUpdate()
        if (!pinRight) return
        requestAnimationFrame(() => schedulePinScrollRight())
      },
      [flushExpandFillUpdate, schedulePinScrollRight],
    )

    const resolveStartWidth = useCallback(
      (column: CwDataTableColumn, handleEl: HTMLElement | null): number => {
        const stored = columnWidthsRef.current[column.key]
        if (stored != null && Number.isFinite(stored) && stored > 0) return stored
        if (column.width != null && column.width > 0) return column.width

        const rowEl = handleEl?.parentElement?.parentElement
        const cellEl =
          (rowEl?.querySelector(
            `[data-cw-dt-col="${CSS.escape(column.key)}"]`,
          ) as HTMLElement | null) ?? handleEl?.parentElement
        const w = cellEl?.getBoundingClientRect().width
        return w != null && Number.isFinite(w) && w > 0 ? w : 100
      },
      [],
    )

    const detachListeners = useCallback(() => {
      window.removeEventListener('pointermove', onPointerMoveRef.current)
      window.removeEventListener('pointerup', endResizeRef.current)
      window.removeEventListener('pointercancel', endResizeRef.current)
      window.removeEventListener('blur', endResizeRef.current)

      const session = resizeSessionRef.current
      const el = session?.captureEl
      const id = session?.pointerId
      if (el) {
        el.removeEventListener('lostpointercapture', endResizeRef.current)
        if (id != null && el.hasPointerCapture?.(id)) {
          try {
            el.releasePointerCapture(id)
          } catch {
            /* already released */
          }
        }
      }
    }, [])

    const onPointerMoveRef = useRef<(event: PointerEvent) => void>(() => {})
    const endResizeRef = useRef<() => void>(() => {})

    const onPointerMove = useCallback(
      (event: PointerEvent) => {
        const session = resizeSessionRef.current
        if (!session) return
        const deltaX = event.clientX - session.startX
        const signedDelta = session.edge === 'start' ? -deltaX : deltaX
        const width = calculateColumnWidth(
          session.startWidth,
          signedDelta,
          session.column.minWidth,
          session.column.maxWidth,
        )
        setColumnWidths({
          ...columnWidthsRef.current,
          [session.column.key]: width,
        })
        onColumnResizingRef.current?.(session.column, width)
        afterWidthCommitted(session.pinScrollRight)
      },
      [setColumnWidths, afterWidthCommitted],
    )
    onPointerMoveRef.current = onPointerMove

    const endResize = useCallback(() => {
      if (!isResizingRef.current && !resizeSessionRef.current) return
      const active = resizeSessionRef.current
      if (active) {
        onColumnResizeRef.current?.(
          active.column,
          columnWidthsRef.current[active.column.key] ?? active.column.width ?? 100,
        )
      }

      const shouldPin = active?.pinScrollRight ?? false
      setDraggingChrome(false)
      detachListeners()
      resizeSessionRef.current = null
      isResizingRef.current = false
      setIsResizing(false)
      setActiveResizeHandleId(null)

      flushExpandFillUpdate()
      if (shouldPin) {
        requestAnimationFrame(() => {
          if (pinScrollRafRef.current) cancelAnimationFrame(pinScrollRafRef.current)
          pinScrollRafRef.current = requestAnimationFrame(() => {
            pinScrollRafRef.current = 0
            pinScrollBarsToRight()
          })
        })
      }
    }, [
      detachListeners,
      setDraggingChrome,
      flushExpandFillUpdate,
      pinScrollBarsToRight,
    ])
    endResizeRef.current = endResize

    const beginResize = useCallback(
      (input: {
        column: CwDataTableColumn
        edge: CwDataTableResizeEdge
        handleId: string
        event: PointerEvent
        handleEl: HTMLElement | null
      }) => {
        const { column, edge, handleId, event, handleEl } = input
        if (column.resizable === false || !resizable || event.button !== 0) return

        const scrollRoot = bodyElRef.current ?? headerRef.current
        resizeSessionRef.current = {
          column,
          edge,
          startX: event.clientX,
          startWidth: resolveStartWidth(column, handleEl),
          pinScrollRight: getHorizontalScrollMetrics(scrollRoot).atRightEnd,
          captureEl: handleEl,
          pointerId: null,
        }
        isResizingRef.current = true
        setIsResizing(true)
        setActiveResizeHandleId(handleId)
        setDraggingChrome(true)

        const session = resizeSessionRef.current
        const el = session.captureEl
        if (el && typeof event.pointerId === 'number' && el.setPointerCapture) {
          try {
            el.setPointerCapture(event.pointerId)
            session.pointerId = event.pointerId
            el.addEventListener('lostpointercapture', endResizeRef.current)
          } catch {
            session.pointerId = null
          }
        }

        window.addEventListener('pointermove', onPointerMoveRef.current)
        window.addEventListener('pointerup', endResizeRef.current)
        window.addEventListener('pointercancel', endResizeRef.current)
        window.addEventListener('blur', endResizeRef.current)

        event.preventDefault()
        event.stopPropagation()
      },
      [resizable, resolveStartWidth, setDraggingChrome],
    )

    useEffect(() => {
      return () => {
        if (pinScrollRafRef.current) cancelAnimationFrame(pinScrollRafRef.current)
        detachListeners()
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        resizeSessionRef.current = null
      }
    }, [detachListeners])

    const resolveHandleTarget = useCallback(
      (colIndex: number, side: CwDataTableResizeEdge) => {
        if (!resizable) return null
        return resolveResizeTargetAt(
          visibleColumnsRef.current,
          colIndex,
          side,
          getHorizontalScrollMetrics(headerRef.current ?? bodyElRef.current),
        )
      },
      [resizable],
    )

    const canShowResizeHandle = useCallback(
      (colIndex: number, side: CwDataTableResizeEdge) =>
        resolveHandleTarget(colIndex, side) != null,
      [resolveHandleTarget],
    )

    const onResizeHandlePointerDown = useCallback(
      (
        colIndex: number,
        side: CwDataTableResizeEdge,
        event: ReactPointerEvent<HTMLDivElement>,
      ) => {
        const target = resolveHandleTarget(colIndex, side)
        if (target) {
          beginResize({
            ...target,
            event: event.nativeEvent,
            handleEl: event.currentTarget,
          })
        }
      },
      [beginResize, resolveHandleTarget],
    )

    const handleResizeMouseEnter = useCallback((handleIdValue: string) => {
      if (!isResizingRef.current) setActiveResizeHandleId(handleIdValue)
    }, [])

    const handleResizeMouseLeave = useCallback(() => {
      if (!isResizingRef.current) setActiveResizeHandleId(null)
    }, [])

    // 从表体同步列宽
    const bodySyncObserverRef = useRef<ResizeObserver | null>(null)
    const firstRowObserverRef = useRef<ResizeObserver | null>(null)

    const attachFirstRowResizeObserver = useCallback(() => {
      firstRowObserverRef.current?.disconnect()
      firstRowObserverRef.current = null
      if (!syncWidthsFromBody || typeof ResizeObserver === 'undefined') return
      const body = bodyElRef.current
      if (!body) return
      const row = getFirstBodyDataRow(body)
      if (!row) return
      const observer = new ResizeObserver(() => scheduleWidthSyncRef.current())
      observer.observe(row)
      firstRowObserverRef.current = observer
    }, [syncWidthsFromBody])

    const runSyncColumnWidths = useCallback(() => {
      if (!syncWidthsFromBody || loading || modelValue.length === 0) return
      if (isResizingRef.current) return
      const body = bodyElRef.current
      if (!body) return
      const bodyRows = getAllBodyDataRows(body)
      const firstRow = bodyRows[0]
      if (!firstRow) return

      const headerRow = getHeaderRow(headerRef.current)
      const widths = { ...columnWidthsRef.current }

      const fitWrote = stretchFitColumnsToContainer
        ? layoutBoundedFitColumns(
            headerRow,
            bodyRows,
            visibleColumnsRef.current,
            widths,
            body.clientWidth,
          )
        : syncFitContentColumnWidths(
            headerRow,
            bodyRows,
            visibleColumnsRef.current,
            widths,
            body,
          )

      const syncFlex = () => {
        const flexWrote = syncFlexColumnWidthsFromBodyRow(
          firstRow,
          visibleColumnsRef.current,
          widths,
          {
            onlyWhenColumnHasNoWidth: true,
            expandFillColumns: expandFillColumnsRef.current,
            headerRow,
            bodyRoot: body,
          },
        )
        const wrote = fitWrote || flexWrote
        if (wrote) setColumnWidths(widths)
        attachFirstRowResizeObserver()
        if (wrote) {
          scheduleExpandFillUpdate()
          updateScrollbarWidthRef.current()
        }
      }

      if (fitWrote) {
        requestAnimationFrame(syncFlex)
      } else {
        syncFlex()
      }
    }, [
      syncWidthsFromBody,
      loading,
      modelValue.length,
      stretchFitColumnsToContainer,
      setColumnWidths,
      attachFirstRowResizeObserver,
      scheduleExpandFillUpdate,
    ])

    const scheduleWidthSync = useCallback(() => {
      if (syncRafRef.current) cancelAnimationFrame(syncRafRef.current)
      syncRafRef.current = requestAnimationFrame(() => {
        syncRafRef.current = 0
        runSyncColumnWidths()
      })
    }, [runSyncColumnWidths])

    const scheduleWidthSyncRef = useRef(scheduleWidthSync)
    scheduleWidthSyncRef.current = scheduleWidthSync
    syncRunRef.current = runSyncColumnWidths

    const prevColumnSignatureRef = useRef(columnKeysSignature(visibleColumns))
    useEffect(() => {
      const signature = columnKeysSignature(visibleColumns)
      if (signature !== prevColumnSignatureRef.current) {
        prevColumnSignatureRef.current = signature
        setColumnWidths({})
      }
      scheduleWidthSync()
    }, [visibleColumns, syncWidthsFromBody, loading, setColumnWidths, scheduleWidthSync])

    const prevModelHeadRef = useRef(modelValue[0])
    const prevModelTailRef = useRef(modelValue[modelValue.length - 1])
    const prevModelLengthRef = useRef(modelValue.length)
    useEffect(() => {
      const head = modelValue[0]
      const tail = modelValue[modelValue.length - 1]
      if (
        head === prevModelHeadRef.current &&
        tail === prevModelTailRef.current &&
        modelValue.length === prevModelLengthRef.current
      ) {
        return
      }
      prevModelHeadRef.current = head
      prevModelTailRef.current = tail
      prevModelLengthRef.current = modelValue.length
      scheduleWidthSync()
    }, [modelValue, scheduleWidthSync])

    const prevExpandFillRef = useRef(expandFillColumns)
    useEffect(() => {
      if (prevExpandFillRef.current !== expandFillColumns) {
        prevExpandFillRef.current = expandFillColumns
        if (expandFillColumns) {
          const widths = { ...columnWidthsRef.current }
          let changed = false
          for (const col of visibleColumnsRef.current) {
            if (isElasticFillColumn(col) && col.key in widths) {
              delete widths[col.key]
              changed = true
            }
          }
          if (changed) setColumnWidths(widths)
        }
      }
      scheduleWidthSync()
    }, [
      expandFillColumns,
      setColumnWidths,
      scheduleWidthSync,
    ])

    useEffect(() => {
      const el = bodyEl
      if (!el || typeof ResizeObserver === 'undefined') return
      bodySyncObserverRef.current?.disconnect()
      const observer = new ResizeObserver(() => scheduleWidthSyncRef.current())
      observer.observe(el)
      bodySyncObserverRef.current = observer
      requestAnimationFrame(attachFirstRowResizeObserver)
      return () => {
        observer.disconnect()
        if (bodySyncObserverRef.current === observer) bodySyncObserverRef.current = null
      }
    }, [bodyEl, attachFirstRowResizeObserver])

    useEffect(() => {
      scheduleWidthSync()
    }, [scheduleWidthSync])

    useEffect(() => {
      return () => {
        if (syncRafRef.current) cancelAnimationFrame(syncRafRef.current)
        bodySyncObserverRef.current?.disconnect()
        bodySyncObserverRef.current = null
        firstRowObserverRef.current?.disconnect()
        firstRowObserverRef.current = null
      }
    }, [])

    const prevExpandFillReminderRef = useRef(expandFillColumns)
    useEffect(() => {
      if (prevExpandFillReminderRef.current === expandFillColumns) return
      prevExpandFillReminderRef.current = expandFillColumns
      requestAnimationFrame(() => {
        cwDivHandleRef.current?.remeasure()
        runSyncColumnWidths()
        updateScrollbarWidthRef.current()
      })
    }, [expandFillColumns, runSyncColumnWidths])

    // 固定列重叠
    const [bodyScrollMetrics, setBodyScrollMetrics] = useState({
      scrollWidth: 0,
      clientWidth: 0,
    })

    const measureBodyOverflow = useCallback(() => {
      const el = bodyElRef.current
      setBodyScrollMetrics({
        scrollWidth: el?.scrollWidth ?? 0,
        clientWidth: el?.clientWidth ?? 0,
      })
    }, [])

    useEffect(() => {
      const el = bodyEl
      if (!el) {
        measureBodyOverflow()
        return
      }
      if (typeof ResizeObserver === 'undefined') {
        measureBodyOverflow()
        return
      }
      const observer = new ResizeObserver(() => measureBodyOverflow())
      observer.observe(el)
      const scrollRoot = getAllBodyDataRows(el).length > 0 ? el.firstElementChild : null
      if (scrollRoot instanceof HTMLElement) observer.observe(scrollRoot)
      measureBodyOverflow()
      return () => observer.disconnect()
    }, [bodyEl, measureBodyOverflow])

    useEffect(() => {
      const frame = requestAnimationFrame(measureBodyOverflow)
      return () => cancelAnimationFrame(frame)
    }, [visibleColumns, columnWidths, measureBodyOverflow])

    const leftFixedOverlaps =
      fixedSideHasWidth(visibleColumns, columnWidths, 'left') && scrollLeft > 0
    const rightFixedOverlaps = (() => {
      if (!fixedSideHasWidth(visibleColumns, columnWidths, 'right')) return false
      const overflow = bodyScrollMetrics.scrollWidth - bodyScrollMetrics.clientWidth
      if (overflow <= OVERFLOW_EPSILON) return false
      return scrollLeft < overflow - OVERFLOW_EPSILON
    })()

    // 排序
    const handleSort = useCallback(
      (column: CwDataTableColumn) => {
        if (column.sortable === false && !defaultSortable) return
        const nextOrder = calculateNextSortOrder(
          sortState?.key,
          sortState?.order,
          column.key,
        )
        const nextSortState: CwDataTableSortState | undefined = nextOrder
          ? { key: column.key, order: nextOrder }
          : undefined

        onUpdateSort?.({
          ...(config.sort ?? {}),
          state: nextSortState,
        })
        onSortChange?.(nextSortState)
      },
      [defaultSortable, sortState, config.sort, onUpdateSort, onSortChange],
    )

    const isColumnSortedAscFn = (column: CwDataTableColumn) => isSortedAsc(column, sortState)
    const isColumnSortedDescFn = (column: CwDataTableColumn) => isSortedDesc(column, sortState)

    // 排序按钮键盘
    const { isFocusVisible: isSortButtonFocusVisible, handleFocus, handleBlur } =
      useBrowserFocusVisible()
    const tabindex = 0

    const handleSortButtonFocus = (_event: ReactFocusEvent<HTMLDivElement>) => {
      handleFocus()
    }
    const handleSortButtonBlur = () => {
      handleBlur()
    }
    const handleSortButtonKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        const column = visibleColumns.find((c) => c.sortable !== false)
        if (column) handleSort(column)
      }
    }

    // 列选中
    const [internalSelectedKey, setInternalSelectedKey] = useState<string | undefined>(() => {
      if (columnSelectConfig?.defaultSelectedColumnKey) {
        return columnSelectConfig.defaultSelectedColumnKey
      }
      if (columnSelectRequired) return visibleColumns[0]?.key
      return undefined
    })

    useEffect(() => {
      if (columnSelectConfig?.selectedColumnKey !== undefined) {
        setInternalSelectedKey(columnSelectConfig.selectedColumnKey)
      }
    }, [columnSelectConfig?.selectedColumnKey])

    const selectedColumnKey = useMemo(() => {
      let key =
        columnSelectConfig?.selectedColumnKey !== undefined
          ? columnSelectConfig.selectedColumnKey
          : internalSelectedKey
      if (columnSelectRequired && !key) {
        key = visibleColumns[0]?.key
      }
      return key
    }, [
      columnSelectConfig?.selectedColumnKey,
      internalSelectedKey,
      columnSelectRequired,
      visibleColumns,
    ])

    const selectedColumn = useMemo(
      () =>
        selectedColumnKey
          ? visibleColumns.find((col) => col.key === selectedColumnKey)
          : undefined,
      [selectedColumnKey, visibleColumns],
    )

    const isColumnSelected = useCallback(
      (column: CwDataTableColumn) =>
        columnSelectEnabled && column.key === selectedColumnKey,
      [columnSelectEnabled, selectedColumnKey],
    )

    const handleColumnSelect = useCallback(
      (column: CwDataTableColumn) => {
        if (!columnSelectEnabled) return
        if (columnSelectRequired && column.key === selectedColumnKey) return

        const newKey = column.key === selectedColumnKey ? undefined : column.key

        if (columnSelectConfig?.selectedColumnKey === undefined) {
          setInternalSelectedKey(newKey)
        }

        onUpdateColumnSelect?.(newKey)
        onColumnSelectChange?.(newKey ? column : undefined)
      },
      [
        columnSelectEnabled,
        columnSelectRequired,
        selectedColumnKey,
        columnSelectConfig?.selectedColumnKey,
        onUpdateColumnSelect,
        onColumnSelectChange,
      ],
    )

    useEffect(() => {
      if (!columnSelectRequired || selectedColumnKey) return
      const firstColumn = visibleColumns[0]
      if (!firstColumn) return
      if (columnSelectConfig?.selectedColumnKey !== undefined) return
      setInternalSelectedKey(firstColumn.key)
      onColumnSelectChange?.(firstColumn)
    }, [
      columnSelectRequired,
      selectedColumnKey,
      visibleColumns,
      columnSelectConfig?.selectedColumnKey,
      onColumnSelectChange,
    ])

    // 列 hover
    const [hoveredColumnKey, setHoveredColumnKey] = useState<string | undefined>(undefined)

    const handleColumnMouseEnter = useCallback(
      (column: CwDataTableColumn) => {
        if (columnSelectEnabled) setHoveredColumnKey(column.key)
      },
      [columnSelectEnabled],
    )

    const handleColumnMouseLeave = useCallback(() => {
      if (columnSelectEnabled) setHoveredColumnKey(undefined)
    }, [columnSelectEnabled])

    const isColumnHovered = useCallback(
      (column: CwDataTableColumn) =>
        columnSelectEnabled && column.key === hoveredColumnKey,
      [columnSelectEnabled, hoveredColumnKey],
    )

    // 选中列水平居中
    const lastCenteredColumnKeyRef = useRef<string | undefined>(selectedColumn?.key)
    useEffect(() => {
      if (!selectedColumn || !columnSelectEnabled) return
      if (lastCenteredColumnKeyRef.current === selectedColumn.key) return
      lastCenteredColumnKeyRef.current = selectedColumn.key

      const body = bodyElRef.current
      const header = headerRef.current
      if (!body || !header) return

      const left = computeScrollLeftToCenterColumn(
        selectedColumn,
        visibleColumns,
        columnWidths,
        body.clientWidth,
        body.scrollWidth,
      )
      if (left === null) return

      body.scrollTo({ left, behavior: 'smooth' })
      header.scrollTo({ left, behavior: 'smooth' })
    }, [selectedColumn, columnSelectEnabled, visibleColumns, columnWidths])

    // 单元格 class 变体
    const bodyVariantsByKey = useMemo(() => {
      const map = new Map<string, ClassVariants>()
      for (const column of visibleColumns) {
        const base = getBodyCellClasses(
          column,
          visibleColumns,
          styles,
          leftFixedOverlaps,
          rightFixedOverlaps,
          false,
          false,
          omitLastColumnRightBorder,
        )
        const idle = base.concat('cursor-pointer')
        map.set(column.key, {
          base,
          idle,
          selected: idle.concat(styles.cellSelected),
          hovered: idle.concat(styles.cellHovered),
        })
      }
      return map
    }, [
      visibleColumns,
      styles,
      leftFixedOverlaps,
      rightFixedOverlaps,
      omitLastColumnRightBorder,
    ])

    const headerVariantsByKey = useMemo(() => {
      const map = new Map<string, ClassVariants>()
      for (const column of visibleColumns) {
        const base = getHeaderCellClasses(
          column,
          visibleColumns,
          styles,
          leftFixedOverlaps,
          rightFixedOverlaps,
          resizable,
          false,
          false,
          omitLastColumnRightBorder,
        )
        const idle = base.concat('cursor-pointer')
        map.set(column.key, {
          base,
          idle,
          selected: idle.concat(styles.headerCellSelected),
          hovered: idle.concat(styles.headerCellHovered),
        })
      }
      return map
    }, [
      visibleColumns,
      styles,
      leftFixedOverlaps,
      rightFixedOverlaps,
      resizable,
      omitLastColumnRightBorder,
    ])

    const pickVariant = useCallback(
      (map: Map<string, ClassVariants>, column: CwDataTableColumn) => {
        const entry = map.get(column.key)
        if (!entry) return []
        if (!columnSelectEnabled) return entry.base
        if (column.key === selectedColumnKey) return entry.selected
        if (column.key === hoveredColumnKey) return entry.hovered
        return entry.idle
      },
      [columnSelectEnabled, selectedColumnKey, hoveredColumnKey],
    )

    const getBodyCellClassList = useCallback(
      (column: CwDataTableColumn) => pickVariant(bodyVariantsByKey, column),
      [pickVariant, bodyVariantsByKey],
    )

    const getHeaderCellClassList = useCallback(
      (column: CwDataTableColumn) => pickVariant(headerVariantsByKey, column),
      [pickVariant, headerVariantsByKey],
    )

    // 列样式
    const leftoverShares = useMemo(
      () => computeLeftoverShares(visibleColumns, columnWidths, layoutContainerWidth),
      [visibleColumns, columnWidths, layoutContainerWidth],
    )

    const getColumnStyle = useCallback(
      (column: CwDataTableColumn) =>
        calculateColumnStyle(column, columnWidths, visibleColumns, {
          expandFillColumns,
          leftoverShares,
        }),
      [columnWidths, visibleColumns, expandFillColumns, leftoverShares],
    )

    // external-row 插槽辅助
    const getExternalRowColumnStyle = useCallback(
      (column: CwDataTableColumn) => mergeColumnStyleTransparentRight(getColumnStyle(column)),
      [getColumnStyle],
    )
    const getExternalCellStyle = useCallback(
      (column: CwDataTableColumn) =>
        mergeColumnStyleTransparentLateralBorders(getColumnStyle(column)),
      [getColumnStyle],
    )
    const getExternalRowBodyCellClasses = useCallback(
      (column: CwDataTableColumn) => {
        void hoveredColumnKey
        void selectedColumnKey
        return stripFixedBodyFirstBorderClasses(getBodyCellClassList(column))
      },
      [getBodyCellClassList, hoveredColumnKey, selectedColumnKey],
    )

    // 折叠表体
    const [bodyExpandedState, setBodyExpandedState] = useState(bodyExpandedProp ?? true)
    useEffect(() => {
      if (bodyExpandedProp !== undefined) setBodyExpandedState(bodyExpandedProp)
    }, [bodyExpandedProp])

    const collapsibleEffective = collapsibleBody && showHeader

    const setBodyExpanded = useCallback(
      (next: boolean) => {
        setBodyExpandedState(next)
        onUpdateBodyExpanded?.(next)
      },
      [onUpdateBodyExpanded],
    )

    const handleCollapsibleHeaderClick = (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!collapsibleEffective) return
      const el = event.target as HTMLElement | null
      if (!el) return
      if (el.closest('a[href], button, [role="button"]')) return
      setBodyExpanded(!bodyExpandedState)
    }

    const handleCollapsibleHeaderKeydown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!collapsibleEffective) return
      if (event.target !== event.currentTarget) return
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      setBodyExpanded(!bodyExpandedState)
    }

    const onHeaderCellSurfaceClick = (
      column: CwDataTableColumn,
      event: ReactMouseEvent<HTMLDivElement>,
    ) => {
      if (columnSelectEnabled) {
        event.stopPropagation()
        handleColumnSelect(column)
      }
    }

    const getHeaderProps = (column: CwDataTableColumn): Record<string, unknown> =>
      calculateHeaderProps(
        column,
        sortState,
        handleSort,
        columnSelectEnabled && isColumnSelected(column),
        columnSelectEnabled && isColumnHovered(column),
      )

    const renderHeaderContent = (column: CwDataTableColumn) => {
      if (typeof column.headerRender === 'function') {
        return (
          <CwDataTableHeaderRenderer
            column={column}
            sortState={sortState}
            onSort={handleSort}
            isSelected={columnSelectEnabled && isColumnSelected(column)}
            isHovered={columnSelectEnabled && isColumnHovered(column)}
          />
        )
      }

      const HeaderComponent = column.headerComponent
      if (HeaderComponent) {
        return <HeaderComponent {...getHeaderProps(column)} />
      }

      if (column.sortable !== false && (defaultSortable || column.sortable)) {
        const sortIconName = isColumnSortedAscFn(column)
          ? 'common--action--sort-asc-line'
          : isColumnSortedDescFn(column)
            ? 'common--action--sort-desc-line'
            : 'common--action--sort-line'
        return (
          <div
            role="button"
            tabIndex={tabindex}
            aria-label={`排序 ${column.title}`}
            className={[styles.sortButton, isSortButtonFocusVisible ? styles.sortButtonFocused : '']
              .filter(Boolean)
              .join(' ')}
            onClick={(event) => {
              event.stopPropagation()
              handleSort(column)
            }}
            onFocus={handleSortButtonFocus}
            onBlur={handleSortButtonBlur}
            onKeyDown={handleSortButtonKeyDown}
          >
            <span>{column.title}</span>
            <span className={styles.sortIcon} aria-hidden="true">
              <CwIcon name={sortIconName} prefix="icon" size={0.75} />
            </span>
          </div>
        )
      }

      return <span>{column.title}</span>
    }

    useImperativeHandle(
      ref,
      () => ({
        visibleColumns,
        columnWidths,
        scrollLeft,
        scrollTop,
        getColumnStyle,
        getBodyCellClasses: (column: CwDataTableColumn) => getBodyCellClassList(column),
        leftFixedOverlaps,
        rightFixedOverlaps,
        styles,
        headerRef: headerRef.current,
        bodyRef: bodyEl,
        requestSyncColumnWidthsFromBody: runSyncColumnWidths,
      }),
      [
        visibleColumns,
        columnWidths,
        scrollLeft,
        scrollTop,
        getColumnStyle,
        getBodyCellClassList,
        leftFixedOverlaps,
        rightFixedOverlaps,
        styles,
        bodyEl,
        runSyncColumnWidths,
      ],
    )

    const wrapperClass = bodyLayoutFill
      ? 'flex min-h-0 w-full flex-1 flex-col self-stretch'
      : 'flex w-full flex-col'

    const headerClass = [
      headerScrollClass,
      fixedHeader ? styles.headerFixed : '',
      'relative',
      collapsibleEffective ? 'cursor-pointer' : '',
      collapsibleEffective && !bodyExpandedState
        ? styles.headerCellBodyDividerOffWhenCollapsed
        : '',
    ]
      .filter(Boolean)
      .join(' ')

    const externalRowScope: CwDataTableExternalRowScope = {
      visibleColumns,
      columnWidths,
      scrollLeft,
      getColumnStyle: getExternalRowColumnStyle,
      getBodyCellClasses: getExternalRowBodyCellClasses,
      getExternalCellStyle,
      leftFixedOverlaps,
      rightFixedOverlaps,
      styles,
      columnSelectEnabled,
      isColumnSelected,
      isColumnHovered,
      handleColumnSelect,
      handleColumnMouseEnter,
      handleColumnMouseLeave,
    }

    const bodyRowsElement = (
      <CwDataTableBodyRows
        virtualScroll={virtualScroll}
        renderRows={renderRows}
        offsetTop={offsetTop}
        offsetBottom={offsetBottom}
        visibleColumns={visibleColumns}
        tableStyles={tableStyles}
        omitLastRowBottomBorder={omitLastRowBottomBorder}
        columnSelectEnabled={columnSelectEnabled}
        selectedColumnKey={selectedColumnKey}
        hoveredColumnKey={hoveredColumnKey}
        getBodyCellClassList={getBodyCellClassList}
        getColumnStyle={getColumnStyle}
        handleColumnSelect={handleColumnSelect}
        handleColumnMouseEnter={handleColumnMouseEnter}
        handleColumnMouseLeave={handleColumnMouseLeave}
        lifecycle={lifecycle}
        treeEnabled={treeEnabled}
        indentSize={treeIndentSize}
        texts={texts}
        isIndentColumn={isIndentColumn}
        getTreeRowMeta={getTreeRowMeta}
        toggleTreeExpand={toggleTreeExpand}
        showOverflowTooltip={showOverflowTooltip}
        overlay={bodyOverlaySlot}
      />
    )

    const bodyPanelElement = (
      <CwDataTableBodyPanel
        bodyShellClass={bodyShellClass}
        cwDivRootClass={cwDivRootClass}
        bodyCwDivViewportClass={bodyCwDivViewportClass}
        styles={styles}
        loading={loading}
        empty={displayedRows.length === 0}
        emptyText={texts.emptyText}
        loadingText={texts.loadingText}
        persistScrollbar={config.persistScrollbar === true}
        cwDivRef={attachCwDiv}
        onScroll={handleBodyScroll}
        emptySlot={emptySlot}
        loadingSlot={loadingSlot}
      >
        {bodyRowsElement}
      </CwDataTableBodyPanel>
    )

    return (
      <div className={[wrapperClass, className].filter(Boolean).join(' ')} {...rest}>
        {externalRowSlot ? (
          <div
            ref={externalRowRef}
            className="flex items-stretch border-l border-r border-b overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mb-2"
            style={{
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
            }}
            onScroll={handleExternalRowScroll}
          >
            {externalRowSlot(externalRowScope)}
          </div>
        ) : null}
        <div className={styles.root}>
          {showHeader ? (
            <div
              ref={headerRef}
              className={headerClass}
              style={headerStyle}
              tabIndex={collapsibleEffective ? 0 : undefined}
              aria-label={
                collapsibleEffective
                  ? bodyExpandedState
                    ? texts.collapseBodyCollapseAriaLabel
                    : texts.collapseBodyExpandAriaLabel
                  : undefined
              }
              onScroll={handleHeaderScroll}
              onClick={handleCollapsibleHeaderClick}
              onKeyDown={handleCollapsibleHeaderKeydown}
            >
              <div
                className={[tableStyles.scrollContent, headerOverlaySlot ? 'relative' : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className={styles.headerRow}>
                  {visibleColumns.map((column, colIndex) => (
                    <div
                      key={column.key}
                      data-cw-dt-col={column.key}
                      className={getHeaderCellClassList(column).filter(Boolean).join(' ')}
                      style={getColumnStyle(column)}
                      onClick={(event) => onHeaderCellSurfaceClick(column, event)}
                      onMouseEnter={() => handleColumnMouseEnter(column)}
                      onMouseLeave={handleColumnMouseLeave}
                    >
                      <div
                        className={
                          column.fitContent
                            ? styles.headerCellContentFit
                            : styles.headerCellContent
                        }
                      >
                        {renderHeaderContent(column)}
                      </div>
                      {canShowResizeHandle(colIndex, 'end') ? (
                        <div
                          className={[
                            styles.resizeHandle,
                            styles.resizeHandleEnd,
                            activeResizeHandleId === toResizeHandleId(column.key, 'end')
                              ? styles.resizeHandleHover
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={(event) => event.stopPropagation()}
                          onPointerDown={(event) =>
                            onResizeHandlePointerDown(colIndex, 'end', event)
                          }
                          onMouseEnter={() =>
                            handleResizeMouseEnter(toResizeHandleId(column.key, 'end'))
                          }
                          onMouseLeave={handleResizeMouseLeave}
                        />
                      ) : null}
                      {canShowResizeHandle(colIndex, 'start') ? (
                        <div
                          className={[
                            styles.resizeHandle,
                            styles.resizeHandleStart,
                            activeResizeHandleId === toResizeHandleId(column.key, 'start')
                              ? styles.resizeHandleHover
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={(event) => event.stopPropagation()}
                          onPointerDown={(event) =>
                            onResizeHandlePointerDown(colIndex, 'start', event)
                          }
                          onMouseEnter={() =>
                            handleResizeMouseEnter(toResizeHandleId(column.key, 'start'))
                          }
                          onMouseLeave={handleResizeMouseLeave}
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
                {headerOverlaySlot}
              </div>
            </div>
          ) : null}

          {collapsibleEffective ? (
            <div
              className={[
                styles.bodyCollapseShell,
                bodyExpandedState
                  ? styles.bodyCollapseShellOpen
                  : styles.bodyCollapseShellClosed,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles.bodyCollapseInner}>{bodyPanelElement}</div>
            </div>
          ) : (
            bodyPanelElement
          )}
        </div>
      </div>
    )
  },
)

export default CwDataTable
