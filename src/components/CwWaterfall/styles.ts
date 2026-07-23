import type { CwWaterfallStyles } from './types'

export const defaultStyles: CwWaterfallStyles = {
  root: 'cw-waterfall',
  rootLoading: 'cw-waterfall--loading',
  container: 'flex',
  column: 'cw-waterfall-column flex flex-col',
  item: 'cw-waterfall-item',
  loading: 'cw-waterfall-loading mt-4',
  loadingContent: 'flex justify-center items-center py-4',
  loadingSpinner: 'animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--text-color-primary)]',
  loadingText: 'ml-2',
  empty: 'cw-waterfall-empty mt-4',
  emptyContent: 'flex flex-col justify-center items-center py-8 text-[var(--text-color-placeholder)]',
  emptyIcon: 'text-6xl mb-2',
  emptyText: '',
  finished: 'cw-waterfall-finished mt-4',
  finishedContent: 'flex justify-center items-center py-4 text-[var(--text-color-placeholder)]',
  finishedText: ''
}
