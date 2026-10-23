import type { CwExcelEditorStyles } from './types'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

const cellFont = "[font-family:var(--cw-excel-font-cell)]"
const uiFont = "[font-family:var(--cw-excel-font-ui)]"

const actionButton = `cursor-pointer rounded border-0 bg-transparent px-2 py-1 text-xs text-[var(--cw-excel-text-muted)] hover:bg-[var(--cw-excel-bg-cell)] hover:text-[var(--cw-excel-text)] ${uiFont} ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`

export const excelEditorBase: CwExcelEditorStyles = {
  root: `cw-excel-editor flex h-full min-h-[20rem] min-w-0 w-full flex-col overflow-hidden border border-[var(--cw-excel-border)] bg-[var(--cw-excel-bg-chrome)] outline-none ${uiFont}`,
  toolbar: 'flex min-h-0 shrink-0 items-center gap-2 border-b border-[var(--cw-excel-border)] bg-[var(--cw-excel-bg-chrome)] px-2 py-1',
  sheetBar: 'flex min-h-0 shrink-0 items-end gap-0.5 overflow-x-auto border-t border-[var(--cw-excel-border)] bg-[var(--cw-excel-bg-chrome)] px-1 pt-1',
  sheets: 'flex min-w-0 flex-1 items-center gap-1 overflow-x-auto',
  sheet: `shrink-0 cursor-pointer rounded-t border border-transparent bg-transparent px-3 py-1 text-xs text-[var(--cw-excel-text-muted)] hover:bg-[var(--cw-excel-bg-cell)] hover:text-[var(--cw-excel-text)] ${uiFont} ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  sheetActive: '!border-[var(--cw-excel-border)] !border-b-[var(--cw-excel-bg-cell)] bg-[var(--cw-excel-bg-cell)] text-[var(--cw-excel-text)]',
  sheetRename: 'w-28 border-[var(--cw-excel-selection)] bg-[var(--cw-excel-bg-cell)] px-2 py-0.5 text-xs text-[var(--cw-excel-text)] outline-none',
  actions: 'flex shrink-0 items-center gap-1',
  action: actionButton,
  table: [
    'min-h-0 min-w-0 flex-1 bg-[var(--cw-excel-bg-cell)]',
    '[&_.cw-data-table]:rounded-none [&_.cw-data-table]:border-0 [&_.cw-data-table]:!bg-[var(--cw-excel-bg-cell)]',
    '[&_.px-4]:!items-stretch [&_.px-4]:!overflow-visible [&_.px-4]:!p-0 [&_.group]:hover:!bg-transparent',
    '[&_.cw-data-table_.group]:!border-b-0',
    '[&_.cw-data-table>div:first-child]:!border-b [&_.cw-data-table>div:first-child]:!border-[var(--cw-excel-border)] [&_.cw-data-table>div:first-child]:!bg-[var(--cw-excel-bg-header)]',
  ].join(' '),
  formulaBar: 'flex h-10 shrink-0 items-center gap-2 border-b border-[var(--cw-excel-border)] bg-[var(--cw-excel-bg-chrome)] px-2',
  nameBox: `flex h-7 min-w-[5.5rem] shrink-0 items-center justify-center whitespace-nowrap rounded border border-[var(--cw-excel-border)] bg-[var(--cw-excel-bg-cell)] px-2 text-xs tabular-nums text-[var(--cw-excel-text)] ${uiFont}`,
  formulaFx: `shrink-0 px-0.5 text-sm italic text-[var(--cw-excel-text-muted)] ${uiFont}`,
  formulaInput: `cw-excel-input h-7 min-w-0 flex-1 rounded border border-[var(--cw-excel-border)] bg-[var(--cw-excel-bg-cell)] px-2 text-[11pt] leading-5 text-[var(--cw-excel-text)] outline-none ${cellFont}`,
  statusError: 'shrink-0 text-xs text-[var(--error-color-6)]',
  cellSelected: 'shadow-[inset_0_0_0_2px_var(--cw-excel-selection)]',
  cellText: `relative flex h-full min-h-0 w-full min-w-0 select-none items-start overflow-hidden text-[11pt] leading-4 text-[var(--cw-excel-text)] ${cellFont}`,
  cellSpill: 'pointer-events-none absolute inset-0 z-[var(--z-index-above-top)] block overflow-hidden whitespace-pre-wrap break-words px-1 py-1 leading-4',
  cellPlaceholder: 'text-[var(--cw-excel-text-muted)]',
  cellTextRight: 'justify-end text-right tabular-nums',
  cellTextCenter: 'justify-center text-center',
  cellInput: `cw-excel-input h-full min-h-0 w-full min-w-0 resize-none overflow-hidden whitespace-pre-wrap break-words border-0 px-1 py-1 text-[11pt] leading-4 text-[var(--cw-excel-text)] outline-none ${cellFont}`,
  cellInputRight: 'text-right tabular-nums',
  cellInputCenter: 'text-center',
  rowIndex: `text-xs tabular-nums text-[var(--cw-excel-text-muted)] ${uiFont}`,
  axis: `relative flex h-full min-h-0 w-full cursor-pointer items-center justify-center bg-[var(--cw-excel-bg-header)] px-0.5 text-xs tabular-nums text-[var(--cw-excel-text-muted)] ${uiFont}`,
  rowResize: 'absolute bottom-0 left-0 z-[var(--z-index-above-high)] h-1.5 w-full touch-none cursor-row-resize opacity-0 hover:opacity-100 hover:bg-[var(--cw-excel-selection)]',
  axisSelected: '!bg-[var(--cw-excel-selection-bg)] font-medium !text-[var(--cw-excel-selection-text)]',
  mergeLayer: 'cw-excel-merge-layer pointer-events-none absolute inset-0 z-[var(--z-index-above-top)]',
  mergeCell: 'cw-excel-merge-cell pointer-events-auto absolute box-border flex overflow-hidden bg-[var(--cw-excel-bg-cell)]',
  mergeSelected: 'cw-excel-merge-selected',
}
