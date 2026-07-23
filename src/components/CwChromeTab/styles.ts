import type { CwChromeTabAppearance, CwChromeTabStyleSlots } from './types'

export const chromeTabBase: CwChromeTabStyleSlots = {
  root: 'cw-chrome-tab',
  bar:
    'relative flex items-end gap-0 bg-[var(--bg-color-secondarycontainer)]',
  addButton:
    'ml-1 flex h-[1.875rem] w-[1.875rem] shrink-0 cursor-pointer items-center justify-center rounded-md text-[var(--text-color-secondary)] transition-colors hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)]',
  addIcon: 'h-4 w-4',
  tab: 'group relative flex h-[1.875rem] cursor-pointer select-none items-center gap-1.5 border px-3 text-xs transition-colors hairline-border',
  tabGap: '-mr-px',
  tabActive:
    'z-[var(--z-index-sticky)] border-[var(--component-border)] border-b-transparent bg-[var(--bg-color-container)] text-[var(--text-color-primary)]',
  tabInactive:
    'border-[var(--border-color-extra-light)] bg-[var(--bg-color-component)] text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)]',
  tabDisabled: 'cursor-not-allowed opacity-40',
  tabLabel: 'max-w-[7.5rem] truncate',
  tabIcon: 'h-3.5 w-3.5 shrink-0',
  tabIconSlot: 'flex h-3.5 w-3.5 shrink-0 items-center justify-center',
  closeButton:
    'ml-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-sm text-[var(--text-color-secondary)] opacity-0 transition-all hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--text-color-primary)] group-hover:opacity-100',
  closeButtonFocus: 'opacity-100',
  closeIcon: 'h-2.5 w-2.5',
}

/** @deprecated 使用 chromeTabBase */
export const defaultStyles = chromeTabBase

export const appearanceStyles: Record<
  CwChromeTabAppearance,
  Partial<CwChromeTabStyleSlots>
> = {
  default: {},
  browser: {
    root: 'cw-chrome-tab min-w-0',
    bar: 'flex min-h-[2rem] items-end gap-0 overflow-x-auto px-1 pt-1',
    tabLabel: 'max-w-[9rem] truncate',
  },
}
