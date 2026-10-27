import type { CSSProperties } from 'react'
import type { CwDataTableColumn } from '../types'
import type { CalculateColumnStyleOptions } from '@zengchaowu/ui-shared/components/CwDataTable/functions/columnUtils.pure'
import {
  clampColumnWidth,
  computeLeftoverShares,
  getColumnResolvedWidth,
  getFillColumnFloorWidth,
  hasElasticFillInMiddleSection,
  isElasticFillColumn,
  isExplicitFillColumn,
  isFirstRightFixedColumn,
  isFitContentColumn,
} from '@zengchaowu/ui-shared/components/CwDataTable/functions/columnUtils.pure'

// 框架无关的列判断/宽度计算统一由 ui-shared 提供，这里只保留生成框架 style 对象的部分。
export * from '@zengchaowu/ui-shared/components/CwDataTable/functions/columnUtils.pure'

function applyExplicitFillColumnStyle(
  column: CwDataTableColumn,
  expandFillColumns: boolean,
  style: CSSProperties,
): void {
  const floor = getFillColumnFloorWidth(column)
  const maxW =
    column.maxWidth != null && column.maxWidth > 0 ? column.maxWidth : undefined
  const grow =
    column.flex != null && Number.isFinite(column.flex) && column.flex > 0
      ? column.flex
      : 1

  if (expandFillColumns) {
    style.flex = `${grow} 1 0%`
    style.minWidth = floor > 0 ? `${floor}px` : '0'
    // 吃满剩余宽时不用 config maxWidth 卡住 flex，否则行末（操作列右侧）会留白
    style.maxWidth = '100%'
    return
  }

  // 未吃满剩余宽：仍按 fill 约束占位，避免 width:auto 被长内容撑爆整行
  const base = floor > 0 ? floor : 120
  const w = clampColumnWidth(base, column)
  style.flex = '0 0 auto'
  style.width = `${w}px`
  style.minWidth = `${w}px`
  style.maxWidth = maxW != null ? `${maxW}px` : `${w}px`
}

/**
 * 计算列样式
 */
export function calculateColumnStyle(
  column: CwDataTableColumn,
  columnWidths: Record<string, number>,
  visibleColumns?: CwDataTableColumn[],
  options?: CalculateColumnStyleOptions,
): CSSProperties {
  const expandFillColumns = options?.expandFillColumns === true
  const elasticFill = isElasticFillColumn(column)
  const measuredWidth = columnWidths[column.key]
  const width =
    elasticFill
      ? undefined
      : typeof measuredWidth === 'number' && Number.isFinite(measuredWidth) && measuredWidth > 0
        ? measuredWidth
        : column.width
  const style: CSSProperties = {}

  if (isExplicitFillColumn(column)) {
    applyExplicitFillColumnStyle(column, expandFillColumns, style)
  } else if (width) {
    const shares =
      options?.leftoverShares ??
      computeLeftoverShares(visibleColumns, columnWidths, options?.layoutContainerWidth)
    const w = clampColumnWidth(width, column) + (shares[column.key] ?? 0)
    style.width = `${w}px`
    style.minWidth = `${w}px`
    style.maxWidth = `${w}px`
    style.flex = '0 0 auto'
  } else if (isFitContentColumn(column)) {
    // 先按内容占位，syncColumnWidthsFromBody 测量后再锁定像素宽
    style.flex = '0 0 auto'
    style.width = 'auto'
    if (column.minWidth) {
      style.minWidth = `${column.minWidth}px`
    }
    if (column.maxWidth) {
      style.maxWidth = `${column.maxWidth}px`
    }
  } else if (elasticFill && !expandFillColumns) {
    // 横滚模式：优先用已测量像素宽，保证表头/表体同列对齐
    const locked =
      typeof measuredWidth === 'number' && Number.isFinite(measuredWidth) && measuredWidth > 0
        ? clampColumnWidth(measuredWidth, column)
        : null
    style.flex = '0 0 auto'
    if (locked != null) {
      style.width = `${locked}px`
      style.minWidth = `${locked}px`
      style.maxWidth = `${locked}px`
    } else {
      style.width = 'auto'
      if (column.minWidth) {
        style.minWidth = `${column.minWidth}px`
      }
      if (column.maxWidth) {
        style.maxWidth = `${column.maxWidth}px`
      }
    }
  } else {
    // 弹性列：flex-basis:0% + min-width:0 允许在容器内收缩（长文本靠 cell truncate）；
    // 勿用 config minWidth 作硬性 min-width，否则 min-content 与 w-max 会把行撑出横向滚动。
    const grow =
      column.flex != null && Number.isFinite(column.flex) && column.flex > 0 ? column.flex : 1
    style.flex = `${grow} 1 0%`
    style.minWidth = '0'
    style.maxWidth = '100%'
    if (column.maxWidth) {
      style.maxWidth = `${column.maxWidth}px`
    }
  }

  // 计算固定列的 left 位置
  if (column.fixed === 'left' && visibleColumns) {
    const currentIndex = visibleColumns.findIndex((c) => c.key === column.key)
    let left = 0
    for (let i = 0; i < currentIndex; i++) {
      const prevCol = visibleColumns[i]
      if (prevCol?.fixed === 'left') {
        left += getColumnResolvedWidth(prevCol, columnWidths)
      }
    }
    // 始终设置 left，即使是 0，确保 sticky 定位生效
    style.left = `${left}px`
    // 清除对向 inset，避免在 flex 子项上与 right 同时参与计算导致错位（Chrome/Safari）
    style.right = 'auto'
    style.position = 'sticky'
  }

  // 计算固定列的 right 位置
  if (column.fixed === 'right' && visibleColumns) {
    const currentIndex = visibleColumns.findIndex((c) => c.key === column.key)
    let right = 0
    for (let i = visibleColumns.length - 1; i > currentIndex; i--) {
      const nextCol = visibleColumns[i]
      if (nextCol?.fixed === 'right') {
        right += getColumnResolvedWidth(nextCol, columnWidths)
      }
    }
    // 始终设置 right，即使是 0，确保 sticky 定位生效
    style.right = `${right}px`
    // 清除对向 inset，避免在 flex 子项上与 left 同时参与计算导致与中间列重叠
    style.left = 'auto'
    style.position = 'sticky'
    // 首个右侧固定列：无中间拉伸列、或未启用 fill 吃满时，用 margin-left:auto 把操作栏贴行末。
    if (
      isFirstRightFixedColumn(column, visibleColumns) &&
      (!hasElasticFillInMiddleSection(visibleColumns) || !expandFillColumns)
    ) {
      style.marginLeft = 'auto'
    }
  }

  return style
}
