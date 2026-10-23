/**
 * 计算垂直滚动条滑块高度
 */
export function calculateVerticalScrollbarThumbHeight(
  trackHeight: number,
  contentHeight: number,
  minThumbSize: number = 24,
): number {
  if (contentHeight <= 0) return 0
  const ratio = trackHeight / contentHeight
  return Math.min(trackHeight, Math.max(minThumbSize, trackHeight * ratio))
}

/**
 * 计算垂直滚动条滑块位置
 */
export function calculateVerticalScrollbarThumbTop(
  scrollTop: number,
  trackHeight: number,
  contentHeight: number,
  thumbHeight: number,
): number {
  const maxScrollTop = Math.max(0, contentHeight - trackHeight)
  if (maxScrollTop <= 0) return 0
  const ratio = scrollTop / maxScrollTop
  const movableRange = Math.max(trackHeight - thumbHeight, 0)
  return movableRange * ratio
}

/**
 * 计算水平滚动条滑块宽度
 */
export function calculateHorizontalScrollbarThumbWidth(
  trackWidth: number,
  contentWidth: number,
  minThumbSize: number = 24,
): number {
  if (contentWidth <= 0) return 0
  const ratio = trackWidth / contentWidth
  return Math.min(trackWidth, Math.max(minThumbSize, trackWidth * ratio))
}

/**
 * 计算水平滚动条滑块位置
 */
export function calculateHorizontalScrollbarThumbLeft(
  scrollLeft: number,
  trackWidth: number,
  contentWidth: number,
  thumbWidth: number,
): number {
  const maxScrollLeft = Math.max(0, contentWidth - trackWidth)
  if (maxScrollLeft <= 0) return 0
  const ratio = scrollLeft / maxScrollLeft
  const movableRange = Math.max(trackWidth - thumbWidth, 0)
  return movableRange * ratio
}
