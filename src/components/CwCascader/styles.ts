import type { CwCascaderStyles } from './types'
import { CW_GLASS_FROSTED_LIST_POPUP_SHELL_CLASS } from '../CwSelect/styles'

/** 与右键菜单同视觉的列表弹层壳 */
export const CW_CASCADER_POPUP_SHELL_CLASS = CW_GLASS_FROSTED_LIST_POPUP_SHELL_CLASS

export const CW_CASCADER_POPUP_TRIGGER_CLASS = 'inline-block w-full'

export const cascaderBase: CwCascaderStyles = {
  root: 'cw-cascader w-full',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed pointer-events-none',
  rootReadonly: 'cursor-default',
  dropdown: 'min-w-0 max-w-full',
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
}
