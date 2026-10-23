/**
 * 计算垂直滚动条是否可见
 */
export function calculateScrollbarVerticalVisible(
  showScrollbar: boolean,
  direction: 'vertical' | 'horizontal' | 'both',
  totalHeight: number,
  containerHeight: number,
): boolean {
  if (!showScrollbar || direction === 'horizontal') return false
  const maxScrollTop = Math.max(0, totalHeight - containerHeight)
  return maxScrollTop > 0
}

/**
 * 计算水平滚动条是否可见
 */
export function calculateScrollbarHorizontalVisible(
  showScrollbar: boolean,
  direction: 'vertical' | 'horizontal' | 'both',
  totalWidth: number,
  containerWidth: number,
): boolean {
  if (!showScrollbar || direction === 'vertical') return false
  const maxScrollLeft = Math.max(0, totalWidth - containerWidth)
  return maxScrollLeft > 0
}
