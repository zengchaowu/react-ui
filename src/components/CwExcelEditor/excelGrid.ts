import './excel-grid.css'
import { createElement, type ReactElement } from 'react'

export { excelGridCellRole, type ExcelGridCellRole } from './functions/workbook'
import type { ExcelGridCellRole } from './functions/workbook'

/** 底层 CwDataTable 单元格占位（合并区 / padding 列不渲染 ExcelGridCell）。 */
export function renderExcelGridSlot(role: ExcelGridCellRole): ReactElement {
  return createElement('span', { 'data-excel-grid': role })
}
