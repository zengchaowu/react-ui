import type { TpCherryMarkdownStyles } from './types'

export const defaultStyles: TpCherryMarkdownStyles = {
  root: 'tp-cherry-markdown w-full h-full flex flex-col bg-[var(--bg-color-container)] border border-[var(--border-color-light)] rounded-lg overflow-hidden',
  toolbar: 'flex items-center justify-between px-4 py-2 hairline-border-b border-[var(--border-color-light)] bg-[var(--bg-color-secondarycontainer)]',
  toolbarLeft: 'flex items-center space-x-2',
  toolbarRight: 'flex items-center space-x-2',
  button: 'px-3 py-1.5 text-sm font-medium text-[var(--text-color-secondary)] bg-[var(--bg-color-container)] border border-[var(--component-border)] rounded-md hover:bg-[var(--bg-color-component-hover)] transition-colors duration-200 cursor-pointer',
  buttonActive: 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)] border-[var(--brand-color-6)] hover:bg-[var(--brand-color-hover)]',
  buttonGroup: 'flex items-center border border-[var(--component-border)] rounded-md overflow-hidden',
  buttonGroupButton: 'px-3 py-1.5 text-sm font-medium text-[var(--text-color-secondary)] bg-[var(--bg-color-container)] hover:bg-[var(--bg-color-component-hover)] transition-colors duration-200 cursor-pointer border-r border-[var(--component-border)] last:border-r-0',
  buttonGroupButtonActive: 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)] hover:bg-[var(--brand-color-hover)]',
  content: 'flex-1 flex min-h-0',
  editor: 'flex-1 border-r border-[var(--border-color-light)]',
  editorHeader: 'px-4 py-2 hairline-border-b border-[var(--border-color-light)] bg-[var(--bg-color-secondarycontainer)]',
  editorTitle: 'text-sm font-medium text-[var(--text-color-secondary)]',
  editorContent: 'h-full',
  preview: 'flex-1',
  previewHeader: 'px-4 py-2 hairline-border-b border-[var(--border-color-light)] bg-[var(--bg-color-secondarycontainer)]',
  previewTitle: 'text-sm font-medium text-[var(--text-color-secondary)]',
  previewContent: 'h-full overflow-y-auto p-4',
  loading: 'flex items-center justify-center h-full bg-[var(--bg-color-secondarycontainer)]',
  loadingSpinner: 'animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-color-6)]',
  loadingText: 'ml-2 text-[var(--text-color-secondary)]',
  error: 'flex flex-col items-center justify-center h-full bg-[var(--button-danger-tint-hover-bg)]',
  errorIcon: 'w-12 h-12 text-[var(--error-color-6)] mb-4',
  errorText: 'text-[var(--error-color-6)] text-lg font-semibold mb-2',
  retryButton: 'px-4 py-2 bg-[var(--error-color-6)] text-[var(--text-color-anti)] rounded-md hover:bg-[var(--error-color-hover)] transition-colors'
}
