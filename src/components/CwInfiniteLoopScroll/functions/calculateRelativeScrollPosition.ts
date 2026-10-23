/**
 * 计算相对于中间副本的滚动位置
 */
export function calculateRelativeScrollPosition(
  scrollTop: number,
  scrollLeft: number,
  middleCopyInfo: { top: number; left: number } | null
): { relativeTop: number; relativeLeft: number } {
  if (!middleCopyInfo) {
    return { relativeTop: 0, relativeLeft: 0 }
  }

  return {
    relativeTop: scrollTop - middleCopyInfo.top,
    relativeLeft: scrollLeft - middleCopyInfo.left
  }
}

