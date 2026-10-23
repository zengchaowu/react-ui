import type { CwAutoCompleteStyles } from './types'
import {
  CW_GLASS_FROSTED_LIST_OPTION_CLASS,
  CW_GLASS_FROSTED_LIST_POPUP_SHELL_CLASS,
  CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS,
  CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_CLASS,
  CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_ON_SELECTED_CLASS,
  CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS,
  CW_GLASS_FROSTED_SHELL_PAD_CLASS,
} from '../CwContextMenu/styles'

/** CwDiv 滚动内容等宽留白（壳无 padding，滚动条贴边） */
export const CW_AUTOCOMPLETE_LIST_CONTENT_CLASS = CW_GLASS_FROSTED_SHELL_PAD_CLASS

/** 与右键菜单同视觉的列表弹层壳 */
export const CW_AUTOCOMPLETE_POPUP_SHELL_CLASS = CW_GLASS_FROSTED_LIST_POPUP_SHELL_CLASS

export const CW_AUTOCOMPLETE_POPUP_TRIGGER_CLASS = 'inline-block w-full'

/** 与 `CwInput` `inputAppearance="embedded"` 配套：铺满容器 */
export const CW_AUTOCOMPLETE_EMBEDDED_ROOT_CLASS =
  'cw-auto-complete flex min-h-0 min-w-0 w-full flex-1 flex-col self-stretch overflow-hidden'

/**
 * `inputAppearance="plain"`：随文案收缩贴右（CellForm）。
 * 深选择器盖住 CwInput 默认 w-full/flex-1。
 */
export const CW_AUTOCOMPLETE_PLAIN_ROOT_CLASS = [
  'cw-auto-complete inline-flex min-h-0 min-w-0 w-max max-w-full flex-col overflow-hidden',
  '[&_.cw-input]:!w-max [&_.cw-input]:!max-w-full [&_.cw-input]:!flex-none',
  '[&_.cw-input>div]:!w-auto [&_.cw-input>div]:!max-w-full [&_.cw-input>div]:!inline-flex [&_.cw-input>div]:!items-center',
  '[&_.cw-input_input]:!w-auto [&_.cw-input_input]:!flex-none [&_.cw-input_input]:min-w-[2ch] [&_.cw-input_input]:[field-sizing:content]',
].join(' ')

export const CW_AUTOCOMPLETE_PLAIN_TRIGGER_CLASS = 'inline-block w-auto max-w-full'

/** plain 无框贴右：清除钮勿加 pr */
export const CW_AUTOCOMPLETE_PLAIN_SUFFIX_CLASS =
  'flex items-center justify-end gap-1 pl-1 pr-0 flex-shrink-0'

export const autoCompleteBase: CwAutoCompleteStyles = {
  root: 'cw-auto-complete w-full',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed pointer-events-none',
  rootReadonly: 'cursor-default',
  dropdown: 'min-w-0 max-w-full',
  list: '',
  listContent: CW_AUTOCOMPLETE_LIST_CONTENT_CLASS,
  option: CW_GLASS_FROSTED_LIST_OPTION_CLASS,
  optionNormal: 'cursor-pointer', // 对齐由组件按 align 写入 option 类
  optionSelected: CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS,
  optionDisabled: 'cursor-not-allowed pointer-events-none text-[var(--text-color-disabled)]',
  optionHover: CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS,
  optionFocus: CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_CLASS,
  optionFocusOnSelected: CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_ON_SELECTED_CLASS,
  suffix: 'flex items-center justify-end gap-1 pr-2 flex-shrink-0',
  clearButton:
    'flex items-center justify-center text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] cursor-pointer flex-shrink-0 outline-none',
  clearIconStyles: {
    class: 'inline-flex items-center justify-center text-current rounded-full',
    size: 1.125,
  },
  /** 行高由 option 基类定；size 只调字号 */
  sizeSmall: 'text-xs',
  sizeMedium: '',
  sizeLarge: 'text-sm',
}
