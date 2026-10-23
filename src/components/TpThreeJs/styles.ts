import type { TpThreeJsStyles } from './types'

export const threeJsBase: TpThreeJsStyles = {
  root: 'tp-three-js relative overflow-hidden rounded-lg border border-[var(--border-color)]',
  loadingOverlay: 'absolute inset-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--bg-color-container)_75%,transparent)] z-[var(--z-index-sticky)]',
  loadingContent: 'text-center text-[var(--text-color-anti)]',
  loadingSpinner: 'animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-color-anti)] mx-auto mb-2',
  loadingText: 'text-sm',
  loadingSubtext: 'text-xs text-[var(--text-color-disabled)] mt-1',
  errorOverlay: 'absolute inset-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--error-color-active)_75%,transparent)] z-[var(--z-index-sticky)]',
  errorContent: 'text-center text-[var(--text-color-anti)] p-4',
  errorIcon: 'text-[var(--error-color-special)] mb-2',
  errorIconSvg: 'w-8 h-8 mx-auto',
  errorTitle: 'text-lg font-semibold mb-2',
  errorMessage: 'text-sm text-[var(--error-color-disabled)] mb-4',
  retryButton: 'px-4 py-2 bg-[var(--error-color-6)] text-[var(--text-color-anti)] rounded hover:bg-[var(--error-color-hover)] transition-colors',
  controlsOverlay: 'absolute top-4 left-4 z-[var(--z-index-float)]',
  controlsButton:
    'mr-2 rounded px-3 py-2 bg-[color-mix(in_srgb,var(--bg-color-page)_50%,transparent)] text-[var(--text-color-anti)] transition-all hover:bg-[color-mix(in_srgb,var(--bg-color-page)_75%,transparent)]',
  controlsButtonActive: 'px-3 py-2 bg-[var(--brand-color-6)] text-[var(--text-color-anti)] rounded hover:bg-[var(--brand-color-hover)] transition-all mr-2',
  statsContainer: 'absolute top-4 right-4 z-[var(--z-index-float)]',
  statsPanel:
    'rounded bg-[color-mix(in_srgb,var(--bg-color-page)_50%,transparent)] p-2 font-mono text-xs text-[var(--text-color-anti)]'
}
