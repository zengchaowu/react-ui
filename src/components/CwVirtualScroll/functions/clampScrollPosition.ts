/**
 * 限制滚动位置（垂直）
 */
export function clampScrollTop(
  value: number,
  direction: 'vertical' | 'horizontal' | 'both',
  totalHeight: number,
  containerHeight: number,
): number {
  // horizontal 方向不允许垂直滚动
  if (direction === 'horizontal') return 0
  const maxScrollTop = Math.max(0, totalHeight - containerHeight)
  return Math.max(0, Math.min(value, maxScrollTop))
}

/**
 * 限制滚动位置（水平）
 */
export function clampScrollLeft(
  value: number,
  direction: 'vertical' | 'horizontal' | 'both',
  totalWidth: number,
  containerWidth: number,
): number {
  // vertical 方向不允许水平滚动
  if (direction === 'vertical') return 0
  const maxScrollLeft = Math.max(0, totalWidth - containerWidth)
  return Math.max(0, Math.min(value, maxScrollLeft))
}
