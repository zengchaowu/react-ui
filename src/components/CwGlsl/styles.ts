import type { CwGlslStyles } from './types'

export const defaultStyles: CwGlslStyles = {
  root: 'cw-glsl w-full h-full relative',
  canvas: 'w-full h-full',
  controls: 'absolute top-4 right-4 flex flex-col space-y-2',
  controlButton: 'w-10 h-10 bg-[var(--bg-color-container)] border border-[var(--component-border)] rounded-md shadow-sm flex items-center justify-center hover:bg-[var(--bg-color-component-hover)] transition-colors duration-200 cursor-pointer',
  controlButtonActive: 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)] border-[var(--brand-color-6)] hover:bg-[var(--brand-color-hover)]',
  shaderEditor: 'absolute top-4 left-4 w-80 bg-[var(--bg-color-container)] border border-[var(--component-border)] rounded-md shadow-sm',
  shaderHeader: 'px-4 py-2 hairline-border-b border-[var(--border-color-light)] bg-[var(--bg-color-secondarycontainer)]',
  shaderTitle: 'text-sm font-semibold text-[var(--text-color-secondary)]',
  shaderContent: 'p-4',
  shaderTextarea: 'w-full h-32 text-xs font-mono border border-[var(--component-border)] rounded p-2 resize-none',
  shaderButton: 'mt-2 px-3 py-1 text-xs bg-[var(--brand-color-6)] text-[var(--text-color-anti)] rounded hover:bg-[var(--brand-color-hover)] transition-colors',
  loading: 'flex items-center justify-center h-full bg-[var(--bg-color-secondarycontainer)]',
  loadingSpinner: 'animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-color-6)]',
  loadingText: 'ml-2 text-[var(--text-color-secondary)]',
  error: 'flex flex-col items-center justify-center h-full bg-[var(--button-danger-tint-hover-bg)]',
  errorIcon: 'w-12 h-12 text-[var(--error-color-6)] mb-4',
  errorText: 'text-[var(--error-color-6)] text-lg font-semibold mb-2',
  retryButton: 'px-4 py-2 bg-[var(--error-color-6)] text-[var(--text-color-anti)] rounded-md hover:bg-[var(--error-color-hover)] transition-colors'
}
