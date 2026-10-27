import { useMemo } from 'react'
import type { CwInfiniteLoopScrollItem } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/types'
import { findVisibleRange } from '../functions'

export type LoopItem = {
  key: string | number
  index: number
  originalIndex: number
  data: unknown
  height?: number
  width?: number
}

export type ItemPosition = {
  key?: string | number
  index?: number
  originalIndex?: number
  top: number
  left: number
  height: number
  width: number
}

export type VisibleItem = {
  key: string | number
  index: number
  originalIndex: number
  data: unknown
  top: number
  left: number
  height: number
  width: number
}

/**
 * 可见范围计算 Hook
 */
export function useVisibleRange(options: {
  items: LoopItem[]
  itemPositions: ItemPosition[]
  scrollTop: number
  scrollLeft: number
  containerHeight: number
  containerWidth: number
  direction: 'vertical' | 'horizontal' | 'both'
  bufferSize: number
}): {
  visibleRange: { startIndex: number; endIndex: number }
  visibleItems: VisibleItem[]
} {
  const {
    items,
    itemPositions,
    scrollTop,
    scrollLeft,
    containerHeight,
    containerWidth,
    direction,
    bufferSize,
  } = options

  const visibleRange = useMemo(() => {
    if (items.length === 0) {
      return { startIndex: 0, endIndex: -1 }
    }

    if (direction === 'horizontal') {
      return findVisibleRange(
        scrollLeft,
        containerWidth,
        true,
        items.length,
        itemPositions,
        bufferSize,
      )
    }
    return findVisibleRange(
      scrollTop,
      containerHeight,
      false,
      items.length,
      itemPositions,
      bufferSize,
    )
  }, [
    items.length,
    direction,
    scrollLeft,
    scrollTop,
    containerWidth,
    containerHeight,
    itemPositions,
    bufferSize,
  ])

  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange
    if (startIndex < 0 || endIndex < 0 || startIndex > endIndex || itemPositions.length === 0) {
      return []
    }

    const result: VisibleItem[] = []
    for (let i = startIndex; i <= endIndex; i++) {
      if (i >= 0 && i < itemPositions.length && i < items.length) {
        const position = itemPositions[i]
        const item = items[i]
        if (item && position) {
          result.push({
            key: item.key,
            index: position.index !== undefined ? position.index : i,
            originalIndex: position.originalIndex !== undefined ? position.originalIndex : i,
            data: item.data,
            top: position.top,
            left: position.left,
            height: position.height,
            width: position.width,
          })
        }
      }
    }
    return result
  }, [visibleRange, itemPositions, items])

  return { visibleRange, visibleItems }
}

export type { CwInfiniteLoopScrollItem }
