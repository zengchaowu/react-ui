/** 将页码归一到 [0, itemCount) */
export function normalizeLoopPage(page: number, itemCount: number): number {
  if (itemCount <= 0) return 0
  return ((page % itemCount) + itemCount) % itemCount
}

/**
 * 按拖拽距离相对当前页步进。
 * 回环跳转会同时平移 start/current，距离不变，因此不能用绝对 scroll 反推页码。
 */
export function stepLoopPageByDragDistance(
  committedPage: number,
  dragDistance: number,
  pageWidth: number,
  itemCount: number,
  snapThreshold = 0.2,
): number {
  if (pageWidth <= 0 || itemCount <= 0) return normalizeLoopPage(committedPage, itemCount)

  const current = normalizeLoopPage(committedPage, itemCount)
  if (Math.abs(dragDistance) < pageWidth * snapThreshold) return current

  const pageOffset = dragDistance / pageWidth
  const pagesMoved =
    pageOffset > 0
      ? Math.max(1, Math.round(pageOffset))
      : Math.min(-1, Math.round(pageOffset))

  return normalizeLoopPage(current + pagesMoved, itemCount)
}

/** 按固定步数相对当前页步进（滚轮等） */
export function stepLoopPageByDelta(
  committedPage: number,
  deltaPages: number,
  itemCount: number,
): number {
  return normalizeLoopPage(committedPage + deltaPages, itemCount)
}
