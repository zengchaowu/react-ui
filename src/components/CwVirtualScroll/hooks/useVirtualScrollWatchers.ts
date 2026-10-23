import { useEffect, useLayoutEffect, useRef } from 'react'
import type { CwVirtualScrollItem } from '../types'

export interface CwVirtualScrollVisibleItem<TData = unknown> {
  key: string | number
  index?: number
  originalIndex?: number
  data: TData
  top?: number
  left?: number
  height: number
  width: number
}

export interface UseVirtualScrollWatchersOptions<TData = unknown> {
  items: CwVirtualScrollItem<TData>[]
  direction: 'vertical' | 'horizontal' | 'both'
  containerHeight: number
  containerWidth: number
  scrollTop: number
  scrollLeft: number
  visibleRange: { startIndex: number; endIndex: number }
  visibleItems: Array<CwVirtualScrollVisibleItem<TData>>
  setScrollTop: (top: number, callback?: () => void) => void
  setScrollLeft: (left: number, callback?: () => void) => void
  onScroll: (top: number, left: number) => void
  onVisibleChange: (
    startIndex: number,
    endIndex: number,
    visibleItems: CwVirtualScrollItem<TData>[],
  ) => void
}

/**
 * 虚拟滚动监听 Hook（React 版）
 */
export function useVirtualScrollWatchers<TData = unknown>(
  options: UseVirtualScrollWatchersOptions<TData>,
) {
  const onVisibleChangeRef = useRef(options.onVisibleChange)

  useEffect(() => {
    onVisibleChangeRef.current = options.onVisibleChange
  })

  // 监听可见范围变化（immediate）
  const { startIndex, endIndex } = options.visibleRange
  useEffect(() => {
    const visibleItemsList = options.visibleItems.map((item) => ({
      key: item.key,
      data: item.data,
      height: item.height,
      width: item.width,
    }))
    onVisibleChangeRef.current(startIndex, endIndex, visibleItemsList)
    // 仅跟可见下标 / 可见项
  }, [startIndex, endIndex, options.visibleItems])

  // 仅跟数组引用 / 长度，禁止 deep（百万行 deep 会卡死主线程）
  const items = options.items
  useLayoutEffect(() => {
    options.setScrollTop(options.scrollTop)
    // 只在 items 变化时重新钳制滚动位置
  }, [items, items.length])

  // 监听容器尺寸变化，重新计算滚动位置（确保滚动位置在有效范围内）
  const previousSizeRef = useRef({
    height: options.containerHeight,
    width: options.containerWidth,
  })

  useLayoutEffect(() => {
    const previous = previousSizeRef.current
    const newHeight = options.containerHeight
    const newWidth = options.containerWidth
    previousSizeRef.current = { height: newHeight, width: newWidth }

    // 避免初始化时（尺寸为 0）触发，或者尺寸没有实际变化
    if ((newHeight === 0 && newWidth === 0) || (newHeight === previous.height && newWidth === previous.width)) {
      return
    }

    // 重新设置滚动位置，触发边界限制
    if (options.direction === 'horizontal') {
      options.setScrollLeft(options.scrollLeft)
    } else if (options.direction === 'both') {
      options.setScrollTop(options.scrollTop)
      options.setScrollLeft(options.scrollLeft)
    } else {
      options.setScrollTop(options.scrollTop)
    }
  }, [options.containerHeight, options.containerWidth, options.direction])
}
