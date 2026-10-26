import type { CwDataTableColumn } from '../types'

/** 按 visible / fixed 配置计算实际渲染列，并补足左右固定列数量 */
export function computeVisibleColumns(
  columns: CwDataTableColumn[],
  fixedLeftColumns: number,
  fixedRightColumns: number,
): CwDataTableColumn[] {
  const cols = columns.filter((c) => c.visible !== false)

  const leftFixed: CwDataTableColumn[] = []
  const rightFixed: CwDataTableColumn[] = []
  const normal: CwDataTableColumn[] = []

  cols.forEach((col) => {
    if (col.fixed === 'left') {
      leftFixed.push({ ...col, fixedIndex: leftFixed.length })
    } else if (col.fixed === 'right') {
      rightFixed.push({ ...col, fixedIndex: -(rightFixed.length + 1) })
    } else {
      normal.push(col)
    }
  })

  if (fixedLeftColumns > 0) {
    const needFixed = fixedLeftColumns - leftFixed.length
    if (needFixed > 0) {
      const autoLeft = normal.splice(0, needFixed)
      autoLeft.forEach((col, index) => {
        leftFixed.push({
          ...col,
          fixed: 'left' as const,
          fixedIndex: leftFixed.length + index,
        })
      })
    }
  }

  if (fixedRightColumns > 0) {
    const needFixed = fixedRightColumns - rightFixed.length
    if (needFixed > 0) {
      const autoRight = normal.splice(-needFixed)
      autoRight.forEach((col, index) => {
        rightFixed.unshift({
          ...col,
          fixed: 'right' as const,
          fixedIndex: -(rightFixed.length + index + 1),
        })
      })
    }
  }

  return [...leftFixed, ...normal, ...rightFixed]
}

/** 某一侧固定列中是否存在实际宽度大于 0 的列 */
export function fixedSideHasWidth(
  columns: readonly CwDataTableColumn[],
  columnWidths: Record<string, number>,
  side: 'left' | 'right',
): boolean {
  if (side === 'left') {
    for (const column of columns) {
      if (column.fixed !== 'left') break
      if ((columnWidths[column.key] ?? column.width ?? 0) > 0) return true
    }
    return false
  }
  for (let i = columns.length - 1; i >= 0; i--) {
    const column = columns[i]!
    if (column.fixed !== 'right') break
    if ((columnWidths[column.key] ?? column.width ?? 0) > 0) return true
  }
  return false
}
