import { useMemo } from 'react'
import { findVisibleRange } from '../functions'
import type { CwVirtualScrollItem } from '../types'

type ItemPosition = {
  top: number
  left: number
  height: number
  width: number
  key?: string | number
  index?: number
  originalIndex?: number
}

/**
 * 可见范围计算 Hook（React 版）
 * 通用版本，支持普通项目和循环项目
 */
export function useVisibleRange<TData = unknown>(
  items: CwVirtualScrollItem<TData>[],
  itemPositions: ItemPosition[],
  scrollTop: number,
  scrollLeft: number,
  containerHeight: number,
  containerWidth: number,
  direction: 'vertical' | 'horizontal' | 'both',
  bufferSize: number,
) {
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
    } else {
      return findVisibleRange(
        scrollTop,
        containerHeight,
        false,
        items.length,
        itemPositions,
        bufferSize,
      )
    }
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

  // 滚动偏移变了但可见下标没变时，返回同一份数组，避免每一帧都重渲染
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange

    if (startIndex < 0 || endIndex < 0 || startIndex > endIndex || itemPositions.length === 0) {
      return []
    }

    const visibleItemsList: Array<{
      key: string | number
      index: number
      originalIndex: number
      data: TData
      top: number
      left: number
      height: number
      width: number
    }> = []

    for (let i = startIndex; i <= endIndex; i++) {
      if (i >= 0 && i < itemPositions.length && i < items.length) {
        const position = itemPositions[i]
        const item = items[i]
        if (item && position) {
          visibleItemsList.push({
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

    return visibleItemsList
  }, [visibleRange, itemPositions, items])

  return {
    visibleRange,
    visibleItems,
  }
}
