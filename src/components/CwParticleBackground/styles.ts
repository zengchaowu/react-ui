import type { CwParticleBackgroundStyles } from './types'

export const defaultStyles: CwParticleBackgroundStyles = {
  root: 'cw-particle-background w-full h-full relative overflow-hidden',
  canvas: 'absolute inset-0 w-full h-full',
  overlay:
    'absolute inset-0 bg-[color-mix(in_srgb,var(--scrim-base)_20%,transparent)]',
  content: 'relative w-full h-full',
  loading: 'flex items-center justify-center h-full bg-[var(--bg-color-secondarycontainer)]',
  loadingSpinner: 'animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-color-6)]',
  loadingText: 'ml-2 text-[var(--text-color-secondary)]',
  error: 'flex flex-col items-center justify-center h-full bg-[var(--button-danger-tint-hover-bg)]',
  errorIcon: 'w-12 h-12 text-[var(--error-color-6)] mb-4',
  errorText: 'text-[var(--error-color-6)] text-lg font-semibold mb-2',
  retryButton: 'px-4 py-2 bg-[var(--error-color-6)] text-[var(--text-color-anti)] rounded-md hover:bg-[var(--error-color-hover)] transition-colors'
}
