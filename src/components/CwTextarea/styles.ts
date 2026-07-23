import type { CwTextareaStyles } from './types'
import { FORM_CONTROL_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwTextareaStyles = {
  // 根容器：基础 + 状态（w-full：在表单 flex 布局里铺满可用宽）
  root: 'cw-textarea flex w-full min-w-0 flex-col gap-2',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',

  // 标签：基础 + 状态
  label: 'text-sm font-medium leading-5',
  labelNormal: 'text-[var(--text-color-secondary)]',
  labelDisabled: 'text-[var(--text-color-disabled)]',

  // 文本域容器：基础 + 状态 + 聚焦
  textareaWrapper: 'flex relative w-full min-w-0 rounded-md border outline-none transition-shadow',
  textareaWrapperNormal: 'border-[var(--component-border)] bg-[var(--bg-color-container)]',
  textareaWrapperReadonly: 'border-[var(--component-border)] bg-[var(--bg-color-container)] cursor-default',
  textareaWrapperDisabled: 'border-[var(--component-border)] bg-[var(--bg-color-component-disabled)] cursor-not-allowed',
  textareaWrapperFocus: FORM_CONTROL_FOCUS_CLASS,

  // 文本域本体：基础 + 状态
  textarea: 'w-full resize-none bg-transparent leading-5 px-3 py-3 outline-none border-0',
  textareaNormal: 'text-[var(--text-color-primary)]',
  textareaReadonly: 'text-[var(--text-color-primary)] cursor-text select-text',
  textareaDisabled: 'text-[var(--text-color-disabled)] cursor-not-allowed',

  // 计数器：基础 + 状态
  counter: 'mt-1 text-xs text-right',
  counterNormal: 'text-[var(--text-color-secondary)]',
  counterDisabled: 'text-[var(--text-color-disabled)]',
  // 尺寸样式：小
  sizeSmall: 'text-xs',
  // 尺寸样式：中
  sizeMedium: 'text-sm',
  // 尺寸样式：大
  sizeLarge: 'text-base'
}

