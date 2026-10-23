import type { CwCalculateGridStyles } from './types'

export const calculateGridBase: CwCalculateGridStyles = {
  root: 'cw-calculate-grid',
  container: 'w-full h-full',
  loading: 'flex items-center justify-center h-64',
  loadingSpinner: 'animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-color-6)]',
  loadingText: 'ml-2 text-[var(--text-color-secondary)]',
  error: 'flex items-center justify-center h-64 text-[var(--error-color-6)]',
  errorIcon: 'w-6 h-6 mr-2',
  errorText: 'text-sm'
}
