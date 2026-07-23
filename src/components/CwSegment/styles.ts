import type { CwSegmentStyles } from './types'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '../../utils/focusStyles'

export const defaultCwSegmentStyles: CwSegmentStyles = {
  root: 'cw-segment relative inline-flex shrink-0 gap-0.5 rounded-lg bg-[var(--bg-color-component)] p-0.5',
  rootDisabled: 'pointer-events-none opacity-60',
  slider:
    'absolute left-0 top-0 rounded-md bg-[var(--bg-color-container)] shadow-[0_1px_2px_var(--table-shadow-color)]',
  sliderMove: 'transition-[transform,width,height] duration-200 ease-out',
  item:
    `relative flex-1 shrink-0 whitespace-nowrap rounded-md px-2 text-center font-normal outline-none transition-colors duration-200 ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  itemActive: 'text-[var(--text-color-primary)]',
  itemInactive: 'text-[var(--text-color-placeholder)] hover:text-[var(--text-color-secondary)]',
}
