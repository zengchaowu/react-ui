/**
 * 计算点击轨道后的滚动位置（垂直）
 */
export function calculateVerticalTrackClickScrollTop(
  clickY: number,
  trackHeight: number,
  contentHeight: number,
  currentScrollTop: number,
  thumbTop: number,
  thumbHeight: number,
): number | null {
  const maxScrollTop = Math.max(0, contentHeight - trackHeight)
  if (maxScrollTop <= 0) return null

  // 点击滑块上方，向上滚动一页
  if (clickY < thumbTop) {
    return Math.max(0, currentScrollTop - trackHeight)
  }
  // 点击滑块下方，向下滚动一页
  else if (clickY > thumbTop + thumbHeight) {
    return Math.min(maxScrollTop, currentScrollTop + trackHeight)
  }

  return null
}

/**
 * 计算点击轨道后的滚动位置（水平）
 */
export function calculateHorizontalTrackClickScrollLeft(
  clickX: number,
  trackWidth: number,
  contentWidth: number,
  currentScrollLeft: number,
  thumbLeft: number,
  thumbWidth: number,
): number | null {
  const maxScrollLeft = Math.max(0, contentWidth - trackWidth)
  if (maxScrollLeft <= 0) return null

  // 点击滑块左侧，向左滚动一页
  if (clickX < thumbLeft) {
    return Math.max(0, currentScrollLeft - trackWidth)
  }
  // 点击滑块右侧，向右滚动一页
  else if (clickX > thumbLeft + thumbWidth) {
    return Math.min(maxScrollLeft, currentScrollLeft + trackWidth)
  }

  return null
}
