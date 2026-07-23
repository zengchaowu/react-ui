import type { CwCascaderSheetStyles, CwCascaderSheetSheetStyles } from './types'
import { CW_OVERLAY_HEADER_TITLE_CLASS } from '../../constants/cwOverlayHeaderTitle'
import { defaultStyles as defaultDynamicSheetStyles } from '../CwDynamicSheet/styles'

export const defaultStyles: CwCascaderSheetStyles = {
  root: 'cw-cascader-sheet flex flex-col h-full',
  headerContainer: 'flex items-center justify-between',
  headerTitle: CW_OVERLAY_HEADER_TITLE_CLASS,
  panel: 'flex items-start gap-2 p-2 flex-1 overflow-hidden',
  column: 'min-w-[8.75rem] max-h-full overflow-y-auto hairline-border-r last:hairline-border-r-0 border-[var(--component-border)]',
  option: 'px-3 py-2 text-sm whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-200 outline-none focus:outline-none',
  optionNormal: 'text-[var(--text-color-primary)] cursor-pointer',
  optionSelected: 'text-[var(--brand-color-6)] bg-[var(--button-brand-tint-active-bg)] font-medium',
  optionDisabled: 'text-[var(--text-color-disabled)] cursor-not-allowed pointer-events-none',
  optionFocus: 'bg-[var(--bg-color-secondarycontainer)]',
  optionHover: 'hover:bg-[var(--bg-color-component-hover)]',
  optionContent: 'flex items-center justify-between gap-2',
  optionLabel: '',
  optionArrow: 'text-[var(--text-color-secondary)]',
  empty: 'px-5 py-10 text-center text-sm text-[var(--text-color-secondary)]'
}

export const defaultSheetStyles: CwCascaderSheetSheetStyles = {
  body: 'flex-1 p-4 overflow-y-auto',
  contentBottom: defaultDynamicSheetStyles.contentBottom.replace('max-h-[90vh]', 'max-h-[90vh] rounded-t-[var(--radius-large)]')
}
