import type { CwDesignToolRailStyles } from './types'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '../../utils/focusStyles'

const toolRailMenuStyles = {
  menu:
    'min-w-[8.5rem] rounded-md border border-[var(--component-border)] bg-[var(--bg-color-container)] py-1 shadow-lg',
  menuItem:
    `flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-3 py-1.5 text-left text-xs text-[var(--text-color-primary)] transition-colors duration-150 hover:bg-[var(--bg-color-component-hover)] disabled:cursor-not-allowed disabled:text-[var(--text-color-disabled)] ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  menuItemLabel: 'min-w-0 flex-1 truncate',
  menuItemShortcut: 'shrink-0 text-[var(--text-color-placeholder)]',
  dropdownCaret:
    'inline-flex shrink-0 items-center justify-center text-[var(--text-color-placeholder)]',
}

export const defaultCwDesignToolRailSideStyles: CwDesignToolRailStyles = {
  root:
    'flex w-11 shrink-0 flex-col overflow-hidden border-r border-[var(--component-border)] bg-[var(--bg-color-container)] py-1.5',
  leading: 'flex shrink-0 flex-col items-center px-1',
  center: '',
  scroll: 'flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto',
  group: 'flex flex-col items-center gap-0.5 px-1',
  divider: 'mx-auto my-1 h-px w-6 shrink-0 bg-[var(--component-border)]',
  item:
    `inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-[var(--text-color-secondary)] transition-[background-color,color] duration-150 hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)] disabled:pointer-events-none disabled:opacity-35 ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  itemActive:
    'bg-[var(--button-brand-tint-active-bg)] text-[var(--brand-color-6)] hover:bg-[var(--button-brand-tint-active-bg)] hover:text-[var(--brand-color-6)]',
  itemDanger:
    'hover:bg-[color-mix(in_srgb,var(--error-color-6)_12%,transparent)] hover:text-[var(--error-color-6)]',
  footer:
    'mt-auto flex flex-col items-center gap-0.5 border-t border-[var(--component-border)] px-1 pt-1.5',
  ...toolRailMenuStyles,
}

export const defaultCwDesignToolRailTopStyles: CwDesignToolRailStyles = {
  root:
    'relative flex h-11 w-full shrink-0 items-center gap-1 overflow-hidden border-b border-[var(--component-border)] bg-[var(--bg-color-container)] px-2',
  leading: 'relative z-[var(--z-index-sticky)] flex shrink-0 items-center',
  center:
    'absolute left-1/2 top-1/2 z-[var(--z-index-above)] flex -translate-x-1/2 -translate-y-1/2 items-center gap-1',
  scroll: 'flex min-h-0 min-w-0 flex-1 items-center gap-1 overflow-x-auto',
  group: 'flex shrink-0 items-center gap-0.5',
  divider: 'mx-0.5 h-5 w-px shrink-0 bg-[var(--component-border)]',
  item:
    `inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-[var(--text-color-secondary)] transition-[background-color,color] duration-150 hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)] disabled:pointer-events-none disabled:opacity-35 ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  itemActive:
    'bg-[var(--button-brand-tint-active-bg)] text-[var(--brand-color-6)] hover:bg-[var(--button-brand-tint-active-bg)] hover:text-[var(--brand-color-6)]',
  itemDanger:
    'hover:bg-[color-mix(in_srgb,var(--error-color-6)_12%,transparent)] hover:text-[var(--error-color-6)]',
  footer:
    'relative z-[var(--z-index-sticky)] ml-auto flex shrink-0 items-center gap-0.5 border-l border-[var(--component-border)] pl-2',
  ...toolRailMenuStyles,
}

/** @deprecated 使用 {@link defaultCwDesignToolRailSideStyles} */
export const defaultCwDesignToolRailStyles = defaultCwDesignToolRailSideStyles
