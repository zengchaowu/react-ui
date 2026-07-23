import type { TpGsapStyles } from './types'

export const defaultStyles: TpGsapStyles = {
  root: 'tp-gsap w-full h-full relative',
  container: 'w-full h-full',
  controls: 'absolute top-4 right-4 z-[var(--z-index-sticky)] flex flex-col space-y-2',
  controlButton: 'w-10 h-10 bg-[var(--bg-color-container)] border border-[var(--component-border)] rounded-md shadow-sm flex items-center justify-center hover:bg-[var(--bg-color-component-hover)] transition-colors duration-200 cursor-pointer',
  controlButtonActive: 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)] border-[var(--brand-color-6)] hover:bg-[var(--brand-color-hover)]',
  timeline: 'absolute bottom-4 left-4 right-4 z-[var(--z-index-sticky)] bg-[var(--bg-color-container)] border border-[var(--component-border)] rounded-md shadow-sm p-4',
  timelineHeader: 'flex items-center justify-between mb-2',
  timelineTitle: 'text-sm font-semibold text-[var(--text-color-secondary)]',
  timelineControls: 'flex items-center space-x-2',
  timelineButton: 'w-8 h-8 bg-[var(--bg-color-component)] border border-[var(--component-border)] rounded flex items-center justify-center hover:bg-[var(--bg-color-secondarycomponent-hover)] transition-colors duration-200 cursor-pointer',
  timelineButtonActive: 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)] border-[var(--brand-color-6)] hover:bg-[var(--brand-color-hover)]',
  timelineProgress: 'w-full h-2 bg-[var(--bg-color-secondarycomponent)] rounded-full overflow-hidden',
  timelineProgressFill: 'h-full bg-[var(--brand-color-6)] transition-all duration-100',
  timelineTime: 'text-xs text-[var(--text-color-placeholder)] mt-1',
  loading: 'flex items-center justify-center h-full bg-[var(--bg-color-secondarycontainer)]',
  loadingSpinner: 'animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-color-6)]',
  loadingText: 'ml-2 text-[var(--text-color-secondary)]',
  error: 'flex flex-col items-center justify-center h-full bg-[var(--button-danger-tint-hover-bg)]',
  errorIcon: 'w-12 h-12 text-[var(--error-color-6)] mb-4',
  errorText: 'text-[var(--error-color-6)] text-lg font-semibold mb-2',
  retryButton: 'px-4 py-2 bg-[var(--error-color-6)] text-[var(--text-color-anti)] rounded-md hover:bg-[var(--error-color-hover)] transition-colors'
}
