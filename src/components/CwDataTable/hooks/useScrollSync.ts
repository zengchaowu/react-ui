import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject, UIEvent as ReactUIEvent } from 'react'
import { flushSync } from 'react-dom'

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
    // 先物化新窗口的数据（业务回调会直接读写渲染用的稀疏行数组），
    // 再用 flushSync 同步提交滚动位置：超长列表的滚动位置是按比例压缩映射的，
    // 一帧内可能跳动几十万像素。若渲染被排到绘制之后，就会出现
    // 「滚动条已经移动、行还停在上一个窗口」的白屏帧。
    if ((top != null || left != null) && onScrollRef.current) {
      onScrollRef.current(top ?? 0, left ?? 0)
    }
    if (top != null || left != null) {
      flushSync(() => {
        if (top != null) setScrollTop(top)
        if (left != null) setScrollLeft(left)
      })
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
      const target = event.target as HTMLElement | null
      if (!target) return

      // 纵向/横向的位置一律记录：isSyncingRef 只用于拦截表头/外部行横向联动
      // 回写触发的回声事件，不能把用户的滚动事件整体丢掉（丢掉后直接松手，
      // 表体会一直停在上一个窗口，表现为整块白屏）。
      pendingScrollTopRef.current = target.scrollTop
      pendingScrollLeftRef.current = target.scrollLeft
      scrollLeftRef.current = target.scrollLeft
      scheduleScrollFlush()

      if (isSyncingRef.current) return

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
    },
    [externalRowRef, headerRef, scheduleScrollFlush, stopSyncing],
  )

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
    /** 回声拦截标记，与 useExternalRowScrollSync 共用 */
    isSyncingRef,
    stopSyncing,
  }
}
