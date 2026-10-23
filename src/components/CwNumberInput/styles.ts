import type { CwNumberInputStyles } from './types'
import { inputBase } from '../CwInput/styles'
import { FORM_CONTROL_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const numberInputBase: CwNumberInputStyles = {
  ...inputBase,
  root: 'cw-number-input w-full',
  inputWrapperFocus: FORM_CONTROL_FOCUS_CLASS,
  inputClearReserve: 'pr-6',
  inputClearReserveCompact: 'pr-4',
  clearButton:
    'flex items-center justify-center text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] cursor-pointer flex-shrink-0 outline-none',
  clearButtonOverlay: 'absolute inset-y-0 right-0 z-[var(--z-index-above)] px-1',
  clearButtonVisible: 'opacity-100',
  clearButtonHidden: 'pointer-events-none opacity-0',
  clearIconStyles: {
    class: inputBase.clearIconClass,
    size: 1.125,
  },
}
