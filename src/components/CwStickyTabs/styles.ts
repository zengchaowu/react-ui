import type { CwStickyTabsStyles } from './types'

export const stickyTabsBase: CwStickyTabsStyles = {
  root: 'cw-sticky-tabs sticky top-0 z-[var(--z-index-above)] bg-[var(--bg-color-container)]',
  header: 'w-full overflow-hidden relative',
  list: 'flex h-[2.8125rem] leading-[2.8125rem] m-0 p-0 list-none',
  item:
    'flex-1 min-w-0 flex items-center justify-center text-center cursor-pointer text-[var(--text-color-primary)] [font-size:var(--font-size-body-xl)] overflow-hidden text-ellipsis whitespace-nowrap transition-colors duration-300 outline-none border-none bg-transparent hover:text-[var(--brand-color-hover)]',
  itemActive: 'text-[var(--brand-color-6)] font-semibold',
  itemText:
    'inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap leading-[2.8125rem]',
  itemTextActive: 'border-b-2 border-[var(--brand-color-6)]',
}
