import type { CwPdfEditorStyles } from './types'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

const uiFont = '[font-family:var(--cw-excel-font-ui)]'

const actionButton = `cursor-pointer rounded border-0 bg-transparent px-2 py-1 text-xs text-[var(--cw-excel-text-muted)] hover:bg-[var(--cw-excel-bg-cell)] hover:text-[var(--cw-excel-text)] disabled:cursor-not-allowed disabled:opacity-40 ${uiFont} ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`

export const pdfEditorBase: CwPdfEditorStyles = {
  root: `cw-pdf-editor flex h-full min-h-[20rem] min-w-0 w-full flex-col overflow-hidden border border-[var(--cw-excel-border)] bg-[var(--cw-excel-bg-chrome)] outline-none ${uiFont}`,
  toolbar: 'flex min-h-10 shrink-0 items-center gap-2 border-b border-[var(--cw-excel-border)] bg-[var(--cw-excel-bg-chrome)] px-2 py-1',
  pageLabel: 'shrink-0 text-xs tabular-nums text-[var(--cw-excel-text)]',
  actions: 'ml-auto flex shrink-0 items-center gap-1',
  action: actionButton,
  stage: 'relative min-h-0 flex-1 bg-[var(--cw-excel-bg-header)]',
  stack: 'relative mx-auto my-4 shrink-0',
  page: 'absolute left-0 right-0 overflow-hidden bg-[var(--cw-excel-bg-cell)] shadow-[0_1px_4px_rgba(0,0,0,0.12)]',
  pageSelected: 'shadow-[inset_0_0_0_2px_var(--cw-excel-selection),0_1px_4px_rgba(0,0,0,0.12)]',
  loading: 'absolute inset-0 z-[var(--z-index-sticky)] flex items-center justify-center gap-2 bg-[var(--cw-excel-bg-cell)]',
  loadingText: 'text-sm text-[var(--cw-excel-text-muted)]',
  note: 'absolute z-[var(--z-index-above-high)] box-border overflow-hidden bg-[var(--cw-excel-bg-cell)]/90',
  noteInput: `h-full w-full resize-none border-0 bg-transparent p-1 text-[var(--cw-excel-text)] outline-none ${uiFont}`,
  run: 'absolute z-[var(--z-index-above)] box-border cursor-text overflow-visible',
  runHover: 'hover:shadow-[inset_0_0_0_1px_var(--cw-excel-selection)]',
  runEdited: 'bg-white shadow-[inset_0_0_0_1px_var(--cw-excel-selection)]',
  runInput:
    'block h-full w-full overflow-hidden whitespace-pre border-0 bg-transparent p-0 text-[var(--cw-excel-text)] outline-none empty:before:text-[var(--cw-excel-text-muted)] empty:before:content-[attr(data-placeholder)]',
  statusError: 'min-w-0 truncate text-xs text-[var(--error-color-6)]',
}
