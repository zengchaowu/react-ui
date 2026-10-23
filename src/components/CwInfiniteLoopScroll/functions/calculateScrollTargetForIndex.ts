import type { CwInfiniteLoopScrollItem } from '../types'

/**
 * 计算滚动到指定索引的目标位置
 */
export function calculateScrollTargetForIndex(
  index: number,
  items: CwInfiniteLoopScrollItem[],
  direction: 'vertical' | 'horizontal' | 'both',
  itemHeight: number,
  itemWidth: number,
  middleCopyInfo: { top: number; left: number } | null
): { targetTop: number; targetLeft: number } | null {
  if (index < 0 || index >= items.length) {
    return null
  }

  if (!middleCopyInfo) {
    return null
  }

  let targetTop = 0
  let targetLeft = 0

  if (direction === 'horizontal') {
    let currentLeft = 0
    for (let i = 0; i < index; i++) {
      currentLeft += items[i]?.width ?? itemWidth
    }
    targetLeft = middleCopyInfo.left + currentLeft
  } else {
    let currentTop = 0
    for (let i = 0; i < index; i++) {
      currentTop += items[i]?.height ?? itemHeight
    }
    targetTop = middleCopyInfo.top + currentTop
  }

  return { targetTop, targetLeft }
}

