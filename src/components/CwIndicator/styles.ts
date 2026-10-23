import type { CwIndicatorStyles } from './types'

export const indicatorBase: CwIndicatorStyles = {
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
    // 不用 scroll-smooth：否则 scrollIntoView(behavior:auto) 在部分浏览器仍会平滑滚，像闪动
    'mx-auto max-w-full overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  numberedViewportStatic: 'justify-center',
  numberChip:
    // 无 transition：分页跳变（含循环 末→首）时颜色过渡会像指示器闪一下
    'inline-flex shrink-0 items-center justify-center rounded-full [font-size:var(--font-size-xs)] leading-none font-medium tabular-nums',
  numberChipActive: 'text-[var(--text-color-anti)]',
  numberChipInactive: 'text-[var(--text-color-secondary)]',
}
