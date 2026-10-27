import { type MutableRefObject, type RefObject } from 'react'
import { GUTTER_WIDTH, scrollSpanIntoView, sumWidths } from '../functions/sheetMetrics'
import { mergeCovering } from '../functions/workbook'
import { excelEditorBase } from '../styles'
import type { CwExcelWorkbook } from '../types'
import type { CellPosition } from './useExcelGridLayout'

const CELL_ON = excelEditorBase.cellSelected.split(/\s+/).filter(Boolean)
const MERGE_ON = excelEditorBase.mergeSelected.split(/\s+/).filter(Boolean)
const AXIS_ON = excelEditorBase.axisSelected.split(/\s+/).filter(Boolean)

type Sheet = CwExcelWorkbook['sheets'][number]
type PendingFrame = { row: number; col: number; scroll: boolean } | null

/**
 * 选中框绘制 / 滚动跟随 / 按帧合并滚动。
 *
 * 这些逻辑只碰 DOM 与布局访问器，不参与 React 渲染，单独成 hook 避免主组件膨胀。
 */
export function useExcelSelectionPaint(opts: {
  rootRef: RefObject<HTMLDivElement | null>
  headerRow: boolean
  paintedRef: MutableRefObject<HTMLElement[]>
  ignoreEdgeGrowRef: MutableRefObject<number>
  frameHandleRef: MutableRefObject<number>
  pendingFrameRef: MutableRefObject<PendingFrame>
  getActiveSheet: () => Sheet | undefined
  getSelection: () => CellPosition | null
  sheetViewport: () => HTMLElement | null
  layoutRowTop: (row: number, bodyStart: number) => number
  layoutRowSpanHeight: (row: number, span: number) => number
  layoutHeight: (row: number) => number
  layoutLeft: (col: number) => number
  layoutWidth: (col: number) => number
  syncColumnWindow: (scrollLeft: number) => void
}) {
  const { rootRef, paintedRef, ignoreEdgeGrowRef, frameHandleRef, pendingFrameRef } = opts

  function paintSelection(row: number, col: number) {
    const root = rootRef.current
    if (!root) return
    for (const el of paintedRef.current) {
      el.removeAttribute('data-excel-on')
      el.classList.remove(...CELL_ON, ...MERGE_ON, ...AXIS_ON)
    }
    paintedRef.current = []
    const mark = (selector: string, classes: string[]) => {
      const el = root.querySelector(selector)
      if (!(el instanceof HTMLElement)) return
      el.setAttribute('data-excel-on', '1')
      el.classList.add(...classes)
      paintedRef.current.push(el)
    }
    const sheet = opts.getActiveSheet()
    const merge = mergeCovering(sheet?.merges ?? [], row, col)
    const rowStart = merge?.row ?? row
    const rowEnd = merge ? merge.row + merge.rowspan : row + 1
    const colStart = merge?.col ?? col
    const colEnd = merge ? merge.col + merge.colspan : col + 1
    for (let index = rowStart; index < rowEnd; index += 1) {
      mark(`[data-excel-row="${index}"][data-excel-col="-1"]`, AXIS_ON)
    }
    for (let index = colStart; index < colEnd; index += 1) {
      mark(`[data-excel-row="-1"][data-excel-col="${index}"]`, AXIS_ON)
    }
    const anchorRow = merge?.row ?? row
    const anchorCol = merge?.col ?? col
    if (merge) {
      root.querySelectorAll(`[data-excel-merge="${anchorRow}:${anchorCol}"]`).forEach((node) => {
        if (!(node instanceof HTMLElement)) return
        node.setAttribute('data-excel-on', '1')
        node.classList.add(...MERGE_ON)
        paintedRef.current.push(node)
      })
    } else {
      mark(`[data-excel-row="${row}"][data-excel-col="${col}"]`, CELL_ON)
    }
  }

  function revealInView(row: number, col: number) {
    const viewport = opts.sheetViewport()
    if (!viewport) return
    ignoreEdgeGrowRef.current += 1
    const bodyStart = opts.headerRow ? 1 : 0
    const sheet = opts.getActiveSheet()
    const merge = mergeCovering(sheet?.merges ?? [], row, col)
    const anchorRow = merge?.row ?? row
    const anchorCol = merge?.col ?? col
    const top = opts.layoutRowTop(Math.max(bodyStart, anchorRow), bodyStart)
    const height = merge
      ? opts.layoutRowSpanHeight(anchorRow, merge.rowspan)
      : opts.layoutHeight(anchorRow)
    const cellLeft = opts.layoutLeft(anchorCol)
    const cellWidth = merge
      ? sumWidths(anchorCol, anchorCol + merge.colspan, opts.layoutWidth)
      : opts.layoutWidth(anchorCol)
    viewport.scrollTop = scrollSpanIntoView(viewport.scrollTop, viewport.clientHeight, top, height)
    viewport.scrollLeft = scrollSpanIntoView(
      viewport.scrollLeft,
      Math.max(0, viewport.clientWidth - GUTTER_WIDTH),
      Math.max(0, cellLeft - GUTTER_WIDTH),
      cellWidth,
    )
    opts.syncColumnWindow(viewport.scrollLeft)
    requestAnimationFrame(() => {
      ignoreEdgeGrowRef.current = Math.max(0, ignoreEdgeGrowRef.current - 1)
    })
  }

  /** 同一帧里的方向键只滚一次，跟到目标格。滚动过程中只补画选中框。 */
  function queueFrame(row: number, col: number, scroll: boolean) {
    const pending = pendingFrameRef.current
    if (pending) {
      pending.row = row
      pending.col = col
      pending.scroll ||= scroll
      return
    }
    pendingFrameRef.current = { row, col, scroll }
    frameHandleRef.current = requestAnimationFrame(() => {
      const job = pendingFrameRef.current
      pendingFrameRef.current = null
      frameHandleRef.current = 0
      if (!job) return
      paintSelection(job.row, job.col)
      if (job.scroll) revealInView(job.row, job.col)
    })
  }

  function schedulePaint() {
    const current = opts.getSelection()
    if (current) queueFrame(current.row, current.col, false)
  }

  function scheduleReveal(row: number, col: number) {
    queueFrame(row, col, true)
  }

  return { paintSelection, revealInView, queueFrame, schedulePaint, scheduleReveal }
}
