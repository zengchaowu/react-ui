import { useMemo } from 'react'
import { calculateItemPositions } from '../functions'

/**
 * 项目位置计算 Hook（React 版）
 * 支持普通项目和循环项目的通用版本
 */
export function useItemPositions<
  T extends {
    key: string | number
    height?: number
    width?: number
    index?: number
    originalIndex?: number
  },
>(
  items: T[],
  direction: 'vertical' | 'horizontal' | 'both',
  itemHeight: number,
  itemWidth: number,
) {
  const itemPositions = useMemo(() => {
    // 转换项目格式以适配 calculateItemPositions
    const formattedItems = items.map((item, index) => ({
      key: item.key,
      index: item.index ?? index,
      originalIndex: item.originalIndex ?? index,
      height: item.height,
      width: item.width,
    }))

    return calculateItemPositions(formattedItems, direction, itemHeight, itemWidth)
  }, [items, direction, itemHeight, itemWidth])

  return {
    itemPositions,
  }
}
