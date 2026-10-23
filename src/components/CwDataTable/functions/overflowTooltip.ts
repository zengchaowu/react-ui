import type { CwDataTableColumn } from '../types'

/** Whether truncated cell content should show an overflow tooltip. */
export function isColumnOverflowTooltipEnabled(
  column: CwDataTableColumn,
  tableEnabled: boolean,
): boolean {
  if (column.wrap || column.fitContent) return false
  if (column.showOverflowTooltip === false) return false
  if (column.showOverflowTooltip === true) return true
  return tableEnabled
}
