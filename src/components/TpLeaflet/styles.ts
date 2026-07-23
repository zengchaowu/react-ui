import type { TpLeafletStyles } from './types'

export const defaultStyles: TpLeafletStyles = {
  root: 'tp-leaflet w-full h-full relative',
  map: 'w-full h-full',
  controls: 'absolute top-4 right-4 z-[var(--z-index-sticky)] flex flex-col space-y-2',
  controlButton: 'w-10 h-10 bg-[var(--bg-color-container)] border border-[var(--component-border)] rounded-md shadow-sm flex items-center justify-center hover:bg-[var(--bg-color-component-hover)] transition-colors duration-200 cursor-pointer',
  controlButtonActive: 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)] border-[var(--brand-color-6)] hover:bg-[var(--brand-color-hover)]',
  loading: 'absolute inset-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--bg-color-container)_75%,transparent)] z-[var(--z-index-float)]',
  loadingSpinner: 'animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-color-6)]',
  loadingText: 'ml-2 text-[var(--text-color-secondary)]',
  error: 'absolute inset-0 flex flex-col items-center justify-center bg-[var(--button-danger-tint-hover-bg)] z-[var(--z-index-float)]',
  errorIcon: 'w-12 h-12 text-[var(--error-color-6)] mb-4',
  errorText: 'text-[var(--error-color-6)] text-lg font-semibold mb-2',
  retryButton: 'px-4 py-2 bg-[var(--error-color-6)] text-[var(--text-color-anti)] rounded-md hover:bg-[var(--error-color-hover)] transition-colors',
  popup: 'bg-[var(--bg-color-container)] rounded-lg shadow-lg p-4 max-w-xs',
  popupTitle: 'text-lg font-semibold text-[var(--text-color-primary)] mb-2',
  popupContent: 'text-sm text-[var(--text-color-secondary)]',
  marker: 'w-6 h-6 bg-[var(--brand-color-6)] rounded-full border-2 border-[var(--text-color-anti)] shadow-lg',
  markerActive: 'bg-[var(--error-color-6)]',
  tooltip:
    'bg-[var(--inverse-surface-bg)] text-[var(--inverse-surface-fg)] text-xs rounded px-2 py-1'
}
