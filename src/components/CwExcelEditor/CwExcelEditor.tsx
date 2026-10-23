import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  ChangeEvent,
  FocusEvent as ReactFocusEvent,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import { showCwContextMenu } from '../CwContextMenu'
import type { CwContextMenuItem } from '../CwContextMenu'
import { CwDataTable } from '../CwDataTable'
import type { CwDataTableColumn } from '../CwDataTable'
import ExcelMergeOverlay from './ExcelMergeOverlay'
import type { ExcelMergePiece } from './ExcelMergeOverlay'
import { excelEditorBase } from './styles'
import { defaultTexts } from './texts'
import type {
  CwExcelEditorEmits,
  CwExcelEditorHandle,
  CwExcelEditorProps,
  CwExcelWorkbook,
} from './types'
import { buildSheetRows, buildSheetTable } from './functions/buildExcelTable'
import {
  appendSheet,
  applyClipboardGrid,
  deleteSheetAt,
  duplicateSheetAt,
  insertSheetAt,
  renameSheetAt,
  writeCellDraft,
} from './functions/sheetEdits'
import {
  COL_LOOKAHEAD,
  COL_WIDTH,
  EDGE_GROW_INTERVAL,
  EDGE_SLACK,
  GUTTER_WIDTH,
  MIN_ROW_HEIGHT,
  MIN_SHEET_COLS,
  MIN_SHEET_ROWS,
  ROW_LOOKAHEAD,
  SHEET_COL_CHUNK,
  SHEET_ROW_CHUNK,
  SHEET_ROW_HEIGHT,
  anchorCell,
  cellCss,
  columnIndexFromKey,
  fitRowHeight,
  guessColumnRenderCount,
  planColumnWindow,
  scrollSpanIntoView,
  selectionLabel as formatSelectionLabel,
  sumWidths,
  visibleMergeBorders,
} from './functions/sheetMetrics'
import { isHistoryKey, useExcelHistory } from './hooks/useExcelHistory'
import {
  excelKeyboardOwner,
  cloneWorkbook,
  createBlankWorkbook,
  deleteSheetColumns,
  deleteSheetRows,
  formatCell,
  insertSheetColumn,
  insertSheetRow,
  mergeCovering,
  normalizeWorkbook,
  stepFromMerge,
} from './functions/workbook'
import {
  attachExcelSource,
  parseExcelSource,
  readExcelBytes,
  workbookToArrayBuffer,
  workbookToBlob,
} from './functions/workbookIo'

export interface CwExcelEditorComponentProps
  extends CwExcelEditorProps,
    CwExcelEditorEmits,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'className' | 'children' | 'onChange' | 'onPointerDown' | 'onContextMenu'
    > {
  className?: string
}

type CellPosition = { row: number; col: number }
type EditFocus = 'cell' | 'formula'
type CommitMove = 'stay' | 'down' | 'up' | 'left' | 'right'

/** Vue nextTick 的等价：等本轮 state 落地、DOM 画完再执行。 */
function afterRender(callback: () => void) {
  setTimeout(callback, 0)
}

/**
 * useState + 同步镜像 ref。Vue 的 ref 写入后立刻能读到新值；
 * React setState 之后同一事件里读 state 还是旧的，镜像 ref 用来复刻 `.value` 语义。
 */
function useMirroredState<T>(initial: T | (() => T)) {
  const [state, setState] = useState(initial)
  const ref = useRef(state)
  const set = useCallback((value: T | ((prev: T) => T)) => {
    const next = typeof value === 'function' ? (value as (prev: T) => T)(ref.current) : value
    ref.current = next
    setState(next)
  }, [])
  return [state, set, ref] as const
}

const CELL_ON = excelEditorBase.cellSelected.split(/\s+/).filter(Boolean)
const MERGE_ON = excelEditorBase.mergeSelected.split(/\s+/).filter(Boolean)
const AXIS_ON = excelEditorBase.axisSelected.split(/\s+/).filter(Boolean)

