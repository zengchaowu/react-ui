import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import { calculateHeaderAlignmentStyle, calculateScrollbarWidth } from '../functions'

export interface UseScrollbarAlignmentOptions {
  bodyEl: HTMLElement | null
  bodyElRef: RefObject<HTMLElement | null>
  containerHeight: number
  displayedRowCount: number
  columnWidths: Record<string, number>
  visibleColumnCount: number
  /** 数据加载结束后布局变化，需重新测量纵向滚动条占位 */
  loading: boolean
}

/**
 * 滚动条对齐 Hook
 * 用于处理表头和表体的滚动条对齐问题
 */
export function useScrollbarAlignment(options: UseScrollbarAlignmentOptions) {
  const { bodyEl, bodyElRef, containerHeight, displayedRowCount } = options

  const [scrollbarWidth, setScrollbarWidth] = useState(0)

  const updateScrollbarWidth = useCallback(() => {
    setScrollbarWidth(calculateScrollbarWidth(bodyElRef.current))
  }, [bodyElRef])

  const headerStyle = useMemo<CSSProperties>(
    () => calculateHeaderAlignmentStyle(scrollbarWidth) as CSSProperties,
    [scrollbarWidth],
  )

  useEffect(() => {
    const frame = requestAnimationFrame(updateScrollbarWidth)
    return () => cancelAnimationFrame(frame)
  }, [
    containerHeight,
    displayedRowCount,
    options.columnWidths,
    options.visibleColumnCount,
    options.loading,
    updateScrollbarWidth,
  ])

  useEffect(() => {
    if (!bodyEl || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(updateScrollbarWidth)
    })
    observer.observe(bodyEl)
    return () => observer.disconnect()
  }, [bodyEl, updateScrollbarWidth])

  return {
    scrollbarWidth,
    headerStyle,
    updateScrollbarWidth,
  }
}
