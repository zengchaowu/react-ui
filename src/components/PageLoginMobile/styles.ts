import type { PageLoginMobileStyles } from './types'

export const defaultStyles: PageLoginMobileStyles = {
  container: 'bg-[var(--bg-color-container)] pt-14',
  content: 'py-4 flex flex-col gap-3 max-w-sm mx-auto',
  segmentGroup: '',
  inputGroup: 'flex flex-col gap-0.5',
  errorMessage: 'text-xs text-[var(--error-color-6)]',
  globalError: 'p-2.5 bg-[var(--error-color-light)] border border-[var(--error-color-focus)] rounded-lg text-sm text-[var(--error-color-6)]',
  buttonGroup: '',
  privacyGroup: 'flex items-start gap-2',
  privacyLink: 'text-[var(--brand-color-6)] hover:text-[var(--brand-color-hover)] cursor-pointer'
}
