import type { CwRadioStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwRadioStyles = {
  // 根容器：基础 + 状态
  root: 'cw-radio inline-flex items-center gap-2 select-none',
  rootNormal: 'cursor-pointer',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',
  rootBorder: 'px-3 py-2 border rounded-md transition-colors duration-200 outline-none focus:outline-none',
  rootBorderNormal: 'border-[var(--component-border)] bg-[var(--bg-color-container)] hover:border-[var(--component-border)] hover:text-[var(--brand-color-hover)] hover:bg-[var(--bg-color-component-hover)] active:border-[var(--component-border)] active:text-[var(--brand-color-active)] active:bg-[var(--button-brand-tint-active-bg)]',
  rootBorderDisabled: 'border-[var(--component-border)] bg-[var(--bg-color-component-disabled)]',
  rootBorderReadonly: 'border-[var(--component-border)] bg-[var(--bg-color-container)] hover:bg-[var(--bg-color-container)] hover:border-[var(--component-border)] hover:text-[var(--text-color-primary)] active:bg-[var(--bg-color-container)] active:border-[var(--component-border)] active:text-[var(--text-color-primary)]',
  rootBorderChecked: 'border-[var(--brand-color-6)] text-[var(--brand-color-6)] bg-[var(--button-brand-tint-hover-bg)] hover:border-[var(--brand-color-6)] hover:text-[var(--brand-color-hover)] hover:bg-[var(--button-brand-tint-hover-bg)] active:border-[var(--brand-color-6)] active:text-[var(--brand-color-active)] active:bg-[var(--button-brand-tint-active-bg)]',

  // 控件：基础 + 状态（互斥）
  radio: 'relative inline-flex items-center justify-center w-4 h-4 rounded-full border-2 appearance-none outline-none transition-colors',
  radioNormal: 'border-[var(--component-border)] bg-[var(--bg-color-container)] cursor-pointer',
  radioChecked: 'border-[var(--brand-color-6)] bg-[var(--bg-color-container)] cursor-pointer',
  radioDisabled: 'border-[var(--component-border)] bg-[var(--bg-color-component-disabled)] cursor-not-allowed',
  radioReadonlyNormal: 'border-[var(--component-border)] bg-[var(--bg-color-container)] cursor-default',
  radioReadonlyChecked: 'border-[var(--brand-color-6)] bg-[var(--bg-color-container)] cursor-default',
  radioFocused: INTERACTIVE_FOCUS_CLASS,

  // 内圆点
  icon: 'w-2.5 h-2.5 rounded-full',
  iconNormal: 'bg-[var(--brand-color-6)]',
  iconDisabled: 'bg-[var(--text-color-disabled)]',

  // 标签
  label: 'select-none',
  labelNormal: 'text-[var(--text-color-primary)]',
  labelChecked: 'text-[var(--brand-color-6)]',
  labelDisabled: 'text-[var(--text-color-disabled)]',
  // 尺寸样式：小
  sizeSmall: 'w-3.5 h-3.5 text-xs',
  // 尺寸样式：中
  sizeMedium: 'w-4 h-4 text-sm',
  // 尺寸样式：大
  sizeLarge: 'w-5 h-5 text-base'
}


