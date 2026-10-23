import type { CwDataTableColumn } from '../types'

/**
 * 手柄侧 / 施力边（同一套语义）：
 * - end：列右缘（分割线左），指针右移 → 列变宽
 * - start：列左缘（分割线右），指针右移 → 列变窄
 */
export type CwDataTableResizeEdge = 'end' | 'start'

export interface HorizontalScrollMetrics {
  scrollLeft: number
  maxScroll: number
  hasOverflow: boolean
  atRightEnd: boolean
}

export interface ResizeTarget {
  column: CwDataTableColumn
  edge: CwDataTableResizeEdge
  handleId: string
}

const SCROLL_END_EPSILON = 1

export function resizeHandleId(columnKey: string, side: CwDataTableResizeEdge): string {
  return `${columnKey}:${side}`
}

export function getHorizontalScrollMetrics(
  el: HTMLElement | null | undefined,
): HorizontalScrollMetrics {
  if (!el) {
    return { scrollLeft: 0, maxScroll: 0, hasOverflow: false, atRightEnd: false }
  }
  const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth)
  const hasOverflow = maxScroll > SCROLL_END_EPSILON
  return {
    scrollLeft: el.scrollLeft,
    maxScroll,
    hasOverflow,
    atRightEnd: hasOverflow && el.scrollLeft >= maxScroll - SCROLL_END_EPSILON,
  }
}

/**
 * 右柄是否调本列（拖左缘）：
 * - 右 fixed，或已滚到横向最右
 * - 无横滚时不走此分支：右侧有空余，右柄应与左柄一样调左列（右移变宽），
 *   否则 edge=start 会导致「往右拖 → 右列变窄」
 */
export function shouldStartHandleResizeSelf(
  column: CwDataTableColumn,
  metrics: HorizontalScrollMetrics,
): boolean {
  return column.fixed === 'right' || metrics.atRightEnd
}

function isColumnResizable(
  column: CwDataTableColumn | null | undefined,
): column is CwDataTableColumn {
  return column != null && column.resizable !== false
}

/**
 * 解析表头某侧手柄的改宽目标；null = 不显示/不响应。
 * - end：调本列；末列外缘不提供
 * - start：默认调上一列；右 fixed / 已滚到最右时调本列
 */
export function resolveResizeTarget(input: {
  side: CwDataTableResizeEdge
  column: CwDataTableColumn
  prevColumn?: CwDataTableColumn | null
  hasNextColumn: boolean
  metrics: HorizontalScrollMetrics
}): ResizeTarget | null {
  const { side, column, prevColumn, hasNextColumn, metrics } = input
  const handleId = resizeHandleId(column.key, side)

  if (side === 'end') {
    if (!hasNextColumn || !isColumnResizable(column)) return null
    return { column, edge: 'end', handleId }
  }

  if (shouldStartHandleResizeSelf(column, metrics)) {
    return isColumnResizable(column) ? { column, edge: 'start', handleId } : null
  }
  return isColumnResizable(prevColumn) ? { column: prevColumn, edge: 'end', handleId } : null
}

/** 按列下标解析（供表头模板） */
export function resolveResizeTargetAt(
  columns: readonly CwDataTableColumn[],
  colIndex: number,
  side: CwDataTableResizeEdge,
  metrics: HorizontalScrollMetrics,
): ResizeTarget | null {
  const column = columns[colIndex]
  if (!column) return null
  return resolveResizeTarget({
    side,
    column,
    prevColumn: columns[colIndex - 1] ?? null,
    hasNextColumn: colIndex < columns.length - 1,
    metrics,
  })
}

/** 缩列后保持横向贴右 */
export function pinHorizontalScrollToRight(el: HTMLElement | null | undefined): void {
  if (!el) return
  const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth)
  if (Math.abs(el.scrollLeft - maxScroll) > 0.5) {
    el.scrollLeft = maxScroll
  }
}
