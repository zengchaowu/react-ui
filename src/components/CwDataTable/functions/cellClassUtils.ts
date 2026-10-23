import type { CwDataTableColumn, CwDataTableStyles } from '../types'
import {
  isFixedColumn,
  isFirstRightFixedColumn,
  isLastLeftFixedColumn,
  shouldRemoveRightBorder,
  getColumnAlignClass,
} from './columnUtils'
import { stripCellRightBorderClasses } from './tableEdgeBorders'

type FixedChrome = {
  cellFixed: string
  left: string
  right: string
  rightFirst: string
  leftShadow: string
  rightShadow: string
}

function appendFixedColumnClasses(
  classes: string[],
  column: CwDataTableColumn,
  visibleColumns: CwDataTableColumn[],
  leftFixedOverlaps: boolean,
  rightFixedOverlaps: boolean,
  chrome: FixedChrome,
): void {
  if (!isFixedColumn(column)) return

  classes.push(chrome.cellFixed)
  classes.push(column.fixed === 'left' ? chrome.left : chrome.right)

  if (column.fixed === 'right' && isFirstRightFixedColumn(column, visibleColumns)) {
    classes.push(chrome.rightFirst)
  }
  if (leftFixedOverlaps && column.fixed === 'left' && isLastLeftFixedColumn(column, visibleColumns)) {
    classes.push(chrome.leftShadow)
  }
  if (rightFixedOverlaps && column.fixed === 'right' && isFirstRightFixedColumn(column, visibleColumns)) {
    classes.push(chrome.rightShadow)
  }
}

function appendNoRightBorder(classes: string[], noRightBorderClass: string): void {
  if (classes.length > 0) {
    classes[0] = stripCellRightBorderClasses(classes[0]!)
  }
  if (noRightBorderClass) classes.push(noRightBorderClass)
}

function appendSelectHoverClasses(
  classes: string[],
  selectedClass: string,
  hoveredClass: string,
  isSelected?: boolean,
  isHovered?: boolean,
): void {
  if (isSelected) classes.push(selectedClass)
  else if (isHovered) classes.push(hoveredClass)
}

/**
 * 计算表头单元格的类名
 */
export function getHeaderCellClasses(
  column: CwDataTableColumn,
  visibleColumns: CwDataTableColumn[],
  styles: CwDataTableStyles,
  leftFixedOverlaps: boolean,
  rightFixedOverlaps: boolean,
  resizable: boolean,
  isSelected?: boolean,
  isHovered?: boolean,
  omitLastColumnRightBorder = true,
): string[] {
  const classes: string[] = [styles.headerCell]

  appendFixedColumnClasses(classes, column, visibleColumns, leftFixedOverlaps, rightFixedOverlaps, {
    cellFixed: styles.headerCellFixed,
    left: styles.fixedLeftHeader,
    right: styles.fixedRightHeader,
    rightFirst: styles.fixedRightHeaderFirst,
    leftShadow: styles.fixedLeftHeaderShadow,
    rightShadow: styles.fixedRightHeaderShadow,
  })

  if (shouldRemoveRightBorder(column, visibleColumns, omitLastColumnRightBorder)) {
    appendNoRightBorder(classes, styles.headerCellNoRightBorder)
  }

  if (column.resizable !== false && resizable) {
    classes.push(styles.headerCellResizable)
  }

  const alignClass = getColumnAlignClass(column)
  if (alignClass) classes.push(alignClass)
  if (column.fitContent) classes.push('!overflow-visible')

  appendSelectHoverClasses(
    classes,
    styles.headerCellSelected,
    styles.headerCellHovered,
    isSelected,
    isHovered,
  )

  return classes
}

/**
 * 计算表体单元格的类名
 */
export function getBodyCellClasses(
  column: CwDataTableColumn,
  visibleColumns: CwDataTableColumn[],
  styles: CwDataTableStyles,
  leftFixedOverlaps: boolean,
  rightFixedOverlaps: boolean,
  isSelected?: boolean,
  isHovered?: boolean,
  omitLastColumnRightBorder = true,
): string[] {
  const classes: string[] = [styles.cell]

  appendFixedColumnClasses(classes, column, visibleColumns, leftFixedOverlaps, rightFixedOverlaps, {
    cellFixed: styles.cellFixed,
    left: styles.fixedLeftBody,
    right: styles.fixedRightBody,
    rightFirst: styles.fixedRightBodyFirst,
    leftShadow: styles.fixedLeftBodyShadow,
    rightShadow: styles.fixedRightBodyShadow,
  })

  if (shouldRemoveRightBorder(column, visibleColumns, omitLastColumnRightBorder)) {
    appendNoRightBorder(classes, styles.cellNoRightBorder)
  }

  const alignClass = getColumnAlignClass(column)
  if (alignClass) classes.push(alignClass)
  if (column.wrap) classes.push('!items-start')
  if (column.fitContent) classes.push('!overflow-visible')

  appendSelectHoverClasses(
    classes,
    styles.cellSelected,
    styles.cellHovered,
    isSelected,
    isHovered,
  )

  return classes
}
