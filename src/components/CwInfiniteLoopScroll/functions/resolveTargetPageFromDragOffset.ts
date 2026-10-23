/**
 * 拖拽松手翻页：已通过 snap 阈值后，至少翻 1 页；更远则按 round 计算多页。
 * 若仅用 Math.round(pageOffset)，20%～50% 区间 round 为 0，体感需滑半屏才切换。
 */
export function resolveTargetPageFromDragOffset(pageOffset: number): number {
  if (pageOffset > 0) {
    return Math.max(1, Math.round(pageOffset))
  }
  if (pageOffset < 0) {
    return Math.min(-1, Math.round(pageOffset))
  }
  return 0
}
