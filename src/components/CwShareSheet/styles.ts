import type { CwShareSheetStyles, CwShareSheetSheetStyles } from './types'
import { CW_OVERLAY_HEADER_TITLE_CLASS } from '../../constants/cwOverlayHeaderTitle'
import { withInteractiveFocus } from '../../utils/focusStyles'
import { defaultStyles as defaultDynamicSheetStyles } from '../CwDynamicSheet/styles'

export const defaultStyles: CwShareSheetStyles = {
  root: 'cw-share-sheet px-4 pt-5 pb-4',
  titleContainer: 'flex items-center justify-center w-full',
  title: CW_OVERLAY_HEADER_TITLE_CLASS,
  option: 'flex flex-col items-center justify-center gap-2 outline-none focus:outline-none cursor-pointer select-none',
  optionNormal: '',
  optionFocused: withInteractiveFocus('rounded-lg'),
  optionIcon: 'w-14 h-14 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0',
  optionText: 'text-xs text-[var(--text-color-secondary)] text-center leading-tight'
}

export const defaultSheetStyles: CwShareSheetSheetStyles = {
  body: 'flex-1 overflow-y-auto',
  contentBottom: defaultDynamicSheetStyles.contentBottom.replace('max-h-[90vh]', 'max-h-[90vh] rounded-t-[var(--radius-large)]')
}

