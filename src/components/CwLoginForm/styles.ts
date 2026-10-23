import type { CwLoginFormStyles } from './types'

export const cwLoginFormBase: CwLoginFormStyles = {
  container: 'flex w-full min-w-0 flex-col',
  content: 'flex w-full min-w-0 flex-col gap-4',
  segmentGroup: 'w-full min-w-0',
  inputGroup: 'w-full min-w-0',
  errorMessage: 'mt-1 text-xs text-[var(--error-color-6)]',
  globalError:
    'rounded-[var(--radius-default)] border border-[var(--error-color-focus)] bg-[var(--error-color-light)] p-3 text-sm text-[var(--error-color-6)]',
  buttonGroup: 'w-full min-w-0 pt-1',
  privacyGroup: 'min-w-0 flex-1',
  privacyLink:
    'text-[var(--brand-color-6)] cursor-pointer hover:text-[var(--brand-color-hover)]',
}
