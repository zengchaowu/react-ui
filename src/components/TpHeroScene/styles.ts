import type { TpHeroSceneStyles } from './types'

export const defaultStyles: TpHeroSceneStyles = {
  root: 'tp-hero-scene w-full h-full relative overflow-hidden',
  canvas: 'absolute inset-0 w-full h-full',
  overlay: 'absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--scrim-base)]',
  content:
    'relative z-[var(--z-index-sticky)] flex h-full w-full flex-col items-center justify-center text-[var(--text-color-anti)]',
  title: 'text-4xl md:text-6xl font-bold text-center mb-4',
  subtitle: 'text-xl md:text-2xl text-center mb-8 opacity-90',
  button:
    'px-8 py-3 bg-[var(--brand-color-6)] text-[var(--text-color-anti)] rounded-lg hover:bg-[var(--brand-color-hover)] transition-colors duration-200',
  controls: 'absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2',
  controlButton:
    'w-3 h-3 cursor-pointer rounded-full bg-[color-mix(in_srgb,var(--bg-color-container)_50%,transparent)] transition-all duration-200 hover:bg-[var(--bg-color-container)]',
  controlButtonActive: 'bg-[var(--bg-color-container)]',
  loading: 'flex items-center justify-center h-full bg-[var(--bg-color-container)]',
  loadingSpinner:
    'animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--text-color-anti)]',
  loadingText: 'ml-3 text-[var(--text-color-anti)] text-lg',
  error:
    'flex flex-col items-center justify-center h-full bg-[var(--button-danger-tint-hover-bg)]',
  errorIcon: 'w-16 h-16 text-[var(--error-color-special)] mb-4',
  errorText: 'text-[var(--error-color-special)] text-xl font-semibold mb-4',
  retryButton:
    'px-6 py-3 bg-[var(--error-color-6)] text-[var(--text-color-anti)] rounded-lg hover:bg-[var(--error-color-hover)] transition-colors',
}