export const CwExcelEditor = forwardRef<CwExcelEditorHandle, CwExcelEditorComponentProps>(
  function CwExcelEditor(props, ref) {
    const {
      modelValue,
      src = null,
      fileName = '',
      activeSheet: activeSheetProp = 0,
      headerRow = true,
      mode = 'edit',
      readonly = false,
      texts: textsProp,
      onModelValueChange,
      onActiveSheetChange,
      onChange,
      className,
      ...rest
    } = props

    const previewing = mode === 'preview' || readonly

    const texts = useMemo(() => ({ ...defaultTexts, ...textsProp }), [textsProp])

    const [workbook, setWorkbook, workbookRef] = useMirroredState<CwExcelWorkbook>(() =>
      normalizeWorkbook(modelValue ?? createBlankWorkbook()),
    )
    const [sheetIndex, setSheetIndex, sheetIndexRef] = useMirroredState(activeSheetProp ?? 0)
    const [loading, setLoading] = useMirroredState(src != null && modelValue == null)
    const [error, setError] = useState('')
    const rootRef = useRef<HTMLDivElement | null>(null)
    const [selection, setSelection, selectionRef] = useMirroredState<CellPosition | null>(null)
    const [editing, setEditing, editingRef] = useMirroredState(false)
    const [draft, setDraftValue, draftRef] = useMirroredState('')
    const [typeover, setTypeover, typeoverRef] = useMirroredState<string | null>(null)
    const [editFocus, setEditFocus, editFocusRef] = useMirroredState<EditFocus>('cell')
    /** 只有进入或离开编辑时才让表格重画。方向键移动选中不走这里。 */
    const [gridEpoch, setGridEpoch, gridEpochRef] = useMirroredState(0)
    const editAtRef = useRef<CellPosition | null>(null)
    const [renamingSheet, setRenamingSheet, renamingSheetRef] = useMirroredState<number | null>(
      null,
    )
    const [renameDraft, setRenameDraft, renameDraftRef] = useMirroredState('')
    const renameCancelledRef = useRef(false)

    /** 拖过的列宽。没拖过的列用 COL_WIDTH。拖动中的那一列先记在 dragWidth，避免整表重画打断拖动。 */
    const [committedWidths, setCommittedWidths, committedWidthsRef] = useMirroredState<number[]>(
      [],
    )
    const [dragWidth, setDragWidth, dragWidthRef] = useMirroredState<{
      col: number
      width: number
    } | null>(null)
    /** 拖过的行高。没拖过的行用 SHEET_ROW_HEIGHT。 */
    const [committedRowHeights, setCommittedRowHeights, committedRowHeightsRef] = useMirroredState<
      number[]
    >([])
    const [dragRow, setDragRow, dragRowRef] = useMirroredState<{
      row: number
      height: number
    } | null>(null)

    function getActiveSheet() {
      return workbookRef.current.sheets[sheetIndexRef.current] ?? workbookRef.current.sheets[0]
    }
    const activeSheet = workbook.sheets[sheetIndex] ?? workbook.sheets[0]

    function computeBaseExtent(index = sheetIndexRef.current) {
      const sheet = workbookRef.current.sheets[index]
      const cells = sheet?.cells ?? []
      let rows = cells.length
      let cols = cells[0]?.length ?? 1
      for (const merge of sheet?.merges ?? []) {
        rows = Math.max(rows, merge.row + merge.rowspan)
        cols = Math.max(cols, merge.col + merge.colspan)
      }
      return {
        rows: Math.max(rows, MIN_SHEET_ROWS),
        cols: Math.max(cols, MIN_SHEET_COLS),
      }
    }

    const [viewRows, setViewRows, viewRowsRef] = useMirroredState(
      () => computeBaseExtent(sheetIndexRef.current).rows,
    )
    const [, setViewCols, viewColsRef] = useMirroredState(
      () => computeBaseExtent(sheetIndexRef.current).cols,
    )
    const [windowStart, setWindowStart, windowStartRef] = useMirroredState(0)
    const [columnRenderCount, setColumnRenderCount, columnRenderCountRef] = useMirroredState(() =>
      guessColumnRenderCount(),
    )
    /** 导入/换 sheet 后重挂载表格，避免 CwDataTable 缓存列宽覆盖 xlsx 列宽 */
    const [tableLayoutKey, setTableLayoutKey, tableLayoutKeyRef] = useMirroredState(0)

    function committedWidth(col: number) {
      const width = committedWidthsRef.current[col]
      return width && width > 0 ? width : COL_WIDTH
    }

    function layoutWidth(col: number) {
      const drag = dragWidthRef.current
      if (drag && drag.col === col) return drag.width
      return committedWidth(col)
    }

    function layoutLeft(col: number) {
      return GUTTER_WIDTH + sumWidths(0, col, layoutWidth)
    }

    function layoutHeight(row: number) {
      const drag = dragRowRef.current
      if (drag && drag.row === row) return drag.height
      const heights = committedRowHeightsRef.current
      const height = row < heights.length ? heights[row]! : 0
      if (height && height > 0) return height
      // 大表逐格量行高会在进入页面时卡死。没单独设过行高就用默认行高。
      if (sheetTooLargeToMeasure()) return SHEET_ROW_HEIGHT
      return fitRowHeight({
        sheet: getActiveSheet(),
        row,
        editing: editingRef.current,
        editAt: editAtRef.current,
        draft: draftRef.current,
        widthAt: layoutWidth,
      })
    }

    function sheetTooLargeToMeasure() {
      const sheet = getActiveSheet()
      const rows = sheet?.cells.length ?? 0
      const cols = sheet?.cells[0]?.length ?? 0
      return rows * Math.max(cols, 1) > 40_000
    }

    function layoutRowTop(sheetRow: number, bodyStart: number) {
      let top = 0
      for (let row = bodyStart; row < sheetRow; row += 1) top += layoutHeight(row)
      return top
    }

    function layoutRowSpanHeight(row: number, span: number) {
      let height = 0
      for (let index = 0; index < span; index += 1) height += layoutHeight(row + index)
      return height
    }

    function resetColumnWidths() {
      const sheet = workbookRef.current.sheets[sheetIndexRef.current]
      setCommittedWidths((sheet?.colWidths ?? []).slice())
      setCommittedRowHeights((sheet?.rowHeights ?? []).slice())
      setDragWidth(null)
      setDragRow(null)
    }

    function writeSheetMetric(kind: 'col' | 'row', index: number, value: number) {
      const next = cloneWorkbook(workbookRef.current)
      const sheet = next.sheets[sheetIndexRef.current]
      if (!sheet) return
      const source = (kind === 'col' ? sheet.colWidths : sheet.rowHeights) ?? []
      const metrics = source.slice()
      while (metrics.length <= index) metrics.push(0)
      metrics[index] = value
      if (kind === 'col') sheet.colWidths = metrics
      else sheet.rowHeights = metrics
      publish(next)
    }

    function shiftRowHeights(at: number, count: number, insert: boolean) {
      const next = committedRowHeightsRef.current.slice()
      if (insert) next.splice(at, 0, ...Array(count).fill(SHEET_ROW_HEIGHT))
      else next.splice(at, count)
      setCommittedRowHeights(next)
      setDragRow(null)
    }

    const stopRowResizeRef = useRef<(() => void) | null>(null)

    function startRowResize(row: number, event: PointerEvent) {
      if (previewing || event.button !== 0) return
      stopRowResizeRef.current?.()
      const startY = event.clientY
      const startHeight = layoutHeight(row)
      const previousCursor = document.body.style.cursor
      const previousSelect = document.body.style.userSelect
      document.body.style.cursor = 'row-resize'
      document.body.style.userSelect = 'none'
      const move = (ev: PointerEvent) => {
        setDragRow({
          row,
          height: Math.max(MIN_ROW_HEIGHT, Math.round(startHeight + ev.clientY - startY)),
        })
        scheduleMergeLayoutSync()
      }
      const end = (ev: PointerEvent) => {
        const height = Math.max(MIN_ROW_HEIGHT, Math.round(startHeight + ev.clientY - startY))
        setDragRow(null)
        const next = committedRowHeightsRef.current.slice()
        next[row] = height
        setCommittedRowHeights(next)
        writeSheetMetric('row', row, height)
        scheduleMergeLayoutSync()
        stop()
      }
      const stop = () => {
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', end)
        window.removeEventListener('pointercancel', end)
        document.body.style.cursor = previousCursor
        document.body.style.userSelect = previousSelect
        if (stopRowResizeRef.current === stop) stopRowResizeRef.current = null
      }
      stopRowResizeRef.current = stop
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', end)
      window.addEventListener('pointercancel', end)
    }

    function onColumnResizing(column: CwDataTableColumn, width: number) {
      const col = columnIndexFromKey(column.key)
      if (col == null || !Number.isFinite(width) || width <= 0) return
      setDragWidth({ col, width })
      scheduleMergeLayoutSync()
    }

    function onColumnResize(column: CwDataTableColumn, width: number) {
      const col = columnIndexFromKey(column.key)
      setDragWidth(null)
      if (col == null || !Number.isFinite(width) || width <= 0) return
      const next = committedWidthsRef.current.slice()
      next[col] = width
      setCommittedWidths(next)
      writeSheetMetric('col', col, width)
      scheduleMergeLayoutSync()
    }

    function shiftColumnWidths(at: number, count: number, insert: boolean) {
      const next = committedWidthsRef.current.slice()
      if (insert) next.splice(at, 0, ...Array(count).fill(COL_WIDTH))
      else next.splice(at, count)
      setCommittedWidths(next)
      setDragWidth(null)
    }

    function focusGrid() {
      const root = rootRef.current
      if (!root) return
      excelKeyboardOwner.root = root
      if (document.activeElement !== root) root.focus()
    }

    /** 编辑中按键落回表格时，把光标放回正在用的输入框末尾。 */
    function focusActiveEditor() {
      const root = rootRef.current
      if (!root) return
      const inputs = [...root.querySelectorAll('.cw-excel-input')]
      const input =
        editFocusRef.current === 'formula'
          ? inputs.find((el) => !el.closest('.cw-data-table, .cw-excel-merge-cell'))
          : inputs.find((el) => el.closest('.cw-data-table, .cw-excel-merge-cell'))
      if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) || input.readOnly)
        return
      input.focus()
      const end = input.value.length
      input.setSelectionRange(end, end)
    }

    function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
      const root = rootRef.current
      if (!root) return
      excelKeyboardOwner.root = root
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('input, textarea, select, button, a, [contenteditable="true"]')) return
      if (event.button === 2) {
        root.focus()
        return
      }
      // 取消 pointerdown 会吞掉后面的 click / dblclick，合并块就无法双击进入编辑。
      root.focus()
    }

    function anchor(index = sheetIndexRef.current) {
      const cells = workbookRef.current.sheets[index]?.cells ?? []
      return anchorCell(headerRow, cells.length)
    }

    function cancelEdit() {
      setEditing(false)
      setTypeover(null)
      setDraftValue('')
      resetDraftHistory()
      refreshGrid()
      focusGrid()
    }

    function refreshGrid() {
      const current = selectionRef.current
      editAtRef.current =
        editingRef.current && current ? { row: current.row, col: current.col } : null
      setGridEpoch(gridEpochRef.current + 1)
    }

    const {
      modelEcho,
      canUndo,
      canRedo,
      resetDraftHistory,
      setDraft,
      undoDraft,
      redoDraft,
      resetHistory,
      publish,
      undo,
      redo,
    } = useExcelHistory({
      getWorkbook: () => workbookRef.current,
      setWorkbook,
      getSheetIndex: () => sheetIndexRef.current,
      setSheetIndex,
      getSelection: () => selectionRef.current,
      setSelection,
      getEditing: () => editingRef.current,
      setEditing,
      getTypeover: () => typeoverRef.current,
      setTypeover,
      getDraft: () => draftRef.current,
      setDraftValue,
      getPreviewing: () => previewing,
      emitUpdateModelValue: (next) => onModelValueChange?.(next),
      emitUpdateActiveSheet: (index) => onActiveSheetChange?.(index),
      emitChange: (next) => onChange?.(next),
      anchor,
      cancelEdit,
      focusActiveEditor,
      resetColumnWidths,
      refreshGrid,
      scheduleMergeLayoutSync,
      focusGrid,
    })

    function onDocumentKeydown(event: KeyboardEvent) {
      const root = rootRef.current
      if (!root) return
      const active = document.activeElement
      const inside = !!active && root.contains(active)
      const idle = !active || active === document.body || active === document.documentElement
      if (!inside && !(idle && excelKeyboardOwner.root === root)) return
      const target = event.target
      const inField =
        target instanceof Element &&
        !!target.closest('input, textarea, select, button, a, [contenteditable="true"]')
      if (inField && editingRef.current && root.contains(target) && isHistoryKey(event)) {
        event.preventDefault()
        if (event.key.toLowerCase() === 'y' || event.shiftKey) redoDraft()
        else undoDraft()
        return
      }
      if (inField) return
      onGridKeydown(event)
    }

    const columnResizeObserverRef = useRef<ResizeObserver | null>(null)
    const closeContextMenuRef = useRef<(() => void) | null>(null)
    const ignoreEdgeGrowRef = useRef(0)
    const rowGrowAtRef = useRef(0)
    const colGrowAtRef = useRef(0)
    const paintedRef = useRef<HTMLElement[]>([])
    const paintedScrollBucketRef = useRef(-1)
    const frameHandleRef = useRef(0)
    const pendingFrameRef = useRef<{ row: number; col: number; scroll: boolean } | null>(null)
    const mergeLayoutFrameRef = useRef(0)

    /** 每次渲染都换成最新一批闭包，供 document 监听 / rAF / ResizeObserver 等稳定回调调用。 */
    const liveRef = useRef({
      onDocumentKeydown,
      onDocumentCopy,
      onDocumentCut,
      onDocumentPaste,
      sheetViewport,
      syncColumnWindow,
      syncMergeLayoutFromDom,
      paintSelection,
      revealInView,
      focusGrid,
      scheduleMergeLayoutSync,
      scheduleReveal,
    })
    liveRef.current = {
      onDocumentKeydown,
      onDocumentCopy,
      onDocumentCut,
      onDocumentPaste,
      sheetViewport,
      syncColumnWindow,
      syncMergeLayoutFromDom,
      paintSelection,
      revealInView,
      focusGrid,
      scheduleMergeLayoutSync,
      scheduleReveal,
    }

    useEffect(() => {
      const keydown = (event: KeyboardEvent) => liveRef.current.onDocumentKeydown(event)
      const copy = (event: ClipboardEvent) => liveRef.current.onDocumentCopy(event)
      const cut = (event: ClipboardEvent) => liveRef.current.onDocumentCut(event)
      const paste = (event: ClipboardEvent) => liveRef.current.onDocumentPaste(event)
      document.addEventListener('keydown', keydown)
      document.addEventListener('copy', copy)
      document.addEventListener('cut', cut)
      document.addEventListener('paste', paste)
      liveRef.current.focusGrid()
      const timer = setTimeout(() => {
        liveRef.current.scheduleMergeLayoutSync()
        const viewport = liveRef.current.sheetViewport()
        liveRef.current.syncColumnWindow(viewport?.scrollLeft ?? 0)
        if (!viewport || typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver(() => {
          liveRef.current.syncColumnWindow(viewport.scrollLeft)
        })
        observer.observe(viewport)
        columnResizeObserverRef.current = observer
      }, 0)
      return () => {
        clearTimeout(timer)
        columnResizeObserverRef.current?.disconnect()
        stopRowResizeRef.current?.()
        closeContextMenuRef.current?.()
        if (frameHandleRef.current) cancelAnimationFrame(frameHandleRef.current)
        if (mergeLayoutFrameRef.current) cancelAnimationFrame(mergeLayoutFrameRef.current)
        document.removeEventListener('keydown', keydown)
        document.removeEventListener('copy', copy)
        document.removeEventListener('cut', cut)
        document.removeEventListener('paste', paste)
        if (excelKeyboardOwner.root === rootRef.current) excelKeyboardOwner.root = null
      }
    }, [])

    const tableTexts = useMemo(
      () => ({
        emptyText: texts.emptyText,
        loadingText: texts.loadingText,
      }),
      [texts],
    )

    // watch(() => props.modelValue)（非 immediate）
    const firstModelValueEffect = useRef(true)
    useEffect(() => {
      if (firstModelValueEffect.current) {
        firstModelValueEffect.current = false
        return
      }
      const value = modelValue
      if (!value || value === workbookRef.current || modelEcho.active) return
      setEditing(false)
      setTypeover(null)
      setDraftValue('')
      resetDraftHistory()
      setWorkbook(normalizeWorkbook(value))
      clampSheet()
      resetColumnWidths()
      resetHistory()
      refreshGrid()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modelValue])

    // watch(() => props.activeSheet)（非 immediate）
    const firstActiveSheetEffect = useRef(true)
    useEffect(() => {
      if (firstActiveSheetEffect.current) {
        firstActiveSheetEffect.current = false
        return
      }
      if (activeSheetProp == null) return
      setSheetIndex(activeSheetProp)
      clampSheet()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSheetProp])

    // watch(() => props.src, { immediate: true })
    const prevSrcRef = useRef<typeof src>(undefined)
    useEffect(() => {
      const prev = prevSrcRef.current
      prevSrcRef.current = src
      if (src == null) return
      if (prev === undefined && modelValue) return
      void loadSource(src)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src])

    function cellTextAt(row: number, col: number) {
      const sheet = getActiveSheet()
      const merge = mergeCovering(sheet?.merges ?? [], row, col)
      const targetRow = merge?.row ?? row
      const targetCol = merge?.col ?? col
      return formatCell(sheet?.cells[targetRow]?.[targetCol] ?? null)
    }

    const selectedKey = (() => {
      const current = selection
      if (!current) return ''
      const merge = mergeCovering(activeSheet?.merges ?? [], current.row, current.col)
      const row = merge?.row ?? current.row
      const col = merge?.col ?? current.col
      return `${row}:${col}`
    })()

    const editingKey = editing ? selectedKey : ''

    const selectionLabelText = (() => {
      const current = selection
      if (!current) return ''
      return formatSelectionLabel(current.row, current.col, activeSheet?.merges ?? [])
    })()

    function mergePieces(edge: 'body' | 'header'): ExcelMergePiece[] {
      const sheet = activeSheet
      if (!sheet) return []
      const bodyStart = headerRow ? 1 : 0
      const pieces: ExcelMergePiece[] = []
      for (const merge of sheet.merges) {
        const anchorKey = `${merge.row}:${merge.col}`
        const text = formatCell(sheet.cells[merge.row]?.[merge.col] ?? null)
        const cellStyle = sheet.styles?.[merge.row]?.[merge.col]
        const align = cellStyle?.align ?? 'left'
        const css = cellCss(cellStyle)
        const border = visibleMergeBorders(sheet.styles ?? [], sheet.merges, merge)
        if (edge === 'header') {
          if (!headerRow || merge.row !== 0) continue
          pieces.push({
            key: `${anchorKey}:header`,
            anchorKey,
            row: merge.row,
            col: merge.col,
            showText: true,
            text,
            align,
            css,
            borderShadow: border.shadow,
            borderRight: border.right,
            borderBottom: border.bottom,
            edge,
            style: {
              top: '0',
              bottom: '0',
              left: `${layoutLeft(merge.col)}px`,
              width: `${sumWidths(merge.col, merge.col + merge.colspan, layoutWidth)}px`,
              ...(cellStyle?.fill ? { backgroundColor: cellStyle.fill } : {}),
              ...(border.rightColor
                ? {
                    '--cw-excel-br': border.rightColor,
                    '--cw-excel-br-width': `${border.rightWidth}px`,
                  }
                : {}),
            },
          })
          continue
        }
        const end = merge.row + merge.rowspan
        if (end <= bodyStart) continue
        const rowStart = Math.max(merge.row, bodyStart)
        pieces.push({
          key: `${anchorKey}:body`,
          anchorKey,
          row: merge.row,
          col: merge.col,
          showText: merge.row >= bodyStart,
          text,
          align,
          css,
          borderShadow: border.shadow,
          borderRight: border.right,
          borderBottom: border.bottom,
          edge,
          style: {
            top: `${layoutRowTop(rowStart, bodyStart)}px`,
            left: `${layoutLeft(merge.col)}px`,
            width: `${sumWidths(merge.col, merge.col + merge.colspan, layoutWidth)}px`,
            height: `${layoutRowSpanHeight(rowStart, end - rowStart)}px`,
            ...(cellStyle?.fill ? { backgroundColor: cellStyle.fill } : {}),
            ...(border.rightColor
              ? {
                  '--cw-excel-br': border.rightColor,
                  '--cw-excel-br-width': `${border.rightWidth}px`,
                }
              : {}),
          },
        })
      }
      return pieces
    }

    const [mergeLayoutOverrides, setMergeLayoutOverrides, mergeLayoutOverridesRef] =
      useMirroredState<Record<string, Record<string, string>>>({})

    function cellWrapRect(root: HTMLElement, row: number, col: number): DOMRect | null {
      const marker = root.querySelector(`[data-excel-row="${row}"][data-excel-col="${col}"]`)
      if (!(marker instanceof Element)) return null
      const wrap = marker.closest('.group > div')
      if (!(wrap instanceof HTMLElement)) return null
      return wrap.getBoundingClientRect()
    }

    function syncMergeLayoutFromDom() {
      const root = rootRef.current
      const sheet = getActiveSheet()
      if (!root || !sheet?.merges.length) {
        if (Object.keys(mergeLayoutOverridesRef.current).length > 0) setMergeLayoutOverrides({})
        return
      }
      const bodyStart = headerRow ? 1 : 0
      const next: Record<string, Record<string, string>> = {}
      const assign = (
        layerSelector: string,
        filter: (merge: { row: number; rowspan: number }) => boolean,
      ) => {
        const layer = root.querySelector(layerSelector)
        if (!(layer instanceof HTMLElement)) return
        const layerRect = layer.getBoundingClientRect()
        for (const merge of sheet.merges) {
          if (!filter(merge)) continue
          const anchorKey = `${merge.row}:${merge.col}`
          const tl = cellWrapRect(root, merge.row, merge.col)
          const br = cellWrapRect(
            root,
            merge.row + merge.rowspan - 1,
            merge.col + merge.colspan - 1,
          )
          if (!tl || !br) continue
          const top = Math.round(tl.top - layerRect.top)
          const left = Math.round(tl.left - layerRect.left)
          // 宽度按列宽累加，不用 DOM 右下角：虚拟列/右侧 pad 会把 br 量到表格外，横幅会多出一截。
          const width = sumWidths(merge.col, merge.col + merge.colspan, layoutWidth)
          const height = Math.round(br.bottom - tl.top)
          next[anchorKey] = {
            top: `${top}px`,
            left: `${left}px`,
            width: `${Math.max(0, width)}px`,
            height: `${Math.max(0, height)}px`,
          }
        }
      }
      assign('.cw-data-table > div:first-child .cw-excel-merge-layer', (m) => headerRow && m.row === 0)
      assign('.cw-div__viewport .cw-excel-merge-layer', (m) => m.row + m.rowspan > bodyStart)
      if (mergeLayoutMatches(mergeLayoutOverridesRef.current, next)) return
      setMergeLayoutOverrides(next)
    }

    function mergeLayoutMatches(
      prev: Record<string, Record<string, string>>,
      next: Record<string, Record<string, string>>,
    ) {
      const prevKeys = Object.keys(prev)
      const nextKeys = Object.keys(next)
      if (prevKeys.length !== nextKeys.length) return false
      for (const key of nextKeys) {
        const before = prev[key]
        const after = next[key]
        if (!before || !after) return false
        if (before.top !== after.top || before.left !== after.left) return false
        if (before.width !== after.width || before.height !== after.height) return false
      }
      return true
    }

    function scheduleMergeLayoutSync() {
      if (mergeLayoutFrameRef.current) cancelAnimationFrame(mergeLayoutFrameRef.current)
      mergeLayoutFrameRef.current = requestAnimationFrame(() => {
        mergeLayoutFrameRef.current = 0
        liveRef.current.syncMergeLayoutFromDom()
      })
    }

    function withMergeLayout(
      pieces: ExcelMergePiece[],
      overrides: Record<string, Record<string, string>>,
    ) {
      if (!Object.keys(overrides).length) return pieces
      return pieces.map((piece) => ({
        ...piece,
        style: overrides[piece.anchorKey]
          ? { ...piece.style, ...overrides[piece.anchorKey]! }
          : piece.style,
      }))
    }

    const headerPieces = withMergeLayout(mergePieces('header'), mergeLayoutOverrides)
    const bodyPieces = withMergeLayout(mergePieces('body'), mergeLayoutOverrides)

    function onMergeCommit(payload: { row: number; col: number; value: string; move: CommitMove }) {
      commitAt(payload.row, payload.col, payload.value, payload.move)
    }

    const selectionText = (() => {
      const current = selection
      if (!current) return ''
      return cellTextAt(current.row, current.col)
    })()

    function baseExtent(index = sheetIndexRef.current) {
      return computeBaseExtent(index)
    }

    function resetViewExtent(index = sheetIndexRef.current) {
      const extent = baseExtent(index)
      setViewRows(extent.rows)
      setViewCols(extent.cols)
      setWindowStart(0)
      resetColumnWidths()
      setTableLayoutKey(tableLayoutKeyRef.current + 1)
    }

    // watch(sheetIndex)（非 immediate）
    const firstSheetIndexEffect = useRef(true)
    useEffect(() => {
      if (firstSheetIndexEffect.current) {
        firstSheetIndexEffect.current = false
        return
      }
      resetViewExtent(sheetIndex)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sheetIndex])

    // watch（immediate）：内容变多时放大可视行列数
    const activeCells = activeSheet?.cells
    const activeMerges = activeSheet?.merges
    const extentSignature = useMemo(() => {
      let rows = activeCells?.length ?? 0
      let cols = activeCells?.[0]?.length ?? 0
      for (const merge of activeMerges ?? []) {
        rows = Math.max(rows, merge.row + merge.rowspan)
        cols = Math.max(cols, merge.col + merge.colspan)
      }
      return `${rows}:${cols}`
    }, [activeCells, activeMerges])
    useEffect(() => {
      const extent = baseExtent()
      if (viewRowsRef.current < extent.rows) setViewRows(extent.rows)
      if (viewColsRef.current < extent.cols) setViewCols(extent.cols)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [extentSignature])

    function ensureViewCovers(row: number, col: number) {
      if (row >= viewRowsRef.current - ROW_LOOKAHEAD) setViewRows(row + 1 + SHEET_ROW_CHUNK)
      if (col >= viewColsRef.current - COL_LOOKAHEAD) setViewCols(col + 1 + SHEET_COL_CHUNK)
    }

    function sheetColCount() {
      const cells = getActiveSheet()?.cells
      return Math.max(viewColsRef.current, cells?.[0]?.length ?? 1)
    }

    /** 视口里的列都挂上表头。走出视口再整窗平移，滚动条宽度仍按全部列计算。 */
    function syncColumnWindow(scrollLeft: number) {
      const viewport = sheetViewport()
      const planned = planColumnWindow({
        scrollLeft,
        viewWidth: viewport?.clientWidth || 0,
        sheetWidth: sheetColCount(),
        windowStart: windowStartRef.current,
        columnRenderCount: columnRenderCountRef.current,
        widthAt: committedWidth,
      })
      if (planned.columnRenderCount !== columnRenderCountRef.current)
        setColumnRenderCount(planned.columnRenderCount)
      if (planned.windowStart == null || planned.windowStart === windowStartRef.current) return
      setWindowStart(planned.windowStart)
      schedulePaint()
    }

    const tableRows = useMemo(
      () =>
        buildSheetRows({
          cells: activeSheet?.cells ?? [],
          headerRow,
          viewRows,
          heightAt: layoutHeight,
        }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        activeSheet,
        headerRow,
        viewRows,
        committedRowHeights,
        dragRow,
        committedWidths,
        dragWidth,
        editing,
        draft,
        gridEpoch,
      ],
    )

    const tableConfig = buildSheetTable({
      headerRow,
      previewing,
      gridEpoch,
      windowStart,
      columnRenderCount,
      sheetWidth: sheetColCount(),
      cells: activeSheet?.cells ?? [],
      merges: activeSheet?.merges ?? [],
      styles: activeSheet?.styles ?? [],
      draft,
      typeover,
      editFocus,
      editAt: editAtRef.current,
      selection: () => selectionRef.current,
      widthAt: committedWidth,
      selectCell,
      editCell,
      setDraft,
      cancelEdit,
      commitAt,
      startRowResize,
    })

    function clampSheet() {
      const last = Math.max(0, workbookRef.current.sheets.length - 1)
      if (sheetIndexRef.current > last) setSheetIndex(last)
      if (sheetIndexRef.current < 0) setSheetIndex(0)
    }

    function selectSheet(index: number) {
      setEditing(false)
      setTypeover(null)
      setSheetIndex(index)
      const next = anchor(index)
      setSelection(next)
      onActiveSheetChange?.(index)
      refreshGrid()
      focusGrid()
      scheduleReveal(next.row, next.col)
    }

    async function loadSource(source: NonNullable<CwExcelEditorProps['src']>) {
      setLoading(true)
      setError('')
      setEditing(false)
      setTypeover(null)
      setDraftValue('')
      setWorkbook(createBlankWorkbook())
      setSheetIndex(0)
      setSelection(anchor(0))
      resetViewExtent(0)
      try {
        const bytes = await readExcelBytes(source)
        const next = await parseExcelSource(bytes, fileName || undefined)
        attachExcelSource(next, bytes)
        setSheetIndex(0)
        publish(next, false)
        resetHistory()
        setSelection(anchor(0))
        resetViewExtent(0)
        refreshGrid()
        onActiveSheetChange?.(0)
      } catch {
        setError(texts.loadError)
      } finally {
        setLoading(false)
        afterRender(() => {
          liveRef.current.focusGrid()
          liveRef.current.scheduleMergeLayoutSync()
          const cell = selectionRef.current
          if (cell) liveRef.current.scheduleReveal(cell.row, cell.col)
        })
      }
    }

    function gridSize() {
      const cells = getActiveSheet()?.cells ?? []
      return {
        width: Math.max(viewColsRef.current, cells[0]?.length ?? 1),
        height: Math.max(viewRowsRef.current, cells.length),
      }
    }

    function placeSelection(row: number, col: number, reveal = false) {
      const targetRow = Math.max(0, row)
      const targetCol = Math.max(0, col)
      const { width, height } = gridSize()
      const clamped = {
        row: Math.min(targetRow, Math.max(0, height - 1)),
        col: Math.min(targetCol, Math.max(0, width - 1)),
      }
      const covered = mergeCovering(getActiveSheet()?.merges ?? [], clamped.row, clamped.col)
      const next = covered ? { row: covered.row, col: covered.col } : clamped
      const wasEditing = editingRef.current
      setSelection(next)
      setEditing(false)
      setTypeover(null)
      if (wasEditing) refreshGrid()
      focusGrid()
      if (reveal) scheduleReveal(next.row, next.col)
    }

    function sheetViewport(): HTMLElement | null {
      const viewport = rootRef.current?.querySelector('.cw-div__viewport')
      return viewport instanceof HTMLElement ? viewport : null
    }

    function pinScrollLeft(viewport: HTMLElement, left: number) {
      const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
      const next = Math.min(Math.max(0, left), max)
      if (Math.abs(viewport.scrollLeft - next) <= 1) return
      viewport.scrollLeft = next
    }

    /** 列宽落地可能晚一帧。连续几帧把滚动位置留在增长后的右端，并忽略由此触发的滚动。 */
    function keepHorizontalEnd(viewport: HTMLElement, baseScrollLeft: number, baseScrollWidth: number) {
      ignoreEdgeGrowRef.current += 1
      let frames = 0
      const step = () => {
        const grown = Math.max(0, viewport.scrollWidth - baseScrollWidth)
        pinScrollLeft(viewport, baseScrollLeft + grown)
        frames += 1
        if (frames < 3) {
          requestAnimationFrame(step)
          return
        }
        ignoreEdgeGrowRef.current = Math.max(0, ignoreEdgeGrowRef.current - 1)
      }
      requestAnimationFrame(step)
    }

    function paintSelection(row: number, col: number) {
      const root = rootRef.current
      if (!root) return
      for (const el of paintedRef.current) {
        el.removeAttribute('data-excel-on')
        el.classList.remove(...CELL_ON, ...MERGE_ON, ...AXIS_ON)
      }
      paintedRef.current = []
      const mark = (selector: string, classes: string[]) => {
        const el = root.querySelector(selector)
        if (!(el instanceof HTMLElement)) return
        el.setAttribute('data-excel-on', '1')
        el.classList.add(...classes)
        paintedRef.current.push(el)
      }
      const sheet = getActiveSheet()
      const merge = mergeCovering(sheet?.merges ?? [], row, col)
      const rowStart = merge?.row ?? row
      const rowEnd = merge ? merge.row + merge.rowspan : row + 1
      const colStart = merge?.col ?? col
      const colEnd = merge ? merge.col + merge.colspan : col + 1
      for (let index = rowStart; index < rowEnd; index += 1) {
        mark(`[data-excel-row="${index}"][data-excel-col="-1"]`, AXIS_ON)
      }
      for (let index = colStart; index < colEnd; index += 1) {
        mark(`[data-excel-row="-1"][data-excel-col="${index}"]`, AXIS_ON)
      }
      const anchorRow = merge?.row ?? row
      const anchorCol = merge?.col ?? col
      if (merge) {
        root.querySelectorAll(`[data-excel-merge="${anchorRow}:${anchorCol}"]`).forEach((node) => {
          if (!(node instanceof HTMLElement)) return
          node.setAttribute('data-excel-on', '1')
          node.classList.add(...MERGE_ON)
          paintedRef.current.push(node)
        })
      } else {
        mark(`[data-excel-row="${row}"][data-excel-col="${col}"]`, CELL_ON)
      }
    }

    function revealInView(row: number, col: number) {
      const viewport = sheetViewport()
      if (!viewport) return
      ignoreEdgeGrowRef.current += 1
      const bodyStart = headerRow ? 1 : 0
      const sheet = getActiveSheet()
      const merge = mergeCovering(sheet?.merges ?? [], row, col)
      const anchorRow = merge?.row ?? row
      const anchorCol = merge?.col ?? col
      const top = layoutRowTop(Math.max(bodyStart, anchorRow), bodyStart)
      const height = merge ? layoutRowSpanHeight(anchorRow, merge.rowspan) : layoutHeight(anchorRow)
      const cellLeft = layoutLeft(anchorCol)
      const cellWidth = merge
        ? sumWidths(anchorCol, anchorCol + merge.colspan, layoutWidth)
        : layoutWidth(anchorCol)
      viewport.scrollTop = scrollSpanIntoView(viewport.scrollTop, viewport.clientHeight, top, height)
      viewport.scrollLeft = scrollSpanIntoView(
        viewport.scrollLeft,
        Math.max(0, viewport.clientWidth - GUTTER_WIDTH),
        Math.max(0, cellLeft - GUTTER_WIDTH),
        cellWidth,
      )
      syncColumnWindow(viewport.scrollLeft)
      requestAnimationFrame(() => {
        ignoreEdgeGrowRef.current = Math.max(0, ignoreEdgeGrowRef.current - 1)
      })
    }

    /** 同一帧里的方向键只滚一次，跟到目标格。滚动过程中只补画选中框。 */
    function queueFrame(row: number, col: number, scroll: boolean) {
      const pending = pendingFrameRef.current
      if (pending) {
        pending.row = row
        pending.col = col
        pending.scroll ||= scroll
        return
      }
      pendingFrameRef.current = { row, col, scroll }
      frameHandleRef.current = requestAnimationFrame(() => {
        const job = pendingFrameRef.current
        pendingFrameRef.current = null
        frameHandleRef.current = 0
        if (!job) return
        liveRef.current.paintSelection(job.row, job.col)
        if (job.scroll) liveRef.current.revealInView(job.row, job.col)
      })
    }

    function schedulePaint() {
      const current = selectionRef.current
      if (current) queueFrame(current.row, current.col, false)
    }

    function scheduleReveal(row: number, col: number) {
      queueFrame(row, col, true)
    }

    // watch：选中 / 合并数 / gridEpoch 变化后补画选中框
    const paintSignature = `${selection?.row ?? ''}:${selection?.col ?? ''}:${
      activeSheet?.merges?.length ?? 0
    }:${gridEpoch}`
    useEffect(() => {
      schedulePaint()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paintSignature])

    // watch：sheet / 列窗 / 合并 / 宽高变化后同步合并块布局
    const mergeWatchSignature = [
      sheetIndex,
      windowStart,
      activeSheet?.merges?.length ?? 0,
      gridEpoch,
      committedWidths.length,
      ...committedWidths.slice(0, 32),
      ...committedRowHeights.slice(0, 32),
    ].join(',')
    useEffect(() => {
      scheduleMergeLayoutSync()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mergeWatchSignature])

    function hitCell(event: { target: EventTarget | null }) {
      const target = event.target
      if (!(target instanceof Element)) return null
      const cell = target.closest('[data-excel-row]')
      if (!(cell instanceof HTMLElement)) return null
      const row = Number(cell.dataset.excelRow)
      const col = Number(cell.dataset.excelCol)
      if (!Number.isFinite(row) || !Number.isFinite(col)) return null
      return { row, col }
    }

    function onContextMenu(event: ReactMouseEvent<HTMLDivElement>) {
      const target = event.target
      if (!(target instanceof Element) || !rootRef.current?.contains(target)) return
      const sheetTab = target.closest('[data-excel-sheet]')
      if (sheetTab instanceof HTMLElement) {
        event.preventDefault()
        const index = Number(sheetTab.dataset.excelSheet)
        if (Number.isFinite(index)) openSheetMenu(event.nativeEvent, index)
        return
      }
      if (target.closest('input, textarea, button, a')) return
      event.preventDefault()
      const hit = hitCell(event)
      const fallback = selectionRef.current ?? anchor()
      const row = hit && hit.row >= 0 ? hit.row : fallback.row
      const col = hit && hit.col >= 0 ? hit.col : fallback.col
      placeSelection(row, col)
      const readOnly = previewing
      const items: CwContextMenuItem[] = [
        { key: 'undo', label: texts.undo, shortcut: 'Ctrl+Z', disabled: readOnly || !canUndo() },
        {
          key: 'redo',
          label: texts.redo,
          shortcut: 'Ctrl+Y',
          disabled: readOnly || !canRedo(),
          dividerAfter: true,
        },
        { key: 'cut', label: texts.cut, shortcut: 'Ctrl+X', disabled: readOnly },
        { key: 'copy', label: texts.copy, shortcut: 'Ctrl+C' },
        {
          key: 'paste',
          label: texts.paste,
          shortcut: 'Ctrl+V',
          disabled: readOnly,
          dividerAfter: true,
        },
        { key: 'insert-row-above', label: texts.insertRowAbove, disabled: readOnly },
        { key: 'insert-row-below', label: texts.insertRowBelow, disabled: readOnly },
        { key: 'insert-col-left', label: texts.insertColLeft, disabled: readOnly },
        {
          key: 'insert-col-right',
          label: texts.insertColRight,
          disabled: readOnly,
          dividerAfter: true,
        },
        { key: 'clear', label: texts.clear, shortcut: 'Delete', disabled: readOnly },
        { key: 'delete-row', label: texts.deleteRow, danger: true, disabled: readOnly },
        { key: 'delete-col', label: texts.deleteColumn, danger: true, disabled: readOnly },
      ]
      closeContextMenuRef.current?.()
      const handle = showCwContextMenu({
        x: event.clientX,
        y: event.clientY,
        appearance: 'plain',
        items,
        onSelect: (key) => runContextAction(key, row, col),
        onClose: () => {
          if (closeContextMenuRef.current === handle.close) closeContextMenuRef.current = null
        },
      })
      closeContextMenuRef.current = handle.close
    }

    function runContextAction(key: string, row: number, col: number) {
      if (key === 'undo') {
        undo()
        return
      }
      if (key === 'redo') {
        redo()
        return
      }
      if (key === 'copy') {
        void copyCell(row, col)
        return
      }
      if (previewing) return
      if (key === 'cut') {
        void copyCell(row, col).then(() => commitAt(row, col, '', 'stay'))
        return
      }
      if (key === 'paste') {
        void pasteFromClipboard()
        return
      }
      if (key === 'clear') {
        commitAt(row, col, '', 'stay')
        return
      }
      const span = mergeCovering(getActiveSheet()?.merges ?? [], row, col)
      if (key === 'insert-row-above') insertRow(row)
      else if (key === 'insert-row-below') insertRow(row + (span?.rowspan ?? 1))
      else if (key === 'insert-col-left') insertColumn(col)
      else if (key === 'insert-col-right') insertColumn(col + (span?.colspan ?? 1))
      else if (key === 'delete-row') deleteRow(row)
      else if (key === 'delete-col') deleteColumn(col)
    }

    async function copyCell(row: number, col: number) {
      try {
        await navigator.clipboard.writeText(cellTextAt(row, col))
      } catch {
        // 浏览器拒绝剪贴板时，Ctrl+C 仍走 copy 事件
      }
    }

    async function pasteFromClipboard() {
      try {
        pasteGrid(await navigator.clipboard.readText())
      } catch {
        // 无剪贴板权限时不改表格
      }
    }

    function mutateSheet(change: (sheet: CwExcelWorkbook['sheets'][number]) => void) {
      const next = cloneWorkbook(workbookRef.current)
      const sheet = next.sheets[sheetIndexRef.current]
      if (!sheet) return
      change(sheet)
      publish(next)
    }

    function selectedSpan(row: number, col: number) {
      return mergeCovering(getActiveSheet()?.merges ?? [], row, col)
    }

    function insertRow(at: number) {
      shiftRowHeights(at, 1, true)
      mutateSheet((sheet) => insertSheetRow(sheet, at))
      placeSelection(at, selectionRef.current?.col ?? 0)
    }

    function deleteRow(at: number) {
      const merge = selectedSpan(at, selectionRef.current?.col ?? 0)
      const count = merge && merge.row === at ? merge.rowspan : 1
      shiftRowHeights(at, count, false)
      mutateSheet((sheet) => deleteSheetRows(sheet, at, count))
      const height = workbookRef.current.sheets[sheetIndexRef.current]?.cells.length ?? 1
      placeSelection(Math.min(at, Math.max(0, height - 1)), selectionRef.current?.col ?? 0)
    }

    function insertColumn(at: number) {
      shiftColumnWidths(at, 1, true)
      mutateSheet((sheet) => insertSheetColumn(sheet, at))
      placeSelection(selectionRef.current?.row ?? 0, at)
    }

    function deleteColumn(at: number) {
      const merge = selectedSpan(selectionRef.current?.row ?? 0, at)
      const count = merge && merge.col === at ? merge.colspan : 1
      shiftColumnWidths(at, count, false)
      mutateSheet((sheet) => deleteSheetColumns(sheet, at, count))
      const width = workbookRef.current.sheets[sheetIndexRef.current]?.cells[0]?.length ?? 1
      placeSelection(selectionRef.current?.row ?? 0, Math.min(at, Math.max(0, width - 1)))
    }

    function onTableScroll(scrollTop: number, scrollLeft: number) {
      closeContextMenuRef.current?.()
      syncColumnWindow(scrollLeft)
      // 合并块画在滚动内容里，跟着内容走，不必每个滚动像素重测。
      // 选中框在行被虚拟列表换掉之后补一次即可。
      const bucket = Math.floor(scrollTop / SHEET_ROW_HEIGHT)
      if (bucket !== paintedScrollBucketRef.current) {
        paintedScrollBucketRef.current = bucket
        schedulePaint()
      }
      if (ignoreEdgeGrowRef.current > 0) return
      const viewport = sheetViewport()
      if (!viewport) return
      const now = performance.now()
      if (
        scrollTop > 0 &&
        viewport.scrollHeight - scrollTop - viewport.clientHeight < EDGE_SLACK &&
        now - rowGrowAtRef.current >= EDGE_GROW_INTERVAL
      ) {
        rowGrowAtRef.current = now
        setViewRows(viewRowsRef.current + SHEET_ROW_CHUNK)
      }
      const slackRight = viewport.scrollWidth - scrollLeft - viewport.clientWidth
      if (scrollLeft > 0 && slackRight <= 1 && now - colGrowAtRef.current >= EDGE_GROW_INTERVAL) {
        colGrowAtRef.current = now
        const widthBefore = viewport.scrollWidth
        setViewCols(viewColsRef.current + SHEET_COL_CHUNK)
        keepHorizontalEnd(viewport, scrollLeft, widthBefore)
      }
    }

    function selectCell(row: number, col: number) {
      placeSelection(row, col)
    }

    function editCell(row: number, col: number, initial?: string, focus: EditFocus = 'cell') {
      if (previewing) return
      ensureViewCovers(row, col)
      const covered = mergeCovering(getActiveSheet()?.merges ?? [], row, col)
      setSelection(covered ? { row: covered.row, col: covered.col } : { row, col })
      resetDraftHistory()
      setDraftValue(initial ?? cellTextAt(row, col))
      setTypeover(initial ?? null)
      setEditFocus(focus)
      setEditing(true)
      refreshGrid()
    }

    function commitAt(row: number, col: number, text: string, move: CommitMove) {
      const next = cloneWorkbook(workbookRef.current)
      const sheet = next.sheets[sheetIndexRef.current]
      if (!sheet) return
      if (writeCellDraft(sheet, row, col, text)) publish(next)
      const target =
        move === 'stay'
          ? { row, col }
          : stepFromMerge(next.sheets[sheetIndexRef.current]?.merges ?? [], row, col, move)
      placeSelection(target.row, target.col, move !== 'stay')
    }

    function onFormulaFocus() {
      if (previewing || editingRef.current) return
      const current = selectionRef.current ?? anchor()
      editCell(current.row, current.col, undefined, 'formula')
    }

    function onFormulaInput(event: ChangeEvent<HTMLInputElement>) {
      if (previewing) return
      const value = event.target.value
      if (!editingRef.current) {
        const current = selectionRef.current ?? anchor()
        editCell(current.row, current.col, value, 'formula')
        return
      }
      setDraft(value)
    }

    function onFormulaKeydown(event: ReactKeyboardEvent<HTMLInputElement>) {
      if (!editingRef.current) return
      const current = selectionRef.current
      if (!current) return
      if (event.key === 'Enter') {
        event.preventDefault()
        event.stopPropagation()
        commitAt(current.row, current.col, draftRef.current, event.shiftKey ? 'up' : 'down')
      } else if (event.key === 'Tab') {
        event.preventDefault()
        event.stopPropagation()
        commitAt(current.row, current.col, draftRef.current, event.shiftKey ? 'left' : 'right')
      } else if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        cancelEdit()
      }
    }

    function onFormulaBlur(event: ReactFocusEvent<HTMLInputElement>) {
      if (!editingRef.current) return
      const next = event.relatedTarget
      if (next instanceof Element && next.closest('.cw-excel-input')) return
      const current = selectionRef.current
      if (!current) return
      commitAt(current.row, current.col, draftRef.current, 'stay')
    }

    function clipboardOwns(event: Event) {
      const root = rootRef.current
      if (!root) return false
      const active = document.activeElement
      const inside = !!active && root.contains(active)
      const idle = !active || active === document.body || active === document.documentElement
      if (!inside && !(idle && excelKeyboardOwner.root === root)) return false
      const target = event.target
      return !(
        target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]')
      )
    }

    function onDocumentCopy(event: ClipboardEvent) {
      if (!clipboardOwns(event)) return
      const current = selectionRef.current ?? anchor()
      event.preventDefault()
      event.clipboardData?.setData('text/plain', cellTextAt(current.row, current.col))
    }

    function onDocumentCut(event: ClipboardEvent) {
      if (!clipboardOwns(event) || previewing) return
      const current = selectionRef.current ?? anchor()
      event.preventDefault()
      event.clipboardData?.setData('text/plain', cellTextAt(current.row, current.col))
      commitAt(current.row, current.col, '', 'stay')
    }

    function onDocumentPaste(event: ClipboardEvent) {
      if (!clipboardOwns(event) || previewing) return
      const text = event.clipboardData?.getData('text/plain') ?? ''
      event.preventDefault()
      pasteGrid(text)
    }

    function pasteGrid(text: string) {
      const origin = selectionRef.current ?? anchor()
      const next = cloneWorkbook(workbookRef.current)
      const sheet = next.sheets[sheetIndexRef.current]
      if (!sheet) return
      const applied = applyClipboardGrid(sheet, origin.row, origin.col, text)
      if (!applied) return
      if (applied.changed) publish(next)
      ensureViewCovers(origin.row + applied.rows - 1, origin.col + applied.cols - 1)
      placeSelection(origin.row, origin.col)
    }

    function onGridKeydown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && !event.altKey) {
        const key = event.key.toLowerCase()
        if (key === 'z') {
          event.preventDefault()
          if (event.shiftKey) redo()
          else undo()
          return
        }
        if (key === 'y') {
          event.preventDefault()
          redo()
          return
        }
      }
      const current = selectionRef.current ?? anchor()
      if (!selectionRef.current) setSelection(current)
      const go = (row: number, col: number) => {
        event.preventDefault()
        if (editingRef.current) {
          afterRender(focusActiveEditor)
          return
        }
        placeSelection(row, col, true)
      }
      const merges = getActiveSheet()?.merges ?? []
      if (event.key === 'ArrowDown') {
        const next = stepFromMerge(merges, current.row, current.col, 'down')
        return go(next.row, next.col)
      }
      if (event.key === 'ArrowUp') {
        const next = stepFromMerge(merges, current.row, current.col, 'up')
        return go(next.row, next.col)
      }
      if (event.key === 'ArrowRight') {
        const next = stepFromMerge(merges, current.row, current.col, 'right')
        return go(next.row, next.col)
      }
      if (event.key === 'ArrowLeft') {
        const next = stepFromMerge(merges, current.row, current.col, 'left')
        return go(next.row, next.col)
      }
      if (event.key === 'Enter') {
        const next = stepFromMerge(merges, current.row, current.col, event.shiftKey ? 'up' : 'down')
        return go(next.row, next.col)
      }
      if (event.key === 'Tab') {
        const next = stepFromMerge(merges, current.row, current.col, event.shiftKey ? 'left' : 'right')
        return go(next.row, next.col)
      }
      if (event.key === 'F2') {
        event.preventDefault()
        if (editingRef.current) {
          afterRender(focusActiveEditor)
          return
        }
        editCell(current.row, current.col)
        return
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        if (previewing) return
        if (editingRef.current) {
          setDraftValue(event.key === 'Backspace' ? draftRef.current.slice(0, -1) : '')
          afterRender(focusActiveEditor)
          return
        }
        commitAt(current.row, current.col, '', 'stay')
        return
      }
      if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.isComposing
      ) {
        event.preventDefault()
        if (editingRef.current) {
          // 输入框还没接住焦点时，数字会一格一格被替换。接在草稿后面。
          setDraft(draftRef.current + event.key)
          afterRender(focusActiveEditor)
          return
        }
        editCell(current.row, current.col, event.key)
      }
    }

    function openSheetMenu(event: MouseEvent, index: number) {
      selectSheet(index)
      const readOnly = previewing
      const onlySheet = workbookRef.current.sheets.length <= 1
      const items: CwContextMenuItem[] = [
        { key: 'insert-sheet', label: texts.insertSheet, disabled: readOnly },
        {
          key: 'delete-sheet',
          label: texts.deleteSheet,
          danger: true,
          disabled: readOnly || onlySheet,
        },
        { key: 'rename-sheet', label: texts.renameSheet, disabled: readOnly },
        { key: 'duplicate-sheet', label: texts.duplicateSheet, disabled: readOnly },
      ]
      closeContextMenuRef.current?.()
      const handle = showCwContextMenu({
        x: event.clientX,
        y: event.clientY,
        appearance: 'plain',
        items,
        onSelect: (key) => runSheetAction(key, index),
        onClose: () => {
          if (closeContextMenuRef.current === handle.close) closeContextMenuRef.current = null
        },
      })
      closeContextMenuRef.current = handle.close
    }

    function runSheetAction(key: string, index: number) {
      if (previewing) return
      if (key === 'insert-sheet') insertSheet(index)
      else if (key === 'delete-sheet') deleteSheet(index)
      else if (key === 'rename-sheet') startRename(index)
      else if (key === 'duplicate-sheet') duplicateSheet(index)
    }

    function insertSheet(at: number) {
      const created = insertSheetAt(workbookRef.current, at)
      publish(created.workbook)
      selectSheet(created.index)
    }

    function deleteSheet(index: number) {
      const created = deleteSheetAt(workbookRef.current, index)
      if (!created) return
      publish(created.workbook)
      selectSheet(created.index)
    }

    function duplicateSheet(index: number) {
      const created = duplicateSheetAt(workbookRef.current, index)
      if (!created) return
      publish(created.workbook)
      selectSheet(created.index)
    }

    function startRename(index: number) {
      if (previewing || !workbookRef.current.sheets[index]) return
      renameCancelledRef.current = false
      setRenamingSheet(index)
      setRenameDraft(workbookRef.current.sheets[index]!.name)
      afterRender(() => {
        const input = rootRef.current?.querySelector('[data-excel-rename]')
        if (!(input instanceof HTMLInputElement)) return
        input.focus()
        input.select()
      })
    }

    function cancelRename() {
      renameCancelledRef.current = true
      setRenamingSheet(null)
    }

    function commitRename() {
      const index = renamingSheetRef.current
      if (renameCancelledRef.current || index == null) {
        renameCancelledRef.current = false
        return
      }
      setRenamingSheet(null)
      const next = renameSheetAt(workbookRef.current, index, renameDraftRef.current)
      if (!next) return
      publish(next)
    }

    function addSheet() {
      const created = appendSheet(workbookRef.current)
      publish(created.workbook)
      selectSheet(created.index)
    }

    useImperativeHandle(
      ref,
      () => ({
        getWorkbook: () => cloneWorkbook(workbookRef.current),
        undo,
        redo,
        toBlob: () => workbookToBlob(workbookRef.current),
        toArrayBuffer: () => workbookToArrayBuffer(workbookRef.current),
      }),
      // undo/redo 内部只读写 ref，首渲染的闭包永久有效
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    )

    return (
      <div
        {...rest}
        ref={rootRef}
        tabIndex={0}
        className={[excelEditorBase.root, className ?? ''].filter(Boolean).join(' ')}
        onPointerDown={onPointerDown}
        onContextMenu={onContextMenu}
      >
        {error ? (
          <div className={excelEditorBase.toolbar}>
            <span className={excelEditorBase.statusError}>{error}</span>
          </div>
        ) : (
          <div className={excelEditorBase.formulaBar}>
            <div className={excelEditorBase.nameBox}>{selectionLabelText}</div>
            <span className={excelEditorBase.formulaFx}>fx</span>
            <input
              className={excelEditorBase.formulaInput}
              readOnly={previewing}
              value={editing ? draft : selectionText}
              onFocus={onFormulaFocus}
              onChange={onFormulaInput}
              onKeyDown={onFormulaKeydown}
              onBlur={onFormulaBlur}
            />
          </div>
        )}

        <CwDataTable
          key={tableLayoutKey}
          className={excelEditorBase.table}
          config={tableConfig}
          modelValue={tableRows}
          texts={tableTexts}
          loading={loading}
          onScroll={onTableScroll}
          onColumnResizing={onColumnResizing}
          onColumnResize={onColumnResize}
          headerOverlaySlot={
            headerPieces.length ? (
              <ExcelMergeOverlay
                pieces={headerPieces}
                selectedKey={selectedKey}
                editingKey={editingKey}
                draft={draft}
                typeover={typeover}
                autofocus={editFocus === 'cell'}
                readonly={previewing}
                onSelect={selectCell}
                onEdit={editCell}
                onInput={setDraft}
                onCancel={cancelEdit}
                onCommit={onMergeCommit}
              />
            ) : undefined
          }
          bodyOverlaySlot={
            bodyPieces.length ? (
              <ExcelMergeOverlay
                pieces={bodyPieces}
                selectedKey={selectedKey}
                editingKey={editingKey}
                draft={draft}
                typeover={typeover}
                autofocus={editFocus === 'cell'}
                readonly={previewing}
                onSelect={selectCell}
                onEdit={editCell}
                onCancel={cancelEdit}
                onInput={setDraft}
                onCommit={onMergeCommit}
              />
            ) : undefined
          }
        />

        <div className={excelEditorBase.sheetBar} role="tablist">
          {workbook.sheets.map((sheet, index) =>
            renamingSheet === index ? (
              <input
                key={`${sheet.name}-${index}`}
                data-excel-rename
                className={[
                  excelEditorBase.sheet,
                  excelEditorBase.sheetActive,
                  excelEditorBase.sheetRename,
                ]
                  .filter(Boolean)
                  .join(' ')}
                value={renameDraft}
                onChange={(event) => setRenameDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    commitRename()
                  } else if (event.key === 'Escape') {
                    event.preventDefault()
                    cancelRename()
                  }
                }}
                onBlur={commitRename}
                onContextMenu={(event) => event.preventDefault()}
              />
            ) : (
              <button
                key={`${sheet.name}-${index}`}
                type="button"
                role="tab"
                data-excel-sheet={index}
                aria-selected={index === sheetIndex}
                className={[
                  excelEditorBase.sheet,
                  index === sheetIndex ? excelEditorBase.sheetActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => selectSheet(index)}
                onDoubleClick={(event) => {
                  event.stopPropagation()
                  startRename(index)
                }}
              >
                {sheet.name}
              </button>
            ),
          )}
          {!previewing ? (
            <button type="button" className={excelEditorBase.action} onClick={addSheet}>
              {texts.addSheet}
            </button>
          ) : null}
        </div>
      </div>
    )
  },
)

export default CwExcelEditor
