import type { CwDataTableColumn, CwDataTableLifecycle } from '../types'

/** Default text cell with no custom render / lifecycle / tree indent — cheap path. */
export function isPlainTextBodyColumn(
  column: CwDataTableColumn,
  options?: {
    treeEnabled?: boolean
    isIndentColumn?: (column: CwDataTableColumn) => boolean
    lifecycle?: CwDataTableLifecycle
  },
): boolean {
  if (typeof column.cellRender === 'function' || column.cellComponent) return false
  if (
    options?.lifecycle?.onBeforeCellRender ||
    options?.lifecycle?.onAfterCellRender
  ) {
    return false
  }
  if (options?.treeEnabled && options.isIndentColumn?.(column)) return false
  return true
}
