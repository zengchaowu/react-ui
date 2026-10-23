/**
 * 计算滚动条拖拽后的滚动位置（垂直）
 */
export function calculateScrollbarDragScrollTop(
  startScrollTop: number,
  startY: number,
  currentY: number,
  trackHeight: number,
  contentHeight: number,
  thumbHeight: number,
): number {
  const maxScrollTop = Math.max(0, contentHeight - trackHeight)
  if (maxScrollTop <= 0) return startScrollTop

  const deltaY = currentY - startY
  const availableTrackHeight = trackHeight - thumbHeight

  if (availableTrackHeight > 0) {
    const scrollRatio = maxScrollTop / availableTrackHeight
    return startScrollTop + deltaY * scrollRatio
  }

  return startScrollTop
}

/**
 * 计算滚动条拖拽后的滚动位置（水平）
 */
export function calculateScrollbarDragScrollLeft(
  startScrollLeft: number,
  startX: number,
  currentX: number,
  trackWidth: number,
  contentWidth: number,
  thumbWidth: number,
): number {
  const maxScrollLeft = Math.max(0, contentWidth - trackWidth)
  if (maxScrollLeft <= 0) return startScrollLeft

  const deltaX = currentX - startX
  const availableTrackWidth = trackWidth - thumbWidth

  if (availableTrackWidth > 0) {
    const scrollRatio = maxScrollLeft / availableTrackWidth
    return startScrollLeft + deltaX * scrollRatio
  }

  return startScrollLeft
}
