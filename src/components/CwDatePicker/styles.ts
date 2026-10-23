import type { CwDatePickerStyles } from './types'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS, INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

/**
 * 毛玻璃浮层视觉（与 vue-ui CwContextMenu/styles 保持一致）。
 * React 侧 CwContextMenu 尚未移植 styles.ts，这里内联同值常量，保证视觉一致。
 */
const CW_GLASS_FROSTED_MENU_CHROME_CLASS = [
  'overflow-hidden outline-none',
  'rounded-xl border border-[color-mix(in_srgb,var(--border-color)_55%,transparent)]',
  'bg-[color-mix(in_srgb,var(--bg-color-container)_92%,transparent)]',
  'shadow-[0_2px_8px_color-mix(in_srgb,var(--scrim-base)_10%,transparent)]',
  'backdrop-blur-xl',
].join(' ')

const CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS =
  'hover:bg-[color-mix(in_srgb,var(--brand-color-6)_6%,transparent)]'

const CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS = [
  'bg-[color-mix(in_srgb,var(--brand-color-6)_12%,transparent)]',
  'hover:bg-[color-mix(in_srgb,var(--brand-color-6)_16%,transparent)]',
].join(' ')

export const CW_DATE_PICKER_POPUP_SHELL_CLASS = 'bg-transparent border-0 shadow-none'

export const CW_DATE_PICKER_POPUP_TRIGGER_CLASS = 'inline-block w-full'

export const datePickerBase: CwDatePickerStyles = {
  root: 'cw-date-picker w-full',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed pointer-events-none',
  rootReadonly: 'cursor-default',
  trigger: 'w-full',
  suffix: 'flex items-center justify-end gap-1 pr-2 flex-shrink-0',
  clearButton: 'flex items-center justify-center text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] cursor-pointer flex-shrink-0 outline-none',
  panel: 'min-w-0 max-w-full',
  panelInner: [
    CW_GLASS_FROSTED_MENU_CHROME_CLASS,
    'flex flex-col gap-2 p-3',
  ].join(' '),
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
  cell: 'w-full min-w-0 h-8 flex items-center justify-center text-sm rounded-md outline-none select-none',
  cellCurrentMonth: 'text-[var(--text-color-primary)] cursor-pointer',
  cellOtherMonth: 'text-[var(--text-color-secondary)] cursor-pointer',
  cellToday: 'border border-[var(--brand-color-6)]',
  /** 未选中格 hover（6%）；选中格自带 hover:16%，勿同挂 */
  cellHover: CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS,
  cellSelected: [
    '!text-[var(--brand-color-6)]',
    CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS,
  ].join(' '),
  cellRange: 'bg-[var(--button-brand-tint-active-bg)] !text-[var(--brand-color-6)]',
  cellRangeStart: 'bg-[var(--brand-color-6)] !text-[var(--text-color-anti)]',
  cellRangeEnd: 'bg-[var(--brand-color-6)] !text-[var(--text-color-anti)]',
  cellDisabled: 'text-[var(--text-color-disabled)] bg-[var(--bg-color-component-disabled)] cursor-not-allowed',
  cellFocused: INTERACTIVE_FOCUS_CLASS,
  footer: 'box-border flex w-full min-w-0 flex-wrap items-center justify-between gap-2 pt-2 hairline-border-t border-[var(--border-color)]',
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
  clearIconStyles: {
    class: 'inline-flex items-center justify-center text-current rounded-full',
    size: 1.125
  },
  calendarIconStyles: {
    class: 'inline-flex items-center justify-center text-current text-[var(--text-color-placeholder)]',
    size: 1.125
  },
  prevIconStyles: {
    class: 'inline-flex items-center justify-center text-current',
    size: 0.875
  },
  nextIconStyles: {
    class: 'inline-flex items-center justify-center text-current',
    size: 0.875
  }
}
