import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import type { CwDataTableColumn } from '../types'
import { fixedSideHasWidth, getAllBodyDataRows } from '../functions'

/** 与 CwDiv 横向滚动条同一阈值：不足 1px 的差值不当成还能滚动 */
const OVERFLOW_EPSILON = 1

export interface UseFixedColumnOverlapOptions {
  bodyEl: HTMLElement | null
  bodyElRef: RefObject<HTMLElement | null>
  visibleColumns: CwDataTableColumn[]
  columnWidths: Record<string, number>
  scrollLeft: number
}

/**
 * 检测固定列是否与非固定列重叠。
 * scrollWidth / clientWidth 不是响应式的，列宽摊开后要重新测量，
 * 否则横向已经铺满、滚动条消失，右侧冻结列的阴影还留着。
 */
export function useFixedColumnOverlap(options: UseFixedColumnOverlapOptions) {
  const { bodyEl, bodyElRef, visibleColumns, columnWidths, scrollLeft } = options

  const [bodyScrollMetrics, setBodyScrollMetrics] = useState({
    scrollWidth: 0,
    clientWidth: 0,
  })

  const measureBodyOverflow = () => {
    const el = bodyElRef.current
    setBodyScrollMetrics({
      scrollWidth: el?.scrollWidth ?? 0,
      clientWidth: el?.clientWidth ?? 0,
    })
  }

  useEffect(() => {
    const el = bodyEl
    if (!el || typeof ResizeObserver === 'undefined') {
      measureBodyOverflow()
      return
    }
    const observer = new ResizeObserver(() => measureBodyOverflow())
    observer.observe(el)
    const scrollRoot = getAllBodyDataRows(el).length > 0 ? el.firstElementChild : null
    if (scrollRoot instanceof HTMLElement) observer.observe(scrollRoot)
    measureBodyOverflow()
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyEl, bodyElRef])

  useEffect(() => {
    const frame = requestAnimationFrame(measureBodyOverflow)
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleColumns, columnWidths, bodyElRef])

  const leftFixedOverlaps =
    fixedSideHasWidth(visibleColumns, columnWidths, 'left') && scrollLeft > 0
  const rightFixedOverlaps = (() => {
    if (!fixedSideHasWidth(visibleColumns, columnWidths, 'right')) return false
    const overflow = bodyScrollMetrics.scrollWidth - bodyScrollMetrics.clientWidth
    if (overflow <= OVERFLOW_EPSILON) return false
    return scrollLeft < overflow - OVERFLOW_EPSILON
  })()

  return {
    leftFixedOverlaps,
    rightFixedOverlaps,
  }
}
