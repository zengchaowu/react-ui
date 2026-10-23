import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { calculateContentTransform, clampScrollLeft, clampScrollTop } from '../functions'

export interface CwVirtualScrollScrollPosition {
  clampTop: (value: number) => number
  clampLeft: (value: number) => number
}

interface UseScrollPositionOptions {
  direction: 'vertical' | 'horizontal' | 'both'
  totalHeight: number
  totalWidth: number
  containerHeight: number
  containerWidth: number
  onScroll?: (top: number, left: number) => void
}

/**
 * 滚动位置管理 Hook（React 版，支持边界限制）
 */
export function useScrollPosition({
  direction,
  totalHeight,
  totalWidth,
  containerHeight,
  containerWidth,
  onScroll,
}: UseScrollPositionOptions) {
  const [scrollTop, setScrollTopState] = useState(0)
  const [scrollLeft, setScrollLeftState] = useState(0)

  // 同步镜像，供同一事件里连续读写（state 更新是异步的）
  const scrollTopRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const pendingScrollTopRef = useRef(0)
  const pendingScrollLeftRef = useRef(0)
  const onScrollRef = useRef(onScroll)

  useLayoutEffect(() => {
    onScrollRef.current = onScroll
  })

  const clampTop = useCallback(
    (value: number) => clampScrollTop(value, direction, totalHeight, containerHeight),
    [direction, totalHeight, containerHeight],
  )
  const clampLeft = useCallback(
    (value: number) => clampScrollLeft(value, direction, totalWidth, containerWidth),
    [direction, totalWidth, containerWidth],
  )

  const writeTop = (value: number) => {
    if (value === scrollTopRef.current) return false
    scrollTopRef.current = value
    setScrollTopState(value)
    return true
  }

  const writeLeft = (value: number) => {
    if (value === scrollLeftRef.current) return false
    scrollLeftRef.current = value
    setScrollLeftState(value)
    return true
  }

  const setScrollTop = useCallback(
    (newScrollTop: number, callback?: () => void) => {
      pendingScrollTopRef.current = newScrollTop
      const clamped = clampTop(newScrollTop)
      if (writeTop(clamped)) {
        pendingScrollTopRef.current = clamped
        onScrollRef.current?.(clamped, scrollLeftRef.current)
      }
      callback?.()
    },
    [clampTop],
  )

  const setScrollLeft = useCallback(
    (newScrollLeft: number, callback?: () => void) => {
      pendingScrollLeftRef.current = newScrollLeft
      const clamped = clampLeft(newScrollLeft)
      if (writeLeft(clamped)) {
        pendingScrollLeftRef.current = clamped
        onScrollRef.current?.(scrollTopRef.current, clamped)
      }
      callback?.()
    },
    [clampLeft],
  )

  const updateScrollPositionDirect = useCallback(
    (newScrollTop: number, newScrollLeft: number, callback?: () => void) => {
      const clampedTop = clampTop(newScrollTop)
      const clampedLeft = clampLeft(newScrollLeft)

      let changed = false
      if (writeTop(clampedTop)) {
        pendingScrollTopRef.current = clampedTop
        changed = true
      }
      if (writeLeft(clampedLeft)) {
        pendingScrollLeftRef.current = clampedLeft
        changed = true
      }

      if (changed) {
        onScrollRef.current?.(scrollTopRef.current, scrollLeftRef.current)
      }
      callback?.()

      return { clampedTop, clampedLeft }
    },
    [clampTop, clampLeft],
  )

  const updateScrollPosition = useCallback(
    (callback?: () => void) => {
      updateScrollPositionDirect(
        pendingScrollTopRef.current,
        pendingScrollLeftRef.current,
        callback,
      )
    },
    [updateScrollPositionDirect],
  )

  const setPendingScrollTop = useCallback((value: number) => {
    pendingScrollTopRef.current = value
  }, [])

  const setPendingScrollLeft = useCallback((value: number) => {
    pendingScrollLeftRef.current = value
  }, [])

  const getContentTransform = useCallback(
    () => calculateContentTransform(scrollTopRef.current, scrollLeftRef.current, direction),
    [direction],
  )

  return {
    scrollTop,
    scrollLeft,
    updateScrollPosition,
    setScrollTop,
    setScrollLeft,
    updateScrollPositionDirect,
    setPendingScrollTop,
    setPendingScrollLeft,
    getContentTransform,
  }
}
