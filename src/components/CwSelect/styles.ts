import type { CwSelectStyles } from './types'

/**
 * 毛玻璃浮层视觉。与 vue-ui `CwContextMenu/styles.ts` 完全一致；
 * React 侧 CwContextMenu 尚未提供 styles，故此处内联同一份 class。
 */
const CW_GLASS_FROSTED_MENU_CHROME_CLASS = [
  'overflow-hidden outline-none',
  'rounded-xl border border-[color-mix(in_srgb,var(--border-color)_55%,transparent)]',
  'bg-[color-mix(in_srgb,var(--bg-color-container)_92%,transparent)]',
  'shadow-[0_2px_8px_color-mix(in_srgb,var(--scrim-base)_10%,transparent)]',
  'backdrop-blur-xl',
].join(' ')

const CW_GLASS_FROSTED_SHELL_LAYOUT = 'pointer-events-auto w-max min-w-0'

export const CW_GLASS_FROSTED_SHELL_PAD_CLASS = 'flex flex-col gap-1 p-1'

export const CW_GLASS_FROSTED_LIST_POPUP_SHELL_CLASS = [
  CW_GLASS_FROSTED_SHELL_LAYOUT,
  CW_GLASS_FROSTED_MENU_CHROME_CLASS,
].join(' ')

const CW_GLASS_FROSTED_ITEM_TINT_HOVER =
  'bg-[color-mix(in_srgb,var(--brand-color-6)_6%,transparent)]'
const CW_GLASS_FROSTED_ITEM_TINT_SELECTED =
  'bg-[color-mix(in_srgb,var(--brand-color-6)_12%,transparent)]'
const CW_GLASS_FROSTED_ITEM_TINT_SELECTED_EMPHASIS =
  'bg-[color-mix(in_srgb,var(--brand-color-6)_16%,transparent)]'

export const CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS =
  'hover:bg-[color-mix(in_srgb,var(--brand-color-6)_6%,transparent)]'

export const CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_CLASS =
  CW_GLASS_FROSTED_ITEM_TINT_HOVER

export const CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_ON_SELECTED_CLASS =
  CW_GLASS_FROSTED_ITEM_TINT_SELECTED_EMPHASIS

export const CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS = [
  CW_GLASS_FROSTED_ITEM_TINT_SELECTED,
  'hover:bg-[color-mix(in_srgb,var(--brand-color-6)_16%,transparent)]',
].join(' ')

const CW_GLASS_FROSTED_ITEM_PRESS_CLASS = `active:${CW_GLASS_FROSTED_ITEM_TINT_SELECTED}`

const CW_GLASS_FROSTED_ITEM_BODY_CLASS = [
  'scroll-my-1 box-border min-h-8 min-w-0 w-full rounded-md',
  'px-2.5 py-1.5 text-[0.8125rem] leading-snug',
  'text-[var(--text-color-primary)]',
].join(' ')

export const CW_GLASS_FROSTED_LIST_OPTION_CLASS = [
  'flex items-center overflow-hidden',
  CW_GLASS_FROSTED_ITEM_BODY_CLASS,
  CW_GLASS_FROSTED_ITEM_PRESS_CLASS,
].join(' ')

/** CwDiv 滚动内容等宽留白（壳无 padding，滚动条贴边） */
export const CW_SELECT_LIST_CONTENT_CLASS = CW_GLASS_FROSTED_SHELL_PAD_CLASS

/** CwSelect 内嵌 CwPopup 默认浮层壳（与右键菜单同视觉） */
export const CW_SELECT_POPUP_SHELL_CLASS = CW_GLASS_FROSTED_LIST_POPUP_SHELL_CLASS

export const CW_SELECT_POPUP_TRIGGER_CLASS = 'inline-block w-full'

/**
 * `inputAppearance="embedded"`：铺满容器（登录区号等）。
 * 需要贴边收缩时用 `plain`。
 */
