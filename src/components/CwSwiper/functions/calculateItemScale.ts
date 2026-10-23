/**
 * 根据元素离容器中心点的距离计算缩放比例
 * @param distanceFromCenter 元素中心点距离容器中心点的距离（像素）
 * @param maxDistance 最大距离（容器宽度的一半）
 * @param minScale 最小缩放比例
 * @returns 缩放比例（minScale 到 1 之间）
 */
export function calculateItemScale(
  distanceFromCenter: number,
  maxDistance: number,
  minScale: number
): number {
  if (maxDistance <= 0) {
    return minScale
  }

  // 线性插值：距离中心越近，缩放越大
  // 当 distanceFromCenter = 0 时，scale = 1
  // 当 distanceFromCenter >= maxDistance 时，scale = minScale
  const ratio = Math.min(1, distanceFromCenter / maxDistance)
  const scale = 1 - ratio * (1 - minScale)
  return Math.max(minScale, Math.min(1, scale))
}

