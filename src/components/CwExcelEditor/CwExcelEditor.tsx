import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { HTMLAttributes, PointerEvent as ReactPointerEvent } from 'react'
import { CwDataTable } from '../CwDataTable'
import ExcelMergeOverlay from './ExcelMergeOverlay'
import { excelEditorBase } from '@zengchaowu/ui-shared/components/CwExcelEditor/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwExcelEditor/texts'
import type { CwExcelEditorEmits, CwExcelEditorHandle } from './types'
import type { CwExcelEditorProps, CwExcelWorkbook } from '@zengchaowu/ui-shared/components/CwExcelEditor/types'
import { buildSheetRows, buildSheetTable } from './functions/buildExcelTable'
import { writeCellDraft } from '@zengchaowu/ui-shared/components/CwExcelEditor/functions/sheetEdits'
import {
  anchorCell,
  guessColumnRenderCount,
  planColumnWindow,
  selectionLabel as formatSelectionLabel,
} from '@zengchaowu/ui-shared/components/CwExcelEditor/functions/sheetMetrics'
import { isHistoryKey, useExcelHistory } from './hooks/useExcelHistory'
import { useExcelFormulaBar } from './hooks/useExcelFormulaBar'
import { useExcelGridKeyboard } from './hooks/useExcelGridKeyboard'
import { useExcelGridLayout } from './hooks/useExcelGridLayout'
import type { CellPosition } from './hooks/useExcelGridLayout'
import { useExcelClipboard } from './hooks/useExcelClipboard'
import { useExcelContextMenu } from './hooks/useExcelContextMenu'
import { useExcelSelectionPaint } from './hooks/useExcelSelectionPaint'
import { useExcelSheetStructure } from './hooks/useExcelSheetStructure'
import { useExcelSheetTabs } from './hooks/useExcelSheetTabs'
import { useExcelTableScroll } from './hooks/useExcelTableScroll'
import { useExcelViewExtent } from './hooks/useExcelViewExtent'
import { useMirroredState } from './hooks/useMirroredState'
import {
  excelKeyboardOwner,
  cloneWorkbook,
  createBlankWorkbook,
  formatCell,
  mergeCovering,
  normalizeWorkbook,
  stepFromMerge,
} from '@zengchaowu/ui-shared/components/CwExcelEditor/functions/workbook'
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

type EditFocus = 'cell' | 'formula'
type CommitMove = 'stay' | 'down' | 'up' | 'left' | 'right'

