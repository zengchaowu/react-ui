import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * 滚动位置管理 Hook
 */
export function useScrollPosition() {
  const [scrollTop, setScrollTopState] = useState(0)
  const [scrollLeft, setScrollLeftState] = useState(0)

  const scrollTopRef = useRef(0)
  const scrollLeftRef = useRef(0)

  // 性能优化：使用 requestAnimationFrame 批量更新
  const rafIdRef = useRef<number | null>(null)
  const pendingScrollTopRef = useRef(0)
  const pendingScrollLeftRef = useRef(0)
  const pendingCallbackRef = useRef<(() => void) | undefined>(undefined)

  const setScrollTop = useCallback((newScrollTop: number, callback?: () => void) => {
    pendingScrollTopRef.current = newScrollTop
    scrollTopRef.current = newScrollTop
    setScrollTopState(newScrollTop)
    callback?.()
  }, [])

  const setScrollLeft = useCallback((newScrollLeft: number, callback?: () => void) => {
    pendingScrollLeftRef.current = newScrollLeft
    scrollLeftRef.current = newScrollLeft
    setScrollLeftState(newScrollLeft)
    callback?.()
  }, [])

  const updateScrollPositionDirect = useCallback(
    (newScrollTop: number, newScrollLeft: number, callback?: () => void) => {
      scrollTopRef.current = newScrollTop
      scrollLeftRef.current = newScrollLeft
      pendingScrollTopRef.current = newScrollTop
      pendingScrollLeftRef.current = newScrollLeft
      setScrollTopState(newScrollTop)
      setScrollLeftState(newScrollLeft)
      callback?.()
    },
    [],
  )

  const addPendingDelta = useCallback((deltaTop: number, deltaLeft: number) => {
    if (rafIdRef.current === null) {
      pendingScrollTopRef.current = scrollTopRef.current
      pendingScrollLeftRef.current = scrollLeftRef.current
    }
    pendingScrollTopRef.current += deltaTop
    pendingScrollLeftRef.current += deltaLeft
  }, [])

  const updateScrollPosition = useCallback((callback?: () => void) => {
    pendingCallbackRef.current = callback
    if (rafIdRef.current !== null) return

    rafIdRef.current = requestAnimationFrame(() => {
      const nextTop = pendingScrollTopRef.current
      const nextLeft = pendingScrollLeftRef.current
      scrollTopRef.current = nextTop
      scrollLeftRef.current = nextLeft
      setScrollTopState(nextTop)
      setScrollLeftState(nextLeft)

      const callbackToRun = pendingCallbackRef.current
      pendingCallbackRef.current = undefined
      rafIdRef.current = null
      callbackToRun?.()
    })
  }, [])

  const setPendingScrollTop = useCallback((value: number) => {
    pendingScrollTopRef.current = value
  }, [])

  const setPendingScrollLeft = useCallback((value: number) => {
    pendingScrollLeftRef.current = value
  }, [])

  useEffect(
    () => () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    },
    [],
  )

  return {
    scrollTop,
    scrollLeft,
    scrollTopRef,
    scrollLeftRef,
    updateScrollPosition,
    setScrollTop,
    setScrollLeft,
    updateScrollPositionDirect,
    setPendingScrollTop,
    setPendingScrollLeft,
    addPendingDelta,
  }
}
