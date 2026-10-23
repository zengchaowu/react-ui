import type { CwDataTableColumn, CwDataTableSortState } from '../types'

/**
 * 计算表头 props
 */
export function calculateHeaderProps(
  column: CwDataTableColumn,
  sortState: CwDataTableSortState | undefined,
  onSort: (column: CwDataTableColumn) => void,
  isSelected?: boolean,
  isHovered?: boolean,
): Record<string, unknown> {
  const ctx = {
    column,
    sortState,
    onSort: () => onSort(column),
    isSelected,
    isHovered,
  }
  return column.headerProps ? column.headerProps(ctx) : ctx
}