/** Vue nextTick 的等价：等本轮 state 落地、DOM 画完再执行。 */
function afterRender(callback: () => void) {
  setTimeout(callback, 0)
}

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


    function getActiveSheet() {
      return workbookRef.current.sheets[sheetIndexRef.current] ?? workbookRef.current.sheets[0]
    }
    const activeSheet = workbook.sheets[sheetIndex] ?? workbook.sheets[0]

    const [windowStart, setWindowStart, windowStartRef] = useMirroredState(0)
    const [columnRenderCount, setColumnRenderCount, columnRenderCountRef] = useMirroredState(() =>
      guessColumnRenderCount(),
    )
    /** 导入/换 sheet 后重挂载表格，避免 CwDataTable 缓存列宽覆盖 xlsx 列宽 */
    const [tableLayoutKey, setTableLayoutKey, tableLayoutKeyRef] = useMirroredState(0)


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

    const layoutApiRef = useRef<ReturnType<typeof useExcelGridLayout> | null>(null)

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
      resetColumnWidths: () => layoutApiRef.current?.resetColumnWidths(),
      refreshGrid,
      scheduleMergeLayoutSync: () => layoutApiRef.current?.scheduleMergeLayoutSync(),
      focusGrid,
    })

    const gridLayout = useExcelGridLayout({
      headerRow,
      previewing,
      rootRef,
      getWorkbook: () => workbookRef.current,
      getSheetIndex: () => sheetIndexRef.current,
      getActiveSheet,
      getEditing: () => editingRef.current,
      getDraft: () => draftRef.current,
      getEditAt: () => editAtRef.current,
      publish,
    })
    layoutApiRef.current = gridLayout

    const {
      committedWidths,
      dragWidth,
      committedRowHeights,
      dragRow,
      committedWidth,
      layoutWidth,
      layoutLeft,
      layoutHeight,
      layoutRowTop,
      layoutRowSpanHeight,
      resetColumnWidths,
      shiftRowHeights,
      shiftColumnWidths,
      startRowResize,
      onColumnResizing,
      onColumnResize,
      syncMergeLayoutFromDom,
      scheduleMergeLayoutSync,
      headerPieces,
      bodyPieces,
    } = gridLayout

    const {
      viewRows,
      setViewRows,
      setViewCols,
      viewRowsRef,
      viewColsRef,
      baseExtent,
      resetViewExtent,
      ensureViewCovers,
      sheetColCount,
    } = useExcelViewExtent({
      workbookRef,
      sheetIndexRef,
      getActiveSheet,
      resetColumnWidths,
      setWindowStart,
      bumpTableLayoutKey: () => setTableLayoutKey(tableLayoutKeyRef.current + 1),
    })

    const {
      insertRow,
      deleteRow,
      insertColumn,
      deleteColumn,
    } = useExcelSheetStructure({
      workbookRef,
      sheetIndexRef,
      selectionRef,
      publish,
      getActiveSheet,
      shiftRowHeights,
      shiftColumnWidths,
      placeSelection,
    })

    const columnResizeObserverRef = useRef<ResizeObserver | null>(null)
    const closeContextMenuRef = useRef<(() => void) | null>(null)
    const ignoreEdgeGrowRef = useRef(0)
    const rowGrowAtRef = useRef(0)
    const colGrowAtRef = useRef(0)
    const paintedRef = useRef<HTMLElement[]>([])
    const paintedScrollBucketRef = useRef(-1)
    const frameHandleRef = useRef(0)
    const pendingFrameRef = useRef<{ row: number; col: number; scroll: boolean } | null>(null)

    const { paintSelection, revealInView, queueFrame, schedulePaint, scheduleReveal } =
      useExcelSelectionPaint({
        rootRef,
        headerRow,
        paintedRef,
        ignoreEdgeGrowRef,
        frameHandleRef,
        pendingFrameRef,
        getActiveSheet,
        getSelection: () => selectionRef.current,
        sheetViewport,
        layoutRowTop,
        layoutRowSpanHeight,
        layoutHeight,
        layoutLeft,
        layoutWidth,
        syncColumnWindow,
      })

    const { onTableScroll } = useExcelTableScroll({
      closeContextMenuRef,
      ignoreEdgeGrowRef,
      rowGrowAtRef,
      colGrowAtRef,
      paintedScrollBucketRef,
      viewRowsRef,
      setViewRows,
      viewColsRef,
      setViewCols,
      syncColumnWindow,
      schedulePaint,
      sheetViewport,
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

    const { onDocumentCopy, onDocumentCut, onDocumentPaste, copyCell, pasteFromClipboard } =
      useExcelClipboard({
        rootRef,
        previewing,
        selectionRef,
        anchor,
        cellTextAt,
        commitAt,
        workbookRef,
        sheetIndexRef,
        publish,
        ensureViewCovers,
        placeSelection,
      })

    const { onGridKeydown } = useExcelGridKeyboard({
      previewing,
      selectionRef,
      editingRef,
      draftRef,
      anchor,
      getActiveSheet,
      setSelection,
      setDraftValue,
      setDraft,
      placeSelection,
      editCell,
      commitAt,
      undo,
      redo,
      focusActiveEditor,
      afterRender,
    })

    const { onFormulaFocus, onFormulaInput, onFormulaKeydown, onFormulaBlur } = useExcelFormulaBar({
      previewing,
      editingRef,
      selectionRef,
      draftRef,
      anchor,
      editCell,
      setDraft,
      commitAt,
      cancelEdit,
    })

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
        closeContextMenuRef.current?.()
        if (frameHandleRef.current) cancelAnimationFrame(frameHandleRef.current)
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


    function onMergeCommit(payload: { row: number; col: number; value: string; move: CommitMove }) {
      commitAt(payload.row, payload.col, payload.value, payload.move)
    }

    const selectionText = (() => {
      const current = selection
      if (!current) return ''
      return cellTextAt(current.row, current.col)
    })()

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

    const { openSheetMenu, startRename, cancelRename, commitRename, addSheet } = useExcelSheetTabs({
      rootRef,
      texts,
      previewing,
      workbookRef,
      publish,
      selectSheet,
      renamingSheetRef,
      renameDraftRef,
      renameCancelledRef,
      setRenamingSheet,
      setRenameDraft,
      closeContextMenuRef,
      afterRender,
    })

    const { onContextMenu } = useExcelContextMenu({
      rootRef,
      texts,
      previewing,
      selectionRef,
      anchor,
      getActiveSheet,
      canUndo,
      canRedo,
      undo,
      redo,
      copyCell,
      commitAt,
      pasteFromClipboard,
      placeSelection,
      insertRow,
      deleteRow,
      insertColumn,
      deleteColumn,
      closeContextMenuRef,
      openSheetMenu,
    })

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
