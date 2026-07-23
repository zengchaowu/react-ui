import type { CwPullRefreshScrollStyles } from './types'

export const defaultCwPullRefreshScrollStyles: CwPullRefreshScrollStyles = {
  root: 'cw-pull-refresh-scroll relative flex min-h-0 min-w-0 flex-1 flex-col',
  scroll: 'h-full min-h-0 min-w-0 flex-1',
  pullIndicator:
    'flex min-h-0 shrink-0 flex-col items-center justify-end overflow-hidden text-xs text-[var(--text-color-secondary)] transition-[height] duration-150 ease-out',
  pullIndicatorHidden: 'h-0 opacity-0 pointer-events-none',
  pullIndicatorActive: 'opacity-100',
  pullText: 'pb-2 leading-none',
  content: 'min-w-0',
  footer:
    'flex shrink-0 items-center justify-center gap-2 py-3 text-xs text-[var(--text-color-secondary)]',
  footerHidden: 'hidden',
  footerText: 'leading-none',
}
