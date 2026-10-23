/** 低于 Chrome 2^25，以及旧版 Safari / Firefox 的可靠布局上限 */
export const MAX_VIRTUAL_SCROLL_PX = 8_000_000

export interface VirtualWindow {
  startIndex: number
  endIndex: number
  /** 主轴前方占位（竖向 = top，横向 = left） */
  offsetStart: number
  /** 主轴后方占位 */
  offsetEnd: number
}

export const EMPTY_VIRTUAL_WINDOW: VirtualWindow = Object.freeze({
  startIndex: 0,
  endIndex: -1,
  offsetStart: 0,
  offsetEnd: 0,
})

function clampWindow(
  count: number,
  startIndex: number,
  endIndex: number,
): { startIndex: number; endIndex: number } | null {
  const start = Math.max(0, startIndex)
  const end = Math.min(count - 1, endIndex)
  if (start > end) return null
  return { startIndex: start, endIndex: end }
}

/** 可视条数；至少一屏 overscan，减少快速滚动露底 */
function resolveOverscan(
  buffer: number,
  containerSize: number,
  itemSize: number,
): number {
  if (containerSize <= 0 || itemSize <= 0) return Math.max(0, buffer)
  const visible = Math.max(1, Math.ceil(containerSize / itemSize))
  return Math.max(buffer, visible)
}

/**
 * 固定尺寸虚拟窗口：按滚动偏移只取视口附近下标。
 * 总长超过 {@link MAX_VIRTUAL_SCROLL_PX} 时，把滚动条映射到封顶高度，
 * 并用「贴着视口的滑窗」放置 DOM（不能再用 index*itemSize 当地文档坐标）。
 */
export function getVirtualWindow(
  count: number,
  itemSize: number,
  scrollOffset: number,
  containerSize: number,
  buffer: number,
): VirtualWindow {
  if (count <= 0 || itemSize <= 0) return EMPTY_VIRTUAL_WINDOW

  const natural = count * itemSize
  const capped = natural > MAX_VIRTUAL_SCROLL_PX
  const overscan = resolveOverscan(buffer, containerSize, itemSize)

  if (containerSize <= 0 || !capped) {
    let startIndex = 0
    let endIndex = Math.min(count - 1, overscan * 2)
    if (containerSize > 0) {
      startIndex = Math.floor(scrollOffset / itemSize) - overscan
      endIndex = Math.ceil((scrollOffset + containerSize) / itemSize) + overscan
    }
    const clamped = clampWindow(count, startIndex, endIndex)
    if (!clamped) return EMPTY_VIRTUAL_WINDOW
    return {
      ...clamped,
      offsetStart: clamped.startIndex * itemSize,
      offsetEnd: (count - clamped.endIndex - 1) * itemSize,
    }
  }

  const maxScroll = Math.max(1, MAX_VIRTUAL_SCROLL_PX - containerSize)
  const ratio = Math.min(1, Math.max(0, scrollOffset / maxScroll))
  const visibleCount = Math.max(1, Math.ceil(containerSize / itemSize))
  const maxFirst = Math.max(0, count - visibleCount)
  const firstDataIndex = Math.min(maxFirst, Math.floor(ratio * maxFirst))

  const renderedCount = Math.min(count, visibleCount + overscan * 2)
  const renderedPx = renderedCount * itemSize

  // spacer 只跟滚动位置走，避免 index*itemSize 把 offset 算成负数再钳回 0
  let offsetStart = Math.round(scrollOffset - overscan * itemSize)
  if (offsetStart < 0) offsetStart = 0
  if (offsetStart + renderedPx > MAX_VIRTUAL_SCROLL_PX) {
    offsetStart = Math.max(0, MAX_VIRTUAL_SCROLL_PX - renderedPx)
  }

  const localTop = Math.min(
    Math.max(renderedCount - 1, 0),
    Math.max(0, Math.floor((scrollOffset - offsetStart) / itemSize)),
  )
  let startIndex = firstDataIndex - localTop
  let endIndex = startIndex + renderedCount - 1
  if (startIndex < 0) {
    endIndex -= startIndex
    startIndex = 0
  }
  if (endIndex >= count) {
    const overflow = endIndex - (count - 1)
    endIndex = count - 1
    startIndex = Math.max(0, startIndex - overflow)
  }
  if (startIndex > endIndex) return EMPTY_VIRTUAL_WINDOW

  const usedPx = (endIndex - startIndex + 1) * itemSize
  return {
    startIndex,
    endIndex,
    offsetStart,
    offsetEnd: Math.max(0, MAX_VIRTUAL_SCROLL_PX - offsetStart - usedPx),
  }
}

/** 内容主轴可布局长度（已封顶） */
export function getVirtualContentSize(count: number, itemSize: number): number {
  if (count <= 0 || itemSize <= 0) return 0
  return Math.min(count * itemSize, MAX_VIRTUAL_SCROLL_PX)
}

/** 把数据下标映射为滚动偏移（含封顶比例） */
export function scrollOffsetForIndex(
  index: number,
  count: number,
  itemSize: number,
  containerSize: number,
): number {
  if (count <= 0 || itemSize <= 0 || index <= 0) return 0
  const clampedIndex = Math.min(count - 1, Math.max(0, index))
  const natural = count * itemSize
  if (natural <= MAX_VIRTUAL_SCROLL_PX) {
    return clampedIndex * itemSize
  }
  const maxScroll = Math.max(1, MAX_VIRTUAL_SCROLL_PX - Math.max(containerSize, 0))
  const visibleCount = Math.max(1, Math.ceil(Math.max(containerSize, itemSize) / itemSize))
  const maxFirst = Math.max(0, count - visibleCount)
  if (maxFirst === 0) return 0
  return (clampedIndex / maxFirst) * maxScroll
}
