import type { CwIndicatorStyles } from './types'

export const defaultStyles: CwIndicatorStyles = {
  root: 'cw-indicator inline-flex items-center justify-center',
  container: 'relative flex items-center justify-center',
  dot: 'relative shrink-0 rounded-full',
  dotActive: '',
  line: '',
  spacer: 'shrink-0',
  highlight: '',
  highlightDot: '',
  highlightLine: 'absolute shrink-0 rounded-full',
  numberedRoot: 'cw-indicator flex w-full justify-center',
  numberedViewport: 'flex items-center',
  numberedViewportScroll:
    'mx-auto max-w-full overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  numberedViewportStatic: 'justify-center',
  numberChip:
    'inline-flex shrink-0 items-center justify-center rounded-full [font-size:var(--font-size-xs)] leading-none font-medium tabular-nums transition-colors',
  numberChipActive: 'text-[var(--text-color-anti)]',
  numberChipInactive: 'text-[var(--text-color-secondary)]',
}
