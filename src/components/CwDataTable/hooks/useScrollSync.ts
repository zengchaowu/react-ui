import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject, UIEvent as ReactUIEvent } from 'react'

export interface UseScrollSyncOptions {
  headerRef: RefObject<HTMLDivElement | null>
  externalRowRef: RefObject<HTMLElement | null>
  bodyElRef: RefObject<HTMLElement | null>
  onScroll?: (scrollTop: number, scrollLeft: number) => void
}

/** 表头 / 表体 / external-row 三方横向滚动同步 + 滚动位置状态 */
export function useScrollSync(options: UseScrollSyncOptions) {
  const { headerRef, externalRowRef, bodyElRef, onScroll } = options

  const [scrollTop, setScrollTop] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const scrollLeftRef = useRef(0)
  scrollLeftRef.current = scrollLeft
  const isSyncingRef = useRef(false)

  // 滚动位置用 ref 暂存，rAF 统一 flush 到 state，
  // 避免拖动滚动条时每帧多次 setState 触发整表重渲染（Vue 响应式自动批处理，React 需要手动对齐）。
  const pendingScrollTopRef = useRef<number | null>(null)
  const pendingScrollLeftRef = useRef<number | null>(null)
  const scrollRafRef = useRef(0)
  const onScrollRef = useRef(onScroll)
  onScrollRef.current = onScroll

  const stopSyncing = useCallback(() => {
    requestAnimationFrame(() => {
      isSyncingRef.current = false
    })
  }, [])

  const flushScrollState = useCallback(() => {
    scrollRafRef.current = 0
    const top = pendingScrollTopRef.current
    const left = pendingScrollLeftRef.current
    pendingScrollTopRef.current = null
    pendingScrollLeftRef.current = null
    if (top != null) setScrollTop(top)
    if (left != null) {
      setScrollLeft(left)
      scrollLeftRef.current = left
    }
    if (top != null || left != null) {
      onScrollRef.current?.(top ?? 0, left ?? 0)
    }
  }, [])

  const scheduleScrollFlush = useCallback(() => {
    if (scrollRafRef.current) return
    scrollRafRef.current = requestAnimationFrame(flushScrollState)
  }, [flushScrollState])

  const handleHeaderScroll = useCallback(
    (event: ReactUIEvent<HTMLDivElement>) => {
      if (isSyncingRef.current) return
      const target = event.currentTarget
      isSyncingRef.current = true
      const body = bodyElRef.current
      if (body && Math.abs(target.scrollLeft - body.scrollLeft) > 1) {
        body.scrollLeft = target.scrollLeft
      }
      stopSyncing()
    },
    [bodyElRef, stopSyncing],
  )

  const handleBodyScroll = useCallback(
    (event: Event) => {
      if (isSyncingRef.current) return
      const target = event.target as HTMLElement | null
      if (!target) return

      // 横向 DOM 同步必须在回调内同步完成（与 Vue 一致），
      // 放到 state 驱动的 effect 里会晚一帧，导致表头/外部行跟随滞后。
      isSyncingRef.current = true
      const header = headerRef.current
      if (header && Math.abs(target.scrollLeft - header.scrollLeft) > 1) {
        header.scrollLeft = target.scrollLeft
      }
      const externalRow = externalRowRef.current
      if (externalRow && Math.abs(target.scrollLeft - externalRow.scrollLeft) > 1) {
        externalRow.scrollLeft = target.scrollLeft
      }
      stopSyncing()

      // 纵向/横向的 React state 更新与业务回调统一 rAF 节流，
      // 拖动滚动条时 60+ 次/秒的滚动事件只触发一次重渲染。
      pendingScrollTopRef.current = target.scrollTop
      pendingScrollLeftRef.current = target.scrollLeft
      scrollLeftRef.current = target.scrollLeft
      scheduleScrollFlush()
    },
    [externalRowRef, headerRef, scheduleScrollFlush, stopSyncing],
  )

  // 外部行横向滚动同步
  const handleExternalRowScroll = useCallback(
    (event: ReactUIEvent<HTMLDivElement>) => {
      if (isSyncingRef.current) return
      const target = event.currentTarget
      isSyncingRef.current = true
      const header = headerRef.current
      if (header && Math.abs(target.scrollLeft - header.scrollLeft) > 1) {
        header.scrollLeft = target.scrollLeft
      }
      const body = bodyElRef.current
      if (body && Math.abs(target.scrollLeft - body.scrollLeft) > 1) {
        body.scrollLeft = target.scrollLeft
      }
      stopSyncing()
    },
    [bodyElRef, headerRef, stopSyncing],
  )

  useEffect(() => {
    const el = externalRowRef.current
    if (!el || isSyncingRef.current) return
    if (Math.abs(el.scrollLeft - scrollLeft) <= 1) return
    isSyncingRef.current = true
    el.scrollLeft = scrollLeft
    stopSyncing()
  }, [externalRowRef, scrollLeft, stopSyncing])

  useEffect(() => {
    return () => {
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current)
    }
  }, [])

  return {
    scrollTop,
    scrollLeft,
    handleHeaderScroll,
    handleBodyScroll,
    handleExternalRowScroll,
  }
}
