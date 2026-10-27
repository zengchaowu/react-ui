import { useEffect, useMemo, useRef } from 'react'
import type { CwInfiniteLoopScrollItem } from '../types'
import { calculateVisibleRangeFromLoopItems } from '../functions'
import type { LoopItem, VisibleItem } from './useVisibleRange'
import type { MiddleCopyInfo } from './useInfiniteLoop'

/**
 * 无限循环滚动监听 Hook
 * 负责：可见范围上报、列表身份变化回到中间副本、容器尺寸变化跳回中间副本。
 */
export function useInfiniteLoopScrollWatchers(options: {
  items: CwInfiniteLoopScrollItem[]
  direction: 'vertical' | 'horizontal' | 'both'
  middleCopyInfo: MiddleCopyInfo
  containerHeight: number
  containerWidth: number
  scrollTopRef: { current: number }
  scrollLeftRef: { current: number }
  loopItems: LoopItem[]
  visibleRange: { startIndex: number; endIndex: number }
  visibleItems: VisibleItem[]
  setScrollTop: (value: number, callback?: () => void) => void
  setScrollLeft: (value: number, callback?: () => void) => void
  checkAndJumpToMiddle: (options?: { emitScroll?: boolean }) => void
  onScroll: (top: number, left: number) => void
  onVisibleChange?: (
    startIndex: number,
    endIndex: number,
    visibleItems: CwInfiniteLoopScrollItem[],
  ) => void
  /** items 身份变化并复位到中间副本时同步逻辑页（分页模式） */
  onItemsScrollReset?: () => void
}) {
  const {
    items,
    direction,
    middleCopyInfo,
    containerHeight,
    containerWidth,
    scrollTopRef,
    scrollLeftRef,
    loopItems,
    visibleRange,
    visibleItems,
    setScrollTop,
    setScrollLeft,
    onVisibleChange,
    onItemsScrollReset,
  } = options
  const optionsRef = useRef(options)
  optionsRef.current = options

  // 监听可见范围变化
  const previousVisibleRangeRef = useRef<{ startIndex: number; endIndex: number } | null>(null)
  useEffect(() => {
    const { startIndex, endIndex } = visibleRange
    if (startIndex < 0 || endIndex < 0) return

    const previous = previousVisibleRangeRef.current
    if (previous && previous.startIndex === startIndex && previous.endIndex === endIndex) {
      return
    }
    previousVisibleRangeRef.current = { startIndex, endIndex }

    const visibleItemsList: CwInfiniteLoopScrollItem[] = visibleItems.map((item) => ({
      key: items[item.originalIndex]?.key ?? item.key,
      data: item.data,
      height: item.height,
      width: item.width,
    }))

    const { startIndex: startOriginalIndex, endIndex: endOriginalIndex } =
      calculateVisibleRangeFromLoopItems({ startIndex, endIndex }, loopItems)

    onVisibleChange?.(startOriginalIndex, endOriginalIndex, visibleItemsList)
  }, [visibleRange, visibleItems, items, loopItems, onVisibleChange])

  // 列表身份变化时回到中间副本
  const itemsSignature = useMemo(() => {
    if (items.length === 0) return '0'
    return `${items.length}\0${items.map((item) => String(item.key)).join('\0')}`
  }, [items])
  const previousSignatureRef = useRef<string | null>(null)
  useEffect(() => {
    if (previousSignatureRef.current === null) {
      previousSignatureRef.current = itemsSignature
      return
    }
    if (previousSignatureRef.current === itemsSignature) return
    previousSignatureRef.current = itemsSignature

    const current = optionsRef.current
    if (!current.middleCopyInfo) return

    if (current.direction === 'horizontal') {
      current.setScrollLeft(current.middleCopyInfo.left, () => {
        current.onItemsScrollReset?.()
        current.onScroll(current.scrollTopRef.current, current.scrollLeftRef.current)
      })
    } else {
      current.setScrollTop(current.middleCopyInfo.top, () => {
        current.onItemsScrollReset?.()
        current.onScroll(current.scrollTopRef.current, current.scrollLeftRef.current)
      })
    }
  }, [itemsSignature, direction, middleCopyInfo, setScrollTop, setScrollLeft])

  // 容器尺寸变化：检查并跳回中间副本
  const previousSizeRef = useRef({ height: containerHeight, width: containerWidth })
  useEffect(() => {
    const previous = previousSizeRef.current
    previousSizeRef.current = { height: containerHeight, width: containerWidth }

    if (
      (containerHeight === 0 && containerWidth === 0) ||
      (containerHeight === previous.height && containerWidth === previous.width)
    ) {
      return
    }
    optionsRef.current.checkAndJumpToMiddle({ emitScroll: false })
  }, [containerHeight, containerWidth])
}
