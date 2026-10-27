import { useCallback, useRef } from 'react'
import type { CwInfiniteLoopScrollExpose } from '../types'
import type { CwInfiniteLoopScrollItem } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/types'
import {
  calculateScrollTargetForIndex,
  calculateRelativeScrollPosition,
  calculateVisibleRangeFromLoopItems,
} from '../functions'
import type { LoopItem } from './useVisibleRange'

/**
 * 无限循环滚动方法 Hook
 */
export function useInfiniteLoopScrollMethods(options: {
  items: CwInfiniteLoopScrollItem[]
  direction: 'vertical' | 'horizontal' | 'both'
  itemHeight: number
  itemWidth: number
  middleCopyInfo: { top: number; left: number } | null
  scrollTopRef: { current: number }
  scrollLeftRef: { current: number }
  loopItems: LoopItem[]
  visibleRange: { startIndex: number; endIndex: number }
  setScrollTop: (value: number, callback?: () => void) => void
  setScrollLeft: (value: number, callback?: () => void) => void
  updateScrollPositionDirect: (top: number, left: number, callback?: () => void) => void
  checkAndJumpToMiddle: () => void
  onScroll: (top: number, left: number) => void
}): CwInfiniteLoopScrollExpose {
  const optionsRef = useRef(options)
  optionsRef.current = options

  // 滚动到指定位置（跳转过程不 emit，两轴落稳后只通知一次）
  const scrollTo = useCallback((top: number, left?: number) => {
    const current = optionsRef.current
    const finish = () => {
      current.checkAndJumpToMiddle()
      current.onScroll(current.scrollTopRef.current, current.scrollLeftRef.current)
    }
    if (left === undefined) {
      current.setScrollTop(top, finish)
      return
    }
    current.setScrollTop(top)
    current.setScrollLeft(left, finish)
  }, [])

  // 直接设置滚动偏移量（不触发中间跳转等逻辑）
  const setScrollOffset = useCallback((top: number, left?: number) => {
    const current = optionsRef.current
    current.updateScrollPositionDirect(top, left ?? current.scrollLeftRef.current, () => {
      current.onScroll(current.scrollTopRef.current, current.scrollLeftRef.current)
    })
  }, [])

  // 滚动到指定索引
  const scrollToIndex = useCallback((index: number) => {
    const current = optionsRef.current
    const result = calculateScrollTargetForIndex(
      index,
      current.items,
      current.direction,
      current.itemHeight,
      current.itemWidth,
      current.middleCopyInfo,
    )
    if (!result) return
    scrollTo(result.targetTop, result.targetLeft)
  }, [scrollTo])

  // 获取当前滚动位置（相对于中间副本）
  const getScrollTop = useCallback(() => {
    const current = optionsRef.current
    return calculateRelativeScrollPosition(
      current.scrollTopRef.current,
      current.scrollLeftRef.current,
      current.middleCopyInfo,
    ).relativeTop
  }, [])

  const getScrollLeft = useCallback(() => {
    const current = optionsRef.current
    return calculateRelativeScrollPosition(
      current.scrollTopRef.current,
      current.scrollLeftRef.current,
      current.middleCopyInfo,
    ).relativeLeft
  }, [])

  // 获取可见范围（返回原始索引）
  const getVisibleRange = useCallback(() => {
    const current = optionsRef.current
    return calculateVisibleRangeFromLoopItems(current.visibleRange, current.loopItems)
  }, [])

  return {
    scrollTo,
    setScrollOffset,
    scrollToIndex,
    getScrollTop,
    getScrollLeft,
    getVisibleRange,
  }
}
