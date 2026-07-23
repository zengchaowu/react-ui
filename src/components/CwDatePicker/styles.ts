import type { CwDatePickerStyles } from './types'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS, INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwDatePickerStyles = {
  root: 'cw-date-picker w-full',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed pointer-events-none',
  rootReadonly: 'cursor-default',
  trigger: 'w-full',
  suffix: 'flex items-center justify-end gap-1 pr-2 flex-shrink-0',
  clearButton: 'flex items-center justify-center text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] cursor-pointer flex-shrink-0 outline-none',
  panel: 'min-w-0 max-w-full',
  panelInner: 'bg-[var(--bg-color-container)] border border-[var(--component-border)] rounded-md shadow-lg p-3 flex flex-col gap-2',
  panelSizeSmall: 'w-[16.25rem]',
  panelSizeMedium: 'w-[17.5rem]',
  panelSizeLarge: 'w-[20rem]',
  header: 'flex items-center justify-between',
  headerNav: 'flex items-center gap-1',
  headerLabel: 'text-sm font-medium text-[var(--text-color-primary)] select-none',
  headerYearButton: `h-7 px-2 inline-flex items-center justify-center rounded-md text-xs text-[var(--text-color-secondary)] hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)] cursor-pointer outline-none focus:outline-none ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  navButton: `w-7 h-7 inline-flex items-center justify-center rounded-md text-[var(--text-color-secondary)] hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)] cursor-pointer outline-none focus:outline-none ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  weekRow: 'w-full',
  weekCell: 'w-full min-w-0 h-7 flex items-center justify-center text-xs text-[var(--text-color-secondary)] select-none',
  bodyGrid: 'w-full',
  bodyGridInner: 'w-full',
  cell: 'w-full min-w-0 h-8 flex items-center justify-center text-sm rounded-md outline-none select-none transition-colors duration-200',
  cellCurrentMonth: 'text-[var(--text-color-primary)] cursor-pointer',
  cellOtherMonth: 'text-[var(--text-color-secondary)] cursor-pointer',
  cellToday: 'border border-[var(--brand-color-6)]',
  cellSelected: 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)]',
  cellRange: 'bg-[var(--button-brand-tint-active-bg)] text-[var(--brand-color-6)]',
  cellRangeStart: 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)]',
  cellRangeEnd: 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)]',
  cellDisabled: 'text-[var(--text-color-disabled)] bg-[var(--bg-color-component-disabled)] cursor-not-allowed',
  cellFocused: INTERACTIVE_FOCUS_CLASS,
  cellHover: 'hover:bg-[var(--bg-color-component-hover)]',
  footer: 'box-border flex w-full min-w-0 flex-wrap items-center justify-between gap-2 pt-2 hairline-border-t border-[var(--component-border)]',
  footerLeft: 'flex items-center gap-2',
  footerRight: 'flex items-center gap-2',
  footerButton: `inline-flex items-center justify-center rounded-md text-[var(--text-color-secondary)] hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)] cursor-pointer outline-none focus:outline-none ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  footerButtonSizeSmall: 'h-7 px-2 text-xs',
  footerButtonSizeMedium: 'h-8 px-3 text-sm',
  footerButtonSizeLarge: 'h-9 px-3 text-sm',
  shortcuts: 'flex items-center flex-wrap gap-2',
  shortcutButton: `inline-flex items-center justify-center rounded-md text-[var(--text-color-secondary)] bg-[var(--bg-color-secondarycontainer)] hover:text-[var(--text-color-primary)] cursor-pointer outline-none focus:outline-none ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  shortcutButtonSizeSmall: 'h-7 px-2 text-xs',
  shortcutButtonSizeMedium: 'h-8 px-2 text-xs',
  shortcutButtonSizeLarge: 'h-8 px-3 text-sm',
  sizeSmall: 'h-7 text-xs',
  sizeMedium: 'h-9 text-sm',
  sizeLarge: 'h-11 text-base',
  popupStyles: {
    popup: 'bg-transparent border-0 shadow-none',
    // 与 CwSelect 一致：触发器在表单中撑满父级宽度（CwPopup 默认 trigger 仅 inline-block）
    trigger: 'inline-block w-full'
  },
  clearIconStyles: {
    root: 'inline-flex items-center justify-center text-current rounded-full',
    size: 1.125
  },
  calendarIconStyles: {
    root: 'inline-flex items-center justify-center text-current text-[var(--text-color-secondary)]',
    size: 1.125
  },
  prevIconStyles: {
    root: 'inline-flex items-center justify-center text-current',
    size: 0.875
  },
  nextIconStyles: {
    root: 'inline-flex items-center justify-center text-current',
    size: 0.875
  }
}