export const CW_SELECT_EMBEDDED_ROOT_CLASS =
  'cw-select flex min-h-0 min-w-0 w-full flex-1 flex-col self-stretch overflow-hidden'

export const CW_SELECT_EMBEDDED_SUFFIX_CLASS =
  'flex flex-row flex-nowrap items-center justify-center shrink-0 pr-1.5'

export const CW_SELECT_EMBEDDED_ARROW_ICON_SIZE = 0.75

/**
 * `inputAppearance="plain"`：随文案收缩贴右（CellForm）。
 * 深选择器盖住 CwInput 默认 w-full/flex-1。
 */
export const CW_SELECT_PLAIN_ROOT_CLASS = [
  'cw-select inline-flex min-h-0 min-w-0 w-max max-w-full flex-col overflow-hidden',
  '[&_.cw-input]:!w-max [&_.cw-input]:!max-w-full [&_.cw-input]:!flex-none',
  '[&_.cw-input>div]:!w-auto [&_.cw-input>div]:!max-w-full [&_.cw-input>div]:!inline-flex [&_.cw-input>div]:!items-center',
  '[&_.cw-input_input]:!w-auto [&_.cw-input_input]:!flex-none [&_.cw-input_input]:min-w-[2ch] [&_.cw-input_input]:[field-sizing:content]',
].join(' ')

export const CW_SELECT_PLAIN_TRIGGER_CLASS = 'inline-block w-auto max-w-full'

/** 箭头贴右：勿加 pr，否则与同列 Input 右缘错位 */
export const CW_SELECT_PLAIN_SUFFIX_CLASS =
  'flex flex-row flex-nowrap items-center justify-center shrink-0 pl-1 pr-0'

export const CW_SELECT_PLAIN_ARROW_ICON_SIZE = 0.75

export const selectBase: CwSelectStyles = {
  root: 'cw-select w-full',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed pointer-events-none',
  rootReadonly: 'cursor-default',
  dropdown: 'min-w-0 max-w-full',
  list: '',
  listContent: CW_SELECT_LIST_CONTENT_CLASS,
  option: CW_GLASS_FROSTED_LIST_OPTION_CLASS,
  optionNormal: 'cursor-pointer text-left',
  optionSelected: CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS,
  optionDisabled: 'cursor-not-allowed pointer-events-none text-[var(--text-color-disabled)]',
  optionHover: CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS,
  optionFocus: CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_CLASS,
  optionFocusOnSelected: CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_ON_SELECTED_CLASS,
  empty: 'px-5 py-10 text-center text-[0.8125rem] text-[var(--text-color-secondary)]',
  selectAllOption:
    // 项间距由 listContent gap-1 承担，勿再 mb（否则全选行上下留白不均）
    'flex w-full items-center rounded-md px-2.5 py-1.5 hairline-border-b border-[color-mix(in_srgb,var(--border-color)_70%,transparent)]',
  selectAllOptionSizeSmall: 'text-xs',
  selectAllOptionSizeMedium: 'text-[0.8125rem] leading-snug',
  selectAllOptionSizeLarge: 'text-sm leading-normal',
  suffix: 'flex items-center justify-end gap-1 pr-2 flex-shrink-0',
  clearButton:
    'flex items-center justify-center text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] cursor-pointer flex-shrink-0 outline-none',
  clearIconStyles: {
    class: 'inline-flex items-center justify-center text-current rounded-full',
    size: 1.125,
  },
  arrowOpen: 'rotate-180',
  arrowIconStyles: {
    class:
      'inline-flex items-center justify-center text-current text-[var(--text-color-placeholder)] transition-transform duration-200',
    size: 0.75,
  },
  /** 行高由 option 基类定（与 Dropdown 同高）；size 只调字号 */
  sizeSmall: 'text-xs',
  sizeMedium: '',
  sizeLarge: 'text-sm',
  emptySizeSmall: 'text-xs',
  emptySizeMedium: 'text-[0.8125rem]',
  emptySizeLarge: 'text-sm',
}
