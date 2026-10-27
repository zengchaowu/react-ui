import type { MutableRefObject } from 'react'
import type { CellPosition } from './useExcelGridLayout'
import {
  cloneWorkbook,
  deleteSheetColumns,
  deleteSheetRows,
  insertSheetColumn,
  insertSheetRow,
  mergeCovering,
} from '../functions/workbook'
import type { CwExcelMerge, CwExcelSheet, CwExcelWorkbook } from '../types'

/**
 * 行列结构域：插入/删除行列。
 *
 * 行高列宽由布局 hook 平移，工作簿内容由这里改写，两者都完成后再把选中移到原位。
 */
export function useExcelSheetStructure(opts: {
  workbookRef: MutableRefObject<CwExcelWorkbook>
  sheetIndexRef: MutableRefObject<number>
  selectionRef: MutableRefObject<CellPosition | null>
  publish: (next: CwExcelWorkbook, record?: boolean) => void
  getActiveSheet: () => CwExcelSheet | undefined
  /** 行高平移，insert=true 表示插入时补默认高度 */
  shiftRowHeights: (at: number, count: number, insert: boolean) => void
  /** 列宽平移，insert=true 表示插入时补默认宽度 */
  shiftColumnWidths: (at: number, count: number, insert: boolean) => void
  placeSelection: (row: number, col: number, reveal?: boolean) => void
}) {
  const { workbookRef, sheetIndexRef, selectionRef } = opts

  function mutateSheet(change: (sheet: CwExcelSheet) => void) {
    const next = cloneWorkbook(workbookRef.current)
    const sheet = next.sheets[sheetIndexRef.current]
    if (!sheet) return
    change(sheet)
    opts.publish(next)
  }

  function selectedSpan(row: number, col: number): CwExcelMerge | null {
    return mergeCovering(opts.getActiveSheet()?.merges ?? [], row, col)
  }

  function insertRow(at: number) {
    opts.shiftRowHeights(at, 1, true)
    mutateSheet((sheet) => insertSheetRow(sheet, at))
    opts.placeSelection(at, selectionRef.current?.col ?? 0)
  }

  function deleteRow(at: number) {
    const merge = selectedSpan(at, selectionRef.current?.col ?? 0)
    const count = merge && merge.row === at ? merge.rowspan : 1
    opts.shiftRowHeights(at, count, false)
    mutateSheet((sheet) => deleteSheetRows(sheet, at, count))
    const height = workbookRef.current.sheets[sheetIndexRef.current]?.cells.length ?? 1
    opts.placeSelection(Math.min(at, Math.max(0, height - 1)), selectionRef.current?.col ?? 0)
  }

  function insertColumn(at: number) {
    opts.shiftColumnWidths(at, 1, true)
    mutateSheet((sheet) => insertSheetColumn(sheet, at))
    opts.placeSelection(selectionRef.current?.row ?? 0, at)
  }

  function deleteColumn(at: number) {
    const merge = selectedSpan(selectionRef.current?.row ?? 0, at)
    const count = merge && merge.col === at ? merge.colspan : 1
    opts.shiftColumnWidths(at, count, false)
    mutateSheet((sheet) => deleteSheetColumns(sheet, at, count))
    const width = workbookRef.current.sheets[sheetIndexRef.current]?.cells[0]?.length ?? 1
    opts.placeSelection(selectionRef.current?.row ?? 0, Math.min(at, Math.max(0, width - 1)))
  }

  return { insertRow, deleteRow, insertColumn, deleteColumn }
}
