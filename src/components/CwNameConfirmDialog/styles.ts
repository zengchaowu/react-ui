import type { CwNameConfirmDialogStyles } from './types'

/** @internal */
export const nameConfirmDialogBase: CwNameConfirmDialogStyles = {
  root: 'flex min-h-0 min-w-0 w-full flex-1 flex-col gap-4',
  body: 'flex w-full min-w-0 flex-col gap-3',
  message: 'text-sm leading-relaxed text-[var(--text-color-secondary)]',
  hint: 'text-xs text-[var(--text-color-secondary)]',
  expected: 'font-medium text-[var(--text-color-primary)]',
  footer: 'flex w-full shrink-0 flex-wrap items-center justify-end gap-2',
}
