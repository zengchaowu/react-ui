import type { CwSearchBarStyles } from './types'
import { FORM_CONTROL_FOCUS_CLASS, INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const searchBarBase: CwSearchBarStyles = {
  // 根容器（表单）：基础 + 状态
  root: 'cw-search-bar w-full',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',

  // 整体容器：基础 + 状态 + 聚焦
  container:
    'flex items-center rounded-md overflow-hidden outline-none border bg-[var(--bg-color-container)]',
  containerNormal: 'border-[var(--border-color)] cursor-text',
  containerReadonly: 'border-[var(--border-color)] cursor-default',
  containerFocus: FORM_CONTROL_FOCUS_CLASS,
  containerDisabled: 'border-[var(--border-color)] bg-[var(--bg-color-component-disabled)] cursor-not-allowed',

  // 搜索图标：基础 + 状态（宽度/左内边距见 searchIconSize*）
  searchIcon: 'flex shrink-0 items-center justify-center pointer-events-none',
  searchIconNormal: 'text-[var(--text-color-secondary)]',
  searchIconDisabled: 'text-[var(--text-color-disabled)]',
  searchIconSizeSmall: 'w-5 pl-1',
  searchIconSizeMedium: 'w-6 pl-1.5',
  searchIconSizeLarge: 'w-7 pl-2',

  // 输入框：纵向由容器 flex 居中，不单独堆 padding
  input:
    'min-w-0 flex-1 py-0 pl-0.5 focus:outline-none border-0 outline-none bg-transparent',
  inputSizeSmall: 'text-xs leading-tight pr-2',
  inputSizeMedium: 'text-sm leading-snug pr-2.5',
  inputSizeLarge: 'text-base leading-normal pr-3',
  inputNormal: 'text-[var(--text-color-primary)] placeholder:text-[var(--text-color-placeholder)]',
  inputDisabled: 'text-[var(--text-color-disabled)] cursor-not-allowed',
  inputReadonly: '',

  // 查询按钮：与容器同高，仅水平内边距
  button:
    'flex shrink-0 self-stretch items-center cursor-pointer transition-colors outline-none focus:outline-none border-0',
  buttonSizeSmall: 'px-2.5 text-xs',
  buttonSizeMedium: 'px-3 text-sm',
  buttonSizeLarge: 'px-4 text-base',
  buttonNormal: 'bg-[var(--button-brand-tint-active-bg)] text-[var(--brand-color-6)] hover:bg-[var(--button-brand-tint-hover-bg)] active:bg-[var(--brand-color-active)]',
  buttonDisabled: 'bg-[var(--bg-color-component-disabled)] text-[var(--text-color-disabled)] cursor-not-allowed',
  buttonFocused: INTERACTIVE_FOCUS_CLASS,

  // 按钮文本：基础 + 状态（字号由 buttonSize* 承担）
  buttonText: 'font-medium whitespace-nowrap',
  buttonTextNormal: '',
  buttonTextDisabled: '',

  // 容器高度（与 CwInput small/medium 对齐）
  sizeSmall: 'h-7',
  sizeMedium: 'h-8',
  sizeLarge: 'h-10',
  searchIconStyles: {
    class: 'inline-flex items-center justify-center',
    size: 1,
  },
}
