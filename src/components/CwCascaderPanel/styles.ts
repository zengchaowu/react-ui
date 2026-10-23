import type { CwCascaderPanelAppearance, CwCascaderPanelStyles } from './types'
import {
  CW_GLASS_FROSTED_LIST_OPTION_CLASS,
  CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS,
  CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_CLASS,
  CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_ON_SELECTED_CLASS,
  CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS,
  CW_GLASS_FROSTED_SHELL_PAD_CLASS,
} from '../CwSelect/styles'

const optionState = {
  optionNormal: 'cursor-pointer text-left text-[var(--text-color-primary)]',
  optionSelected: CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS,
  optionDisabled:
    'cursor-not-allowed pointer-events-none text-[var(--text-color-disabled)]',
  optionHover: CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS,
  optionFocus: CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_CLASS,
  optionFocusOnSelected: CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_ON_SELECTED_CLASS,
  optionContent: 'flex min-w-0 w-full items-center gap-1',
  optionLabel: 'min-w-0',
  optionArrow:
    'inline-flex h-4 w-4 shrink-0 items-center justify-center text-[var(--text-color-placeholder)]',
  /** popup 行高由 option 基类定；size 只调字号 */
  sizeSmall: 'text-xs',
  sizeMedium: '',
  sizeLarge: 'text-sm',
  emptySizeSmall: 'text-xs',
  emptySizeMedium: 'text-[0.8125rem]',
  emptySizeLarge: 'text-sm',
} as const

export const cascaderPanelByAppearance: Record<
  CwCascaderPanelAppearance,
  CwCascaderPanelStyles
> = {
  popup: {
    root: 'cw-cascader-panel min-w-0 max-w-full',
    panel: 'flex items-start gap-0',
    /** 高度约束在 CwDiv 根；滚动在 viewport，留白在 content（勿 overflow-y 挂根上） */
    column:
      'min-w-[8.75rem] max-h-[17.5rem] hairline-border-r last:hairline-border-r-0 border-[color-mix(in_srgb,var(--border-color)_70%,transparent)]',
    columnContent: CW_GLASS_FROSTED_SHELL_PAD_CLASS,
    option: `${CW_GLASS_FROSTED_LIST_OPTION_CLASS} outline-none focus:outline-none`,
    empty:
      'px-5 py-10 text-center text-[0.8125rem] text-[var(--text-color-secondary)]',
    ...optionState,
  },
  sheet: {
    root: 'cw-cascader-panel flex flex-col',
    panel: 'flex items-start overflow-hidden',
    column:
      'min-w-[8.75rem] max-h-[17.5rem] flex-1 hairline-border-r border-[var(--border-color)] last:hairline-border-r-0',
    columnContent: '',
    option:
      'min-w-0 overflow-hidden outline-none focus:outline-none px-4 py-3 text-sm whitespace-nowrap text-ellipsis',
    empty:
      'px-5 py-10 text-center text-sm text-[var(--text-color-secondary)]',
    ...optionState,
  },
}
