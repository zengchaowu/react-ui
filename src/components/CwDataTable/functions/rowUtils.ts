import { stripRowBottomBorderClasses } from './tableEdgeBorders'

/**
 * 计算行类名。
 * 末行在「无底空隙」时去掉底边，避免与表格外框叠线。
 */
export function getRowClasses(
  isLastRow: boolean,
  omitLastRowBottomBorder: boolean,
  styles: { row: string; rowNoBottomBorder: string },
  columnSelectEnabled?: boolean,
): string[] {
  const omitBottom = isLastRow && omitLastRowBottomBorder
  const rowClass = omitBottom ? stripRowBottomBorderClasses(styles.row) : styles.row
  const classes = [rowClass]

  if (columnSelectEnabled) {
    classes.push('hover:bg-transparent')
  }
  if (omitBottom) {
    classes.push(styles.rowNoBottomBorder)
  }

  return classes
}
