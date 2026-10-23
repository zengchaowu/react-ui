/**
 * 拖拽松手后按页对齐：未达阈值回弹起点；达到阈值至少翻 1 页，更远按 round 多页。
 */
export function calculateDragReleasePageSnap(
  startScroll: number,
  currentScroll: number,
  pageSize: number,
  threshold: number,
): number {
  if (pageSize <= 0) return currentScroll
  const dragDistance = currentScroll - startScroll
  if (Math.abs(dragDistance) < pageSize * threshold) {
    return startScroll
  }
  const pageOffset = dragDistance / pageSize
  if (pageOffset > 0) {
    return startScroll + Math.max(1, Math.round(pageOffset)) * pageSize
  }
  if (pageOffset < 0) {
    return startScroll + Math.min(-1, Math.round(pageOffset)) * pageSize
  }
  return startScroll
}
