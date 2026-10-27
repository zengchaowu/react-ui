import { useMemo } from 'react'
import type { CwInfiniteLoopScrollItem } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/types'
import {
  calculateSingleCopyHeight,
  calculateSingleCopyWidth,
  calculateCopyCount,
  createLoopItems,
  calculateMiddleCopyInfo,
  calculateTotalHeight,
  calculateTotalWidth,
} from '../functions'

export type MiddleCopyInfo = {
  index: number
  top: number
  left: number
  topEnd: number
  leftEnd: number
} | null

/**
 * 无限循环逻辑 Hook
 */
export function useInfiniteLoop(
  items: CwInfiniteLoopScrollItem[],
  direction: 'vertical' | 'horizontal' | 'both',
  itemHeight: number,
  itemWidth: number,
  containerHeight: number,
  containerWidth: number,
) {
  const singleCopyHeight = useMemo(
    () => calculateSingleCopyHeight(items, direction, containerHeight, itemHeight),
    [items, direction, containerHeight, itemHeight],
  )

  const singleCopyWidth = useMemo(
    () => calculateSingleCopyWidth(items, direction, containerWidth, itemWidth),
    [items, direction, containerWidth, itemWidth],
  )

  const actualCopyCount = useMemo(
    () =>
      calculateCopyCount(
        items.length,
        direction,
        containerHeight,
        containerWidth,
        singleCopyHeight,
        singleCopyWidth,
      ),
    [items.length, direction, containerHeight, containerWidth, singleCopyHeight, singleCopyWidth],
  )

  const loopItems = useMemo(
    () => createLoopItems(items, actualCopyCount),
    [items, actualCopyCount],
  )

  const middleCopyInfo = useMemo<MiddleCopyInfo>(
    () => calculateMiddleCopyInfo(actualCopyCount, singleCopyHeight, singleCopyWidth),
    [actualCopyCount, singleCopyHeight, singleCopyWidth],
  )

  const totalHeight = useMemo(
    () =>
      calculateTotalHeight(
        direction,
        containerHeight,
        itemHeight,
        singleCopyHeight,
        actualCopyCount,
      ),
    [direction, containerHeight, itemHeight, singleCopyHeight, actualCopyCount],
  )

  const totalWidth = useMemo(
    () =>
      calculateTotalWidth(direction, containerWidth, itemWidth, singleCopyWidth, actualCopyCount),
    [direction, containerWidth, itemWidth, singleCopyWidth, actualCopyCount],
  )

  return {
    singleCopyHeight,
    singleCopyWidth,
    actualCopyCount,
    loopItems,
    middleCopyInfo,
    totalHeight,
    totalWidth,
  }
}
