/**
 * 每个逻辑页在多个循环副本里各有一个节点。取离容器中心最近的那张，
 * 用它的中心算缩放，避免量到屏幕外的副本或宽度为 0 的左缘。
 */
export function calculateItemPositions(
  container: HTMLElement,
  containerCenter: number,
): Array<{ index: number; center: number }> {
  const closest = new Map<number, { center: number; distance: number }>()
  const nodes = container.querySelectorAll<HTMLElement>('[data-swiper-index]')

  for (const node of nodes) {
    const raw = node.dataset.swiperIndex
    if (raw == null || raw === '') continue
    const index = Number(raw)
    if (!Number.isInteger(index)) continue

    const rect = node.getBoundingClientRect()
    if (rect.width <= 0) continue

    const center = rect.left + rect.width / 2
    const distance = Math.abs(center - containerCenter)
    const previous = closest.get(index)
    if (!previous || distance < previous.distance) {
      closest.set(index, { center, distance })
    }
  }

  return [...closest.entries()].map(([index, value]) => ({
    index,
    center: value.center,
  }))
}
