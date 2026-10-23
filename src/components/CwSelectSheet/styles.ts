import type { CwSelectSheetStyles } from './types'
import { CW_OVERLAY_HEADER_TITLE_CLASS } from '@zengchaowu/ui-shared/constants/cwOverlayHeaderTitle'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const SELECT_SHEET_BODY_CLASS = 'flex-1 p-4 overflow-y-auto'

export const selectSheetBase: CwSelectSheetStyles = {
  root: 'cw-select-sheet',
  headerContainer: 'flex items-center justify-between',
  headerTitle: CW_OVERLAY_HEADER_TITLE_CLASS,
  option:
    'flex items-center justify-center px-3 py-2 border rounded-[var(--radius-medium)] transition-colors outline-none focus:outline-none text-base',
  optionNormal:
    'border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] text-[var(--text-color-primary)] cursor-pointer',
  optionSelected:
    'border-[var(--brand-color-6)] bg-[var(--button-brand-tint-active-bg)] text-[var(--brand-color-6)] font-medium cursor-pointer',
  optionDisabled:
    'border-[var(--border-color)] bg-[var(--bg-color-component-disabled)] text-[var(--text-color-disabled)] cursor-not-allowed',
  optionFocused: INTERACTIVE_FOCUS_CLASS,
  optionHover:
    'hover:border-[var(--brand-color-6)] hover:bg-[var(--button-brand-tint-active-bg)]',
}
