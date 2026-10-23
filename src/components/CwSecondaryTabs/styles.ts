import type { CwSecondaryTabsStyles } from './types'

export const secondaryTabsBase: CwSecondaryTabsStyles = {
  root: 'cw-secondary-tabs flex items-center gap-2 py-2 px-3 w-full box-border bg-transparent',
  rootEqualWidth: 'flex-wrap',
  rootStats: '',
  tab:
    'border-none rounded-lg py-1.5 px-4 flex items-center justify-center cursor-pointer box-border bg-[var(--bg-color-secondarycontainer)] outline-none transition-colors select-none',
  tabEqualWidth: 'flex-1 min-w-0 flex-[1_0_0]',
  tabStats: 'p-2 gap-0.5 items-end bg-[var(--bg-color-container)]',
  tabActive:
    'bg-[var(--bg-color-component)] text-[var(--brand-color-6)] font-semibold',
  tabDisabled: 'cursor-not-allowed opacity-60',
  tabText:
    'text-sm leading-5 text-center whitespace-nowrap text-[var(--text-color-primary)]',
  tabTextStats: 'text-xs leading-4',
}
