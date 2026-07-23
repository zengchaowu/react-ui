import type { CwInfiniteScrollStyles } from './types'

export const defaultStyles: CwInfiniteScrollStyles = {
  root: 'cw-infinite-scroll relative flex min-h-0 min-w-0 flex-1 flex-col',
  content: '',
  loading: 'flex items-center justify-center p-4',
  loadingSpinner: 'animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--brand-color-6)]',
  loadingText: 'ml-2 text-[var(--text-color-secondary)]',
  error: 'text-[var(--error-color-6)] text-center p-4',
  retryButton: 'mt-2 px-4 py-2 bg-[var(--brand-color-6)] text-[var(--text-color-anti)] rounded hover:bg-[var(--brand-color-hover)] transition-colors'
}
