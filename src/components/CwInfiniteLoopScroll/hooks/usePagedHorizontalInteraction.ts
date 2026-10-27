import { useCallback, useRef } from 'react'
import { stepLoopPageByDragDistance } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/stepLoopPage'
import { resolveScrollLeftForPage } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/functions/resolveScrollLeftForPage'
import { usePagedLoopPage } from './usePagedLoopPage'

type MiddleCopyInfo = {
  left: number
  leftEnd?: number
} | null

type DragScrollMeta = {
  top: number
  left: number
  commit?: boolean
  commitTop?: number
  commitLeft?: number
}

/**
 * 水平分页 + 无限循环：逻辑页状态、绝对页吸附、拖拽 preview/commit emit。
 */
export function usePagedHorizontalInteraction(options: {
  enabled: boolean
  itemCount: number
  pageWidth: number
  snapThreshold: number
  scrollTopRef: { current: number }
  scrollLeftRef: { current: number }
  middleCopyInfo: MiddleCopyInfo
  emitScroll: (
    top: number,
    left: number,
    centerIndex: number | null,
    isPreview?: boolean,
  ) => void
}) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const {
    pageIndex,
    pageIndexRef,
    peekByDragDistance,
    commitByDragDistance,
    commitByDelta,
    setPage,
  } = usePagedLoopPage({
    enabled: options.enabled,
    itemCount: options.itemCount,
    pageWidth: options.pageWidth,
    snapThreshold: options.snapThreshold,
  })

  const scrollLeftForPage = useCallback((page: number) => {
    const current = optionsRef.current
    return resolveScrollLeftForPage(
      page,
      current.scrollLeftRef.current,
      current.pageWidth,
      current.middleCopyInfo,
    )
  }, [])

  const snapByDrag = useCallback(
    (
      _startTop: number,
      startLeft: number,
      currentTop: number,
      currentLeft: number,
    ) => {
      const current = optionsRef.current
      const pageW = current.pageWidth
      const count = Math.max(0, current.itemCount)
      if (pageW <= 0 || count <= 0) {
        return { top: currentTop, left: currentLeft }
      }
      const nextPage = stepLoopPageByDragDistance(
        pageIndexRef.current,
        currentLeft - startLeft,
        pageW,
        count,
        current.snapThreshold,
      )
      return { top: currentTop, left: scrollLeftForPage(nextPage) }
    },
    [pageIndexRef, scrollLeftForPage],
  )

  const handleDragScroll = useCallback(
    (top: number, left: number, dragMeta?: DragScrollMeta) => {
      const current = optionsRef.current
      if (!current.enabled) return false

      if (dragMeta && !dragMeta.commit) {
        current.emitScroll(top, left, peekByDragDistance(left - dragMeta.left), true)
        return true
      }

      if (dragMeta?.commit) {
        // 用手指拖拽距离提交（勿用吸附目标差：最短环路径会把距离拧歪）
        commitByDragDistance(left - dragMeta.left)
        current.emitScroll(top, left, pageIndexRef.current, false)
        return true
      }

      current.emitScroll(top, left, pageIndexRef.current, false)
      return true
    },
    [commitByDragDistance, pageIndexRef, peekByDragDistance],
  )

  /** @returns 吸附目标 left；delta=0 时返回 null */
  const commitWheelDelta = useCallback(
    (delta: number): number | null => {
      const current = optionsRef.current
      if (!current.enabled || delta === 0) return null
      commitByDelta(delta > 0 ? 1 : -1)
      current.emitScroll(
        current.scrollTopRef.current,
        current.scrollLeftRef.current,
        pageIndexRef.current,
        false,
      )
      return scrollLeftForPage(pageIndexRef.current)
    },
    [commitByDelta, pageIndexRef, scrollLeftForPage],
  )

  return {
    pageIndex,
    pageIndexRef,
    setPage,
    snapByDrag,
    handleDragScroll,
    commitWheelDelta,
    scrollLeftForPage,
  }
}
