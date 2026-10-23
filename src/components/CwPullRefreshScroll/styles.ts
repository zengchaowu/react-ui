import type { CwPullRefreshScrollStyles } from './types'

/** @internal */
export const pullRefreshScrollBase: CwPullRefreshScrollStyles = {
  root: 'cw-pull-refresh-scroll relative flex min-h-0 min-w-0 flex-1 flex-col',
  scroll: 'h-full min-h-0 min-w-0 flex-1',
  pullIndicator:
    'flex min-h-0 shrink-0 flex-col items-center justify-end overflow-hidden text-xs text-[var(--text-color-secondary)] transition-[height] duration-150 ease-out',
  pullIndicatorHidden: 'h-0 opacity-0 pointer-events-none',
  pullIndicatorActive: 'opacity-100',
  pullText: 'pb-2 leading-none',
  content: 'min-w-0',
  // overflow-anchor:none：Safari 在底部插入加载条时勿把视口跟着「沉」下去
  footer:
    'flex min-h-11 shrink-0 items-center justify-center gap-2 py-3 text-xs text-[var(--text-color-secondary)] [overflow-anchor:none]',
  // 空闲时保留极薄 sentinel，避免整块 footer 卸载；内容态再撑开 min-h
  footerHidden: 'min-h-0 h-px overflow-hidden py-0 opacity-0 pointer-events-none',
  footerText: 'leading-none',
}
