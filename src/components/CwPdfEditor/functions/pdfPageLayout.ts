import type { CwPdfPage, CwPdfRotation } from '../types'

export const A4_RATIO = 595.28 / 841.89
export const A4_RATIO_TURNED = 841.89 / 595.28

export const PAGE_STACK_GAP = 12
export const VIRTUAL_SCROLL_OVERSCAN = 480

export interface PdfPageSlot {
  index: number
  top: number
  height: number
}

export function pageAspectRatio(page: { sourceIndex: number; rotation: CwPdfRotation }, aspects: Record<string, number>) {
  const key = `${page.sourceIndex}:${page.rotation}`
  const ratio = aspects[key]
  if (ratio) return ratio
  return page.rotation === 90 || page.rotation === 270 ? A4_RATIO_TURNED : A4_RATIO
}

export function buildPageSlots(
  pages: CwPdfPage[],
  pageWidth: number,
  aspects: Record<string, number>,
): PdfPageSlot[] {
  let top = 0
  return pages.map((page, index) => {
    const height = pageWidth / pageAspectRatio(page, aspects)
    const slot = { index, top, height }
    top += height + PAGE_STACK_GAP
    return slot
  })
}

export function totalStackHeight(slots: PdfPageSlot[]) {
  const last = slots[slots.length - 1]
  return last ? last.top + last.height : 0
}

export function visiblePageSlots(slots: PdfPageSlot[], scrollTop: number, viewportHeight: number) {
  const start = scrollTop - VIRTUAL_SCROLL_OVERSCAN
  const end = scrollTop + viewportHeight + VIRTUAL_SCROLL_OVERSCAN
  return slots.filter((slot) => slot.top + slot.height >= start && slot.top <= end)
}

/** 根据滚动位置判断当前视口内主显示的是哪一页（用于页码）。 */
export function pageIndexAtScroll(slots: PdfPageSlot[], scrollTop: number, viewportHeight: number) {
  if (!slots.length) return 0
  const anchor = scrollTop + Math.min(viewportHeight * 0.32, 140)
  let last = 0
  for (const slot of slots) {
    const bottom = slot.top + slot.height
    if (anchor >= slot.top && anchor <= bottom + PAGE_STACK_GAP) return slot.index
    if (slot.top <= anchor) last = slot.index
  }
  return last
}

/** 已改 run 的摘要，用于 canvas 签名跳过无变化的重绘。 */
export function pageEditSignature(page: CwPdfPage) {
  return (page.runs ?? [])
    .filter((run) => run.text !== run.source)
    .map((run) => `${run.id}:${run.text}`)
    .join('|')
}
