import type { CwNumberInputStyles } from './types'
import { defaultStyles as inputDefaultStyles } from '../CwInput/styles'
import { FORM_CONTROL_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwNumberInputStyles = {
  ...inputDefaultStyles,
  root: 'cw-number-input w-full',
  inputWrapperFocus: FORM_CONTROL_FOCUS_CLASS,
}
