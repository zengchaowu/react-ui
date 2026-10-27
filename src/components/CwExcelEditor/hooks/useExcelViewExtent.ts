import type { MutableRefObject } from 'react'
import {
  COL_LOOKAHEAD,
  MIN_SHEET_COLS,
  MIN_SHEET_ROWS,
  ROW_LOOKAHEAD,
  SHEET_COL_CHUNK,
  SHEET_ROW_CHUNK,
} from '../functions/sheetMetrics'
import type { CwExcelSheet, CwExcelWorkbook } from '../types'
import { useMirroredState } from './useMirroredState'

/**
 * 可视范围域：表格当前渲染多少行多少列。
 *
 * 内容变多或滚到边缘时按块放大，换 sheet / 导入文件时回到内容本身的尺寸。
 */
export function useExcelViewExtent(opts: {
  workbookRef: MutableRefObject<CwExcelWorkbook>
  sheetIndexRef: MutableRefObject<number>
  getActiveSheet: () => CwExcelSheet | undefined
  /** 重置视图尺寸时一并复位列宽缓存 */
  resetColumnWidths: () => void
  setWindowStart: (value: number) => void
  /** 换 sheet / 导入后重挂载表格，避免缓存列宽覆盖新数据 */
  bumpTableLayoutKey: () => void
}) {
  const { workbookRef, sheetIndexRef } = opts

  /** 内容实际占用的行列数，至少留出空白编辑区。 */
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

  function baseExtent(index = sheetIndexRef.current) {
    return computeBaseExtent(index)
  }

  function resetViewExtent(index = sheetIndexRef.current) {
    const extent = baseExtent(index)
    setViewRows(extent.rows)
    setViewCols(extent.cols)
    opts.setWindowStart(0)
    opts.resetColumnWidths()
    opts.bumpTableLayoutKey()
  }

  function ensureViewCovers(row: number, col: number) {
    if (row >= viewRowsRef.current - ROW_LOOKAHEAD) setViewRows(row + 1 + SHEET_ROW_CHUNK)
    if (col >= viewColsRef.current - COL_LOOKAHEAD) setViewCols(col + 1 + SHEET_COL_CHUNK)
  }

  function sheetColCount() {
    const cells = opts.getActiveSheet()?.cells
    return Math.max(viewColsRef.current, cells?.[0]?.length ?? 1)
  }

  return {
    viewRows,
    setViewRows,
    setViewCols,
    viewRowsRef,
    viewColsRef,
    baseExtent,
    resetViewExtent,
    ensureViewCovers,
    sheetColCount,
  }
}
