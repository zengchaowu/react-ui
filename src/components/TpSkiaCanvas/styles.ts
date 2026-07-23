import type { TpSkiaCanvasStyles } from './types'

export const defaultStyles: TpSkiaCanvasStyles = {
  root: 'tp-skia-canvas w-full h-full bg-[var(--bg-color-container)] border border-[var(--border-color-light)] rounded-lg overflow-hidden',
  canvas: 'w-full h-full',
  toolbar: 'flex items-center justify-between px-4 py-2 bg-[var(--bg-color-secondarycontainer)] hairline-border-b border-[var(--border-color-light)]',
  toolbarLeft: 'flex items-center space-x-2',
  toolbarRight: 'flex items-center space-x-2',
  button: 'px-3 py-1.5 text-xs font-medium text-[var(--text-color-secondary)] bg-[var(--bg-color-container)] border border-[var(--component-border)] rounded-md hover:bg-[var(--bg-color-component-hover)] transition-colors duration-200 cursor-pointer',
  buttonActive: 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)] border-[var(--brand-color-6)] hover:bg-[var(--brand-color-hover)]',
  loading: 'flex items-center justify-center h-full bg-[var(--bg-color-secondarycontainer)]',
  loadingSpinner: 'animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-color-6)]',
  loadingText: 'ml-2 text-[var(--text-color-secondary)]',
  error: 'flex flex-col items-center justify-center h-full bg-[var(--button-danger-tint-hover-bg)]',
  errorIcon: 'w-12 h-12 text-[var(--error-color-6)] mb-4',
  errorText: 'text-[var(--error-color-6)] text-lg font-semibold mb-2',
  retryButton: 'px-4 py-2 bg-[var(--error-color-6)] text-[var(--text-color-anti)] rounded-md hover:bg-[var(--error-color-hover)] transition-colors'
}
