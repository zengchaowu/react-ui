import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { resolveTableEdgeBorderOmits } from '../functions'

export interface UseTableEdgeBordersOptions {
  bodyEl: HTMLElement | null
  bodyElRef: RefObject<HTMLElement | null>
  displayedRowCount: number
  columnWidths: Record<string, number>
  containerHeight: number
  loading: boolean
  virtualScroll: boolean
  scrollLeft: number
}

/** 表体最后一行 / 最后一列边缘线是否省略（随滚动与尺寸变化重算） */
export function useTableEdgeBorders(options: UseTableEdgeBordersOptions) {
  const { bodyEl, bodyElRef, loading, virtualScroll } = options

  const [omitLastRowBottomBorder, setOmitLastRowBottomBorder] = useState(true)
  const [omitLastColumnRightBorder, setOmitLastColumnRightBorder] = useState(true)
  const edgeRafRef = useRef(0)
  const lastEdgeScrollLeftRef = useRef(-1)

  const syncTableEdgeBorders = useCallback(() => {
    const next = resolveTableEdgeBorderOmits(bodyElRef.current)
    setOmitLastRowBottomBorder((prev) =>
      prev === next.omitLastRowBottomBorder ? prev : next.omitLastRowBottomBorder,
    )
    setOmitLastColumnRightBorder((prev) =>
      prev === next.omitLastColumnRightBorder ? prev : next.omitLastColumnRightBorder,
    )
  }, [bodyElRef])

  const scheduleTableEdgeSync = useCallback(() => {
    if (edgeRafRef.current) return
    edgeRafRef.current = requestAnimationFrame(() => {
      edgeRafRef.current = 0
      syncTableEdgeBorders()
    })
  }, [syncTableEdgeBorders])

  useEffect(() => {
    const el = bodyEl
    if (!el || typeof ResizeObserver === 'undefined') {
      scheduleTableEdgeSync()
      return
    }
    const observer = new ResizeObserver(() => scheduleTableEdgeSync())
    observer.observe(el)
    const inner = el.firstElementChild
    if (inner) observer.observe(inner)
    scheduleTableEdgeSync()
    return () => observer.disconnect()
  }, [bodyEl, scheduleTableEdgeSync])

  useEffect(() => {
    scheduleTableEdgeSync()
  }, [
    options.displayedRowCount,
    options.columnWidths,
    options.containerHeight,
    loading,
    virtualScroll,
    scheduleTableEdgeSync,
  ])

  useEffect(() => {
    const el = bodyElRef.current
    if (!el) return
    if (options.scrollLeft === lastEdgeScrollLeftRef.current) return
    lastEdgeScrollLeftRef.current = options.scrollLeft

    const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth)
    let shouldMeasure = false
    if (maxLeft <= 0) {
      shouldMeasure = omitLastColumnRightBorder === false
    } else {
      const distToEnd = maxLeft - options.scrollLeft
      shouldMeasure =
        distToEnd <= 48 || (omitLastColumnRightBorder && distToEnd > 48)
    }
    if (shouldMeasure) scheduleTableEdgeSync()
  }, [bodyElRef, omitLastColumnRightBorder, scheduleTableEdgeSync, options.scrollLeft])

  return {
    omitLastRowBottomBorder,
    omitLastColumnRightBorder,
  }
}
