import type { CwFilterSheetStyles, CwFilterSheetSheetStyles } from './types'
import { CW_OVERLAY_HEADER_TITLE_CLASS } from '../../constants/cwOverlayHeaderTitle'
import { defaultStyles as defaultDynamicSheetStyles } from '../CwDynamicSheet/styles'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwFilterSheetStyles = {
  root: 'cw-filter-sheet flex flex-col h-full',
  headerTitle: CW_OVERLAY_HEADER_TITLE_CLASS,
  section: 'mb-6 last:mb-0',
  sectionTitle: 'text-sm font-semibold text-[var(--text-color-primary)] mb-3',
  option: 'relative flex items-center justify-center px-4 py-2.5 border rounded-lg transition-colors outline-none focus:outline-none text-sm',
  optionNormal: 'border-[var(--border-color-lighter)] bg-[var(--bg-color-secondarycontainer)] text-[var(--text-color-primary)] cursor-pointer',
  optionSelected: 'border-[var(--brand-color-6)] bg-[var(--button-brand-tint-active-bg)] text-[var(--brand-color-6)] font-medium cursor-pointer',
  optionDisabled: 'border-[var(--component-border)] bg-[var(--bg-color-component-disabled)] text-[var(--text-color-disabled)] cursor-not-allowed',
  optionFocused: INTERACTIVE_FOCUS_CLASS,
  optionHover: 'hover:border-[var(--brand-color-6)] hover:bg-[var(--button-brand-tint-active-bg)]',
  checkmark: 'absolute bottom-0.5 right-0.5 w-3 h-3 flex items-center justify-center',
  footer: 'box-border flex w-full min-w-0 flex-wrap gap-3 px-4 py-3'
}

export const defaultSheetStyles: CwFilterSheetSheetStyles = {
  body: 'flex-1 p-4 overflow-y-auto',
  contentBottom: defaultDynamicSheetStyles.contentBottom.replace('max-h-[90vh]', 'max-h-[90vh] rounded-t-[var(--radius-large)]'),
  footer:
    'box-border flex w-full min-w-0 flex-wrap px-4 py-3 hairline-border-t border-[var(--component-border)]'
}
