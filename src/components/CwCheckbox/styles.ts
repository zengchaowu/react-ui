import type { CwCheckboxAppearance, CwCheckboxStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const checkboxBase: CwCheckboxStyles = {
  /** min-w-0 + max-w-full：在父级 flex 内可占满可用宽度；方框 shrink-0、标签 flex-1 换行，避免挤压方框 */
  root: 'cw-checkbox inline-flex items-center gap-2 select-none min-w-0 max-w-full',
  rootNormal: 'cursor-pointer',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',
  checkbox:
    'relative inline-flex shrink-0 items-center justify-center border-2 rounded appearance-none outline-none transition-colors',
  checkboxNormal: 'border-[var(--border-color)] bg-[var(--bg-color-container)] cursor-pointer',
  checkboxChecked:
    'border-[var(--brand-color-6)] bg-[var(--bg-color-container)] cursor-pointer [&_.asset]:text-[var(--brand-color-6)]',
  checkboxDisabled:
    'border-[var(--border-color)] bg-[var(--bg-color-component-disabled)] cursor-not-allowed [&_.asset]:text-[var(--text-color-disabled)]',
  checkboxReadonlyNormal: 'border-[var(--border-color)] bg-[var(--bg-color-container)] cursor-default',
  checkboxReadonlyChecked:
    'border-[var(--brand-color-6)] bg-[var(--bg-color-container)] cursor-default [&_.asset]:text-[var(--brand-color-6)]',
  checkboxFocused: INTERACTIVE_FOCUS_CLASS,
  icon: '',
  iconNormal: 'text-[var(--brand-color-6)]',
  iconDisabled: 'text-[var(--text-color-disabled)]',
  iconIndeterminate: 'w-2 h-2',
  iconIndeterminateNormal: 'bg-[var(--brand-color-6)]',
  iconIndeterminateDisabled: 'bg-[var(--text-color-disabled)]',
  checkIconStyle: 'inline-flex items-center justify-center',
  label: 'select-none min-w-0 flex-1 inline-flex items-center leading-normal',
  labelNormal: 'text-[var(--text-color-primary)]',
  labelDisabled: 'text-[var(--text-color-disabled)]',
  /** 方框尺寸：小 */
  sizeSmall: 'w-3.5 h-3.5',
  /** 方框尺寸：中 */
  sizeMedium: 'w-4 h-4',
  /** 方框尺寸：大 */
  sizeLarge: 'w-5 h-5',
  /** 标签字号：小 */
  labelSizeSmall: 'text-xs',
  /** 标签字号：中 */
  labelSizeMedium: 'text-sm',
  /** 标签字号：大 */
  labelSizeLarge: 'text-base',
}

export const appearanceStyles: Record<
  CwCheckboxAppearance,
  Partial<CwCheckboxStyles>
> = {
  default: {},
  block: {
    root: 'cw-checkbox inline-flex items-center gap-2 select-none min-w-0 max-w-full w-full',
  },
}
