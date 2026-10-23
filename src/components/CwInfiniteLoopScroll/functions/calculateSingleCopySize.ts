import type { CwInfiniteLoopScrollItem } from '../types'

/**
 * 计算单个副本的总高度
 */
export function calculateSingleCopyHeight(
  items: CwInfiniteLoopScrollItem[],
  direction: 'vertical' | 'horizontal' | 'both',
  containerHeight: number,
  defaultItemHeight: number
): number {
  if (items.length === 0) return 0
  if (direction === 'horizontal') {
    return containerHeight || defaultItemHeight
  }
  let total = 0
  items.forEach((item) => {
    total += item.height ?? defaultItemHeight
  })
  return total
}

/**
 * 计算单个副本的总宽度
 */
export function calculateSingleCopyWidth(
  items: CwInfiniteLoopScrollItem[],
  direction: 'vertical' | 'horizontal' | 'both',
  containerWidth: number,
  defaultItemWidth: number
): number {
  if (items.length === 0) return 0
  if (direction === 'vertical') {
    return containerWidth || defaultItemWidth
  }
  if (direction === 'both') {
    let maxWidth = 0
    items.forEach((item) => {
      maxWidth = Math.max(maxWidth, item.width ?? defaultItemWidth)
    })
    return maxWidth || defaultItemWidth
  }
  let total = 0
  items.forEach((item) => {
    total += item.width ?? defaultItemWidth
  })
  return total
}

