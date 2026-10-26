import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject, UIEvent as ReactUIEvent } from 'react'

export interface UseScrollSyncOptions {
  headerRef: RefObject<HTMLDivElement | null>
  externalRowRef: RefObject<HTMLDivElement | null>
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

  const stopSyncing = useCallback(() => {
    requestAnimationFrame(() => {
      isSyncingRef.current = false
    })
  }, [])

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
      setScrollTop(target.scrollTop)
      setScrollLeft(target.scrollLeft)
      scrollLeftRef.current = target.scrollLeft

      isSyncingRef.current = true
      const header = headerRef.current
      if (header && Math.abs(target.scrollLeft - header.scrollLeft) > 1) {
        header.scrollLeft = target.scrollLeft
      }
      // 外部行同步必须发生在滚动回调内（与 Vue 一致），
      // 放到由 scrollLeft state 驱动的 effect 里会晚一帧以上，导致跟随滞后
      const externalRow = externalRowRef.current
      if (externalRow && Math.abs(target.scrollLeft - externalRow.scrollLeft) > 1) {
        externalRow.scrollLeft = target.scrollLeft
      }
      stopSyncing()

      onScroll?.(target.scrollTop, target.scrollLeft)
    },
    [externalRowRef, headerRef, onScroll, stopSyncing],
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

  return {
    scrollTop,
    scrollLeft,
    handleHeaderScroll,
    handleBodyScroll,
    handleExternalRowScroll,
  }
}
