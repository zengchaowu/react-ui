import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { CwDataTableColumn } from '../../CwDataTable'
import type { ExcelMergePiece } from '../ExcelMergeOverlay'
import {
  COL_WIDTH,
  GUTTER_WIDTH,
  MIN_ROW_HEIGHT,
  SHEET_ROW_HEIGHT,
  cellCss,
  columnIndexFromKey,
  fitRowHeight,
  sumWidths,
  visibleMergeBorders,
} from '../functions/sheetMetrics'
import { cloneWorkbook, formatCell } from '../functions/workbook'
import type { CwExcelWorkbook } from '../types'
import { useMirroredState } from './useMirroredState'

export type CellPosition = { row: number; col: number }

export interface UseExcelGridLayoutOptions {
  headerRow: boolean
  previewing: boolean
  rootRef: RefObject<HTMLDivElement | null>
  getWorkbook: () => CwExcelWorkbook
  getSheetIndex: () => number
  getActiveSheet: () => CwExcelWorkbook['sheets'][number] | undefined
  getEditing: () => boolean
  getDraft: () => string
  getEditAt: () => CellPosition | null
  publish: (next: CwExcelWorkbook, record?: boolean) => void
}

export function useExcelGridLayout(options: UseExcelGridLayoutOptions) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  /** 拖过的列宽。没拖过的列用 COL_WIDTH。拖动中的那一列先记在 dragWidth，避免整表重画打断拖动。 */
  const [committedWidths, setCommittedWidths, committedWidthsRef] = useMirroredState<number[]>([])
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
  const [mergeLayoutOverrides, setMergeLayoutOverrides, mergeLayoutOverridesRef] =
    useMirroredState<Record<string, Record<string, string>>>({})

  const stopRowResizeRef = useRef<(() => void) | null>(null)
  const mergeLayoutFrameRef = useRef(0)

  useEffect(
    () => () => {
      stopRowResizeRef.current?.()
      if (mergeLayoutFrameRef.current) cancelAnimationFrame(mergeLayoutFrameRef.current)
    },
    [],
  )

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
    const current = optionsRef.current
    return fitRowHeight({
      sheet: current.getActiveSheet(),
      row,
      editing: current.getEditing(),
      editAt: current.getEditAt(),
      draft: current.getDraft(),
      widthAt: layoutWidth,
    })
  }

  function sheetTooLargeToMeasure() {
    const sheet = optionsRef.current.getActiveSheet()
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
    const current = optionsRef.current
    const sheet = current.getWorkbook().sheets[current.getSheetIndex()]
    setCommittedWidths((sheet?.colWidths ?? []).slice())
    setCommittedRowHeights((sheet?.rowHeights ?? []).slice())
    setDragWidth(null)
    setDragRow(null)
  }

  function writeSheetMetric(kind: 'col' | 'row', index: number, value: number) {
    const current = optionsRef.current
    const next = cloneWorkbook(current.getWorkbook())
    const sheet = next.sheets[current.getSheetIndex()]
    if (!sheet) return
    const source = (kind === 'col' ? sheet.colWidths : sheet.rowHeights) ?? []
    const metrics = source.slice()
    while (metrics.length <= index) metrics.push(0)
    metrics[index] = value
    if (kind === 'col') sheet.colWidths = metrics
    else sheet.rowHeights = metrics
    current.publish(next)
  }

  function shiftRowHeights(at: number, count: number, insert: boolean) {
    const next = committedRowHeightsRef.current.slice()
    if (insert) next.splice(at, 0, ...Array(count).fill(SHEET_ROW_HEIGHT))
    else next.splice(at, count)
    setCommittedRowHeights(next)
    setDragRow(null)
  }

  function startRowResize(row: number, event: PointerEvent) {
    if (optionsRef.current.previewing || event.button !== 0) return
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

  function mergePieces(edge: 'body' | 'header'): ExcelMergePiece[] {
    const current = optionsRef.current
    const sheet = current.getActiveSheet()
    if (!sheet) return []
    const headerRow = current.headerRow
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

  function cellWrapRect(root: HTMLElement, row: number, col: number): DOMRect | null {
    const marker = root.querySelector(`[data-excel-row="${row}"][data-excel-col="${col}"]`)
    if (!(marker instanceof Element)) return null
    const wrap = marker.closest('.group > div')
    if (!(wrap instanceof HTMLElement)) return null
    return wrap.getBoundingClientRect()
  }

  function syncMergeLayoutFromDom() {
    const current = optionsRef.current
    const root = current.rootRef.current
    const sheet = current.getActiveSheet()
    const headerRow = current.headerRow
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

  const syncMergeLayoutRef = useRef(syncMergeLayoutFromDom)
  syncMergeLayoutRef.current = syncMergeLayoutFromDom

  function scheduleMergeLayoutSync() {
    if (mergeLayoutFrameRef.current) cancelAnimationFrame(mergeLayoutFrameRef.current)
    mergeLayoutFrameRef.current = requestAnimationFrame(() => {
      mergeLayoutFrameRef.current = 0
      syncMergeLayoutRef.current()
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

  return {
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
  }
}
