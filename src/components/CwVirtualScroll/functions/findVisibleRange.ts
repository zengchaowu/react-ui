import { getVirtualWindow } from '../virtual-scroll'

const uniformSizeCache = new WeakMap<object, { horizontal?: boolean; vertical?: boolean }>()

function isUniformItemSize(
  positions: Array<{ top: number; left: number; height: number; width: number }>,
  isHorizontal: boolean,
): boolean {
  const cache = uniformSizeCache.get(positions) ?? {}
  const cached = isHorizontal ? cache.horizontal : cache.vertical
  if (cached !== undefined) return cached

  const first = positions[0]
  if (!first) {
    if (isHorizontal) cache.horizontal = false
    else cache.vertical = false
    uniformSizeCache.set(positions, cache)
    return false
  }
  const size = isHorizontal ? first.width : first.height
  const read = (p: (typeof positions)[number]) => (isHorizontal ? p.width : p.height)
  // 大数组抽样即可；变长列表通常首尾尺寸就不同
  let uniform: boolean
  if (positions.length <= 64) {
    uniform = positions.every((p) => read(p) === size)
  } else {
    const mid = Math.floor(positions.length / 2)
    const sample = [0, 1, mid, positions.length - 2, positions.length - 1]
    uniform = sample.every((i) => read(positions[i]) === size)
  }
  if (isHorizontal) cache.horizontal = uniform
  else cache.vertical = uniform
  uniformSizeCache.set(positions, cache)
  return uniform
}

/**
 * 可见范围：固定尺寸走共享 getVirtualWindow，变长走二分。
 */
export function findVisibleRange(
  scrollOffset: number,
  containerSize: number,
  isHorizontal: boolean,
  itemsLength: number,
  positions: Array<{ top: number; left: number; height: number; width: number }>,
  bufferSize: number,
): { startIndex: number; endIndex: number } {
  if (itemsLength === 0) {
    return { startIndex: 0, endIndex: -1 }
  }

  if (positions.length === 0) {
    return { startIndex: 0, endIndex: -1 }
  }

  const isFixedSize = isUniformItemSize(positions, isHorizontal)

  if (isFixedSize && positions.length > 0) {
    const fixedSize = isHorizontal ? positions[0].width : positions[0].height
    if (fixedSize > 0) {
      const win = getVirtualWindow(
        itemsLength,
        fixedSize,
        scrollOffset,
        containerSize,
        bufferSize,
      )
      return { startIndex: win.startIndex, endIndex: win.endIndex }
    }
  }

  if (containerSize === 0) {
    return { startIndex: 0, endIndex: Math.min(itemsLength - 1, bufferSize * 2) }
  }

  const startOffset = scrollOffset
  const endOffset = scrollOffset + containerSize

  let startIndex = 0
  let endIndex = itemsLength - 1

  // 变长尺寸：二分查找
  let left = 0
  let right = positions.length - 1
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const item = positions[mid]
    const itemEnd = isHorizontal ? item.left + item.width : item.top + item.height

    if (itemEnd >= startOffset) {
      startIndex = mid
      right = mid - 1
    } else {
      left = mid + 1
    }
  }

  left = startIndex
  right = positions.length - 1
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const item = positions[mid]
    const itemStart = isHorizontal ? item.left : item.top

    if (itemStart <= endOffset) {
      endIndex = mid
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  // 应用缓冲
  startIndex = Math.max(0, startIndex - bufferSize)
  endIndex = Math.min(itemsLength - 1, endIndex + bufferSize)

  return { startIndex, endIndex }
}
