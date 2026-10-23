import type { CwInfiniteLoopScrollItem } from '../../CwInfiniteLoopScroll/types'
import type { CwSwiperItem } from '../types'

/**
 * 转换为 CwInfiniteLoopScroll 需要的格式
 */
export function convertToScrollItems(
  items: CwSwiperItem[],
  itemWidth: number
): CwInfiniteLoopScrollItem[] {
  return items.map((item, index) => ({
    key: item.key,
    data: {
      ...item,
      originalIndex: index
    },
    width: item.width ?? itemWidth
  }))
}

