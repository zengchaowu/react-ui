import type { CwDocxEditorStyles } from './types'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

const uiFont = '[font-family:var(--cw-excel-font-ui)]'

const actionButton = `cursor-pointer rounded border-0 bg-transparent px-2 py-1 text-xs text-[var(--cw-excel-text-muted)] hover:bg-[var(--cw-excel-bg-cell)] hover:text-[var(--cw-excel-text)] disabled:cursor-not-allowed disabled:opacity-40 ${uiFont} ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`

export const docxEditorBase: CwDocxEditorStyles = {
  root: `cw-docx-editor flex h-full min-h-[20rem] min-w-0 w-full flex-col overflow-hidden border border-[var(--cw-excel-border)] bg-[var(--cw-excel-bg-chrome)] outline-none ${uiFont}`,
  toolbar: 'flex min-h-10 shrink-0 items-center gap-2 border-b border-[var(--cw-excel-border)] bg-[var(--cw-excel-bg-chrome)] px-2 py-1',
  actions: 'ml-auto flex shrink-0 items-center gap-1',
  action: actionButton,
  stage: 'relative min-h-0 flex-1 overflow-auto bg-[var(--cw-excel-bg-header)] p-6',
  page: 'mx-auto flex w-full max-w-3xl flex-col gap-3 bg-[var(--cw-excel-bg-cell)] px-10 py-8 shadow-[0_1px_4px_rgba(0,0,0,0.12)]',
  paragraph: 'text-sm leading-6',
  heading1: 'text-2xl font-medium leading-8',
  heading2: 'text-xl font-medium leading-7',
  heading3: 'text-lg font-medium leading-7',
  paragraphBody: 'inline min-h-[1.5em] whitespace-pre-wrap break-words leading-[inherit] text-[var(--cw-excel-text)] outline-none',
  run: 'whitespace-pre-wrap',
  listLabel: 'mr-1 shrink-0 select-none',
  table: 'w-full border-collapse',
  row: '',
  cell: 'border border-[var(--cw-excel-border)] px-2 py-1 align-top',
  image: 'max-w-full',
  loading: 'absolute inset-0 z-[var(--z-index-sticky)] flex items-center justify-center gap-2 bg-[var(--cw-excel-bg-cell)]',
  loadingText: 'text-sm text-[var(--cw-excel-text-muted)]',
  statusError: 'min-w-0 truncate text-xs text-[var(--error-color-6)]',
}
