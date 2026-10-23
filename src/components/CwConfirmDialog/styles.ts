import type { CwConfirmDialogStyles } from './types'

/** @internal */
export const confirmDialogBase: CwConfirmDialogStyles = {
  content: 'flex w-full min-w-0 flex-col',
  title: 'text-base font-semibold text-[var(--text-color-primary)] mb-2',
  message: 'mb-4 text-sm leading-relaxed text-[var(--text-color-secondary)]',
  footer: 'flex w-full min-w-0 shrink-0 flex-wrap items-center justify-end gap-2',
}
