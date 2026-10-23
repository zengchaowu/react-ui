import type { CwWaterfallStyles } from './types'

export const waterfallBase: CwWaterfallStyles = {
  root: 'cw-waterfall flex h-full min-h-0 w-full flex-col',
  rootLoading: 'cw-waterfall--loading',
  inner: 'cw-waterfall__inner relative w-full',
  container: 'flex w-full min-w-0',
  column: 'cw-waterfall-column flex min-w-0 flex-col',
  item: 'cw-waterfall-item w-full min-w-0',
  loading: 'cw-waterfall-loading mt-4 [overflow-anchor:none]',
  loadingContent: 'flex items-center justify-center gap-2 py-4',
  loadingText: 'text-sm text-[var(--text-color-secondary)]',
  empty: 'cw-waterfall-empty mt-4',
  emptyContent: 'flex flex-col justify-center items-center py-8 text-[var(--text-color-placeholder)]',
  emptyIcon: 'text-6xl mb-2',
  emptyText: '',
  finished: 'cw-waterfall-finished mt-4 [overflow-anchor:none]',
  finishedContent: 'flex justify-center items-center py-4 text-[var(--text-color-placeholder)]',
  finishedText: '',
}
