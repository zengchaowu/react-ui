import { useCallback, useEffect, useRef, useState } from 'react'
import {
  normalizeLoopPage,
  stepLoopPageByDelta,
  stepLoopPageByDragDistance,
} from '../functions'

/**
 * 水平分页 + 无限循环时的逻辑页状态机。
 * 页码只随拖拽距离 / 滚轮步数变化，不读绝对 scrollLeft。
 */
export function usePagedLoopPage(options: {
  enabled: boolean
  itemCount: number
  pageWidth: number
  snapThreshold: number
}) {
  const [pageIndex, setPageIndexState] = useState(0)
  const pageIndexRef = useRef(0)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const updatePageIndex = useCallback((next: number) => {
    pageIndexRef.current = next
    setPageIndexState(next)
  }, [])

  useEffect(() => {
    const len = Math.max(0, options.itemCount)
    if (len <= 0) {
      updatePageIndex(0)
      return
    }
    if (pageIndexRef.current >= len) {
      updatePageIndex(len - 1)
    }
  }, [options.itemCount, updatePageIndex])

  const peekByDragDistance = useCallback((dragDistance: number) => {
    const current = optionsRef.current
    if (!current.enabled) return pageIndexRef.current
    return stepLoopPageByDragDistance(
      pageIndexRef.current,
      dragDistance,
      current.pageWidth,
      Math.max(0, current.itemCount),
      current.snapThreshold,
    )
  }, [])

  const commitByDragDistance = useCallback(
    (dragDistance: number) => {
      const current = optionsRef.current
      if (!current.enabled) return
      updatePageIndex(
        stepLoopPageByDragDistance(
          pageIndexRef.current,
          dragDistance,
          current.pageWidth,
          Math.max(0, current.itemCount),
          current.snapThreshold,
        ),
      )
    },
    [updatePageIndex],
  )

  const commitByDelta = useCallback(
    (deltaPages: number) => {
      const current = optionsRef.current
      if (!current.enabled || deltaPages === 0) return
      updatePageIndex(
        stepLoopPageByDelta(
          pageIndexRef.current,
          deltaPages,
          Math.max(0, current.itemCount),
        ),
      )
    },
    [updatePageIndex],
  )

  const setPage = useCallback(
    (index: number) => {
      const current = optionsRef.current
      updatePageIndex(normalizeLoopPage(index, Math.max(0, current.itemCount)))
    },
    [updatePageIndex],
  )

  return {
    pageIndex,
    pageIndexRef,
    peekByDragDistance,
    commitByDragDistance,
    commitByDelta,
    setPage,
  }
}
