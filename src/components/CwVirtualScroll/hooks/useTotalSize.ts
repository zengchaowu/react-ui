import { useMemo } from 'react'
import { calculateTotalHeight, calculateTotalWidth } from '../functions'

/**
 * 总尺寸计算 Hook（React 版）
 */
export function useTotalSize(
  itemPositions: Array<{ top: number; left: number; height: number; width: number }>,
  direction: 'vertical' | 'horizontal' | 'both',
  containerHeight: number,
  containerWidth: number,
  itemHeight: number,
  itemWidth: number,
) {
  const totalHeight = useMemo(
    () => calculateTotalHeight(itemPositions, direction, containerHeight, itemHeight),
    [itemPositions, direction, containerHeight, itemHeight],
  )

  const totalWidth = useMemo(
    () => calculateTotalWidth(itemPositions, direction, containerWidth, itemWidth),
    [itemPositions, direction, containerWidth, itemWidth],
  )

  return {
    totalHeight,
    totalWidth,
  }
}
