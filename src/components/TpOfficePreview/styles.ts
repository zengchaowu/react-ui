import type { TpOfficePreviewStyles } from './types'

export const officePreviewBase: TpOfficePreviewStyles = {
  root: 'tp-office-preview w-full h-full bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg overflow-hidden',
  loadingContainer: 'flex items-center justify-center h-full',
  loadingContent: 'flex flex-col items-center space-y-2',
  loadingSpinner: 'animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-color-6)]',
  loadingText: 'text-sm text-[var(--text-color-secondary)]',
  errorContainer: 'flex items-center justify-center h-full',
  errorContent: 'flex flex-col items-center space-y-2 text-center p-4',
  errorIcon: 'w-12 h-12 bg-[var(--button-danger-tint-active-bg)] rounded-full flex items-center justify-center',
  errorIconSvg: 'w-6 h-6 text-[var(--error-color-6)]',
  errorTitle: 'text-sm text-[var(--error-color-6)] font-medium',
  errorMessage: 'text-xs text-[var(--text-color-placeholder)]',
  retryButton: 'mt-2 px-3 py-1 text-xs bg-[var(--brand-color-6)] text-[var(--text-color-anti)] rounded hover:bg-[var(--brand-color-hover)] transition-colors cursor-pointer inline-block',
  previewContainer: 'w-full h-full',
  toolbar: 'flex items-center justify-between p-2 hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)]',
  toolbarLeft: 'flex items-center space-x-2',
  toolbarRight: 'flex items-center space-x-2',
  toolbarButton: 'px-2 py-1 text-xs bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded hover:bg-[var(--bg-color-component-hover)] transition-colors',
  toolbarButtonActive: 'px-2 py-1 text-xs bg-[var(--brand-color-6)] text-[var(--text-color-anti)] border border-[var(--brand-color-6)] rounded hover:bg-[var(--brand-color-hover)] transition-colors',
  toolbarButtonDisabled: 'px-2 py-1 text-xs bg-[var(--bg-color-component)] text-[var(--text-color-disabled)] border border-[var(--border-color)] rounded cursor-not-allowed',
  // 不支持的文件类型和无文档状态的样式
  unsupportedContainer: 'flex items-center justify-center h-full',
  unsupportedContent: 'flex flex-col items-center space-y-2 text-center p-4',
  unsupportedIcon: 'w-12 h-12 bg-[var(--bg-color-component)] rounded-full flex items-center justify-center',
  unsupportedIconSvg: 'w-6 h-6 text-[var(--text-color-placeholder)]',
  unsupportedTitle: 'text-sm text-[var(--text-color-secondary)] font-medium',
  unsupportedMessage: 'text-xs text-[var(--text-color-placeholder)]'
}
