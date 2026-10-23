export function resolveTickWidthPx(tickWidthRem: number, rootFontSizePx = 16): number {
  if (!Number.isFinite(tickWidthRem) || tickWidthRem <= 0) return tickWidthRem * 16
  return tickWidthRem * rootFontSizePx
}

export function readRootFontSizePx(): number {
  if (typeof document === 'undefined') return 16
  const parsed = parseFloat(getComputedStyle(document.documentElement).fontSize)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 16
}

export function indexToTrackOffset(
  index: number,
  viewportWidth: number,
  tickWidthPx: number,
): number {
  return viewportWidth / 2 - index * tickWidthPx - tickWidthPx / 2
}

export function trackOffsetToIndex(
  offset: number,
  viewportWidth: number,
  tickWidthPx: number,
): number {
  return Math.round((viewportWidth / 2 - offset - tickWidthPx / 2) / tickWidthPx)
}

export function resolveTrackOffsetBounds(
  optionCount: number,
  viewportWidth: number,
  tickWidthPx: number,
): { minOffset: number; maxOffset: number } {
  const lastIndex = Math.max(0, optionCount - 1)
  return {
    minOffset: indexToTrackOffset(lastIndex, viewportWidth, tickWidthPx),
    maxOffset: indexToTrackOffset(0, viewportWidth, tickWidthPx),
  }
}

export function clampTrackOffset(
  offset: number,
  minOffset: number,
  maxOffset: number,
): number {
  return Math.min(maxOffset, Math.max(minOffset, offset))
}

export function clampOptionIndex(index: number, optionCount: number): number {
  if (optionCount <= 0) return 0
  return Math.min(optionCount - 1, Math.max(0, index))
}
