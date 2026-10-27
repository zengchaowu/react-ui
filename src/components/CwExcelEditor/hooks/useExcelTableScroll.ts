import type { MutableRefObject } from 'react'
import {
  EDGE_GROW_INTERVAL,
  EDGE_SLACK,
  SHEET_COL_CHUNK,
  SHEET_ROW_CHUNK,
  SHEET_ROW_HEIGHT,
} from '../functions/sheetMetrics'

/**
 * 表格滚动域：列窗同步、滚到边缘按块放大可视行列数，并保持横向停在增长后的右端。
 */
export function useExcelTableScroll(opts: {
  closeContextMenuRef: MutableRefObject<(() => void) | null>
  ignoreEdgeGrowRef: MutableRefObject<number>
  rowGrowAtRef: MutableRefObject<number>
  colGrowAtRef: MutableRefObject<number>
  paintedScrollBucketRef: MutableRefObject<number>
  viewRowsRef: MutableRefObject<number>
  setViewRows: (value: number) => void
  viewColsRef: MutableRefObject<number>
  setViewCols: (value: number) => void
  syncColumnWindow: (scrollLeft: number) => void
  schedulePaint: () => void
  sheetViewport: () => HTMLElement | null
}) {
  const { closeContextMenuRef, ignoreEdgeGrowRef, paintedScrollBucketRef } = opts

  function pinScrollLeft(viewport: HTMLElement, left: number) {
    const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth)
    const next = Math.min(Math.max(0, left), max)
    if (Math.abs(viewport.scrollLeft - next) <= 1) return
    viewport.scrollLeft = next
  }

  /** 列宽落地可能晚一帧。连续几帧把滚动位置留在增长后的右端，并忽略由此触发的滚动。 */
  function keepHorizontalEnd(
    viewport: HTMLElement,
    baseScrollLeft: number,
    baseScrollWidth: number,
  ) {
    ignoreEdgeGrowRef.current += 1
    let frames = 0
    const step = () => {
      const grown = Math.max(0, viewport.scrollWidth - baseScrollWidth)
      pinScrollLeft(viewport, baseScrollLeft + grown)
      frames += 1
      if (frames < 3) {
        requestAnimationFrame(step)
        return
      }
      ignoreEdgeGrowRef.current = Math.max(0, ignoreEdgeGrowRef.current - 1)
    }
    requestAnimationFrame(step)
  }

  function onTableScroll(scrollTop: number, scrollLeft: number) {
    closeContextMenuRef.current?.()
    opts.syncColumnWindow(scrollLeft)
    // 合并块画在滚动内容里，跟着内容走，不必每个滚动像素重测。
    // 选中框在行被虚拟列表换掉之后补一次即可。
    const bucket = Math.floor(scrollTop / SHEET_ROW_HEIGHT)
    if (bucket !== paintedScrollBucketRef.current) {
      paintedScrollBucketRef.current = bucket
      opts.schedulePaint()
    }
    if (ignoreEdgeGrowRef.current > 0) return
    const viewport = opts.sheetViewport()
    if (!viewport) return
    const now = performance.now()
    if (
      scrollTop > 0 &&
      viewport.scrollHeight - scrollTop - viewport.clientHeight < EDGE_SLACK &&
      now - opts.rowGrowAtRef.current >= EDGE_GROW_INTERVAL
    ) {
      opts.rowGrowAtRef.current = now
      opts.setViewRows(opts.viewRowsRef.current + SHEET_ROW_CHUNK)
    }
    const slackRight = viewport.scrollWidth - scrollLeft - viewport.clientWidth
    if (scrollLeft > 0 && slackRight <= 1 && now - opts.colGrowAtRef.current >= EDGE_GROW_INTERVAL) {
      opts.colGrowAtRef.current = now
      const widthBefore = viewport.scrollWidth
      opts.setViewCols(opts.viewColsRef.current + SHEET_COL_CHUNK)
      keepHorizontalEnd(viewport, scrollLeft, widthBefore)
    }
  }

  return { onTableScroll }
}
