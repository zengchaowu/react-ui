import type { CwDropdownStyles } from './types'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '../../utils/focusStyles'

export const defaultStyles: CwDropdownStyles = {
  root: 'cw-dropdown inline-flex min-w-0',
  triggerWrap: 'inline-flex min-w-0',
  triggerInner: 'inline-flex min-w-0 items-center justify-center gap-1.5',
  menu: 'min-w-0 py-1',
  menuItem:
    `cursor-pointer whitespace-nowrap px-3 text-left outline-none transition-colors duration-200 ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  menuItemNormal: 'text-[var(--text-color-primary)]',
  menuItemDisabled:
    'cursor-not-allowed text-[var(--text-color-disabled)] pointer-events-none',
  menuItemHover: 'hover:bg-[var(--bg-color-component-hover)]',
  menuItemActive: 'bg-[var(--bg-color-secondarycontainer)]',
  sizeSmall: 'py-1.5 text-xs',
  sizeMedium: 'py-2 text-sm',
  sizeLarge: 'py-2.5 text-base',
  arrowOpen: 'rotate-180',
  arrowIconStyles: {
    root: 'inline-flex items-center justify-center text-current text-[var(--text-color-secondary)] transition-transform duration-200',
    size: 1,
  },
  leadingIconStyles: {
    root: 'inline-flex shrink-0 items-center justify-center text-current',
    size: 1.125,
  },
  popupStyles: {
    popup:
      'bg-[var(--bg-color-container)] border border-[var(--component-border)] rounded-md shadow-lg overflow-hidden',
    trigger: 'inline-block min-w-0',
  },
}
