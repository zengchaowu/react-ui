import type { CwDataTableColumn } from '../types'

/**
 * 累加左侧连续左固定列宽度（遇到非 left 固定列即停止）
 */
export function sumLeftFixedColumnWidths(
  visibleColumns: CwDataTableColumn[],
  columnWidths: Record<string, number>,
): number {
  let total = 0
  for (const col of visibleColumns) {
    if (col.fixed === 'left') {
      total += columnWidths[col.key] ?? col.width ?? 0
    } else {
      break
    }
  }
  return total
}

/**
 * 计算将目标列水平居中所需的 scrollLeft；固定列不需要滚动返回 null
 */
export function computeScrollLeftToCenterColumn(
  column: CwDataTableColumn,
  visibleColumns: CwDataTableColumn[],
  columnWidths: Record<string, number>,
  bodyClientWidth: number,
  scrollWidth: number,
): number | null {
  if (column.fixed) return null

  const leftFixedWidth = sumLeftFixedColumnWidths(visibleColumns, columnWidths)
  let columnLeft = leftFixedWidth
  for (const col of visibleColumns) {
    if (col.key === column.key) break
    if (!col.fixed) {
      columnLeft += columnWidths[col.key] ?? col.width ?? 0
    }
  }

  const columnWidth = columnWidths[column.key] ?? column.width ?? 0
  const columnCenter = columnLeft + columnWidth / 2
  const targetScrollLeft = columnCenter - bodyClientWidth / 2
  const maxScrollLeft = Math.max(0, scrollWidth - bodyClientWidth)
  return Math.max(0, Math.min(targetScrollLeft, maxScrollLeft))
}
