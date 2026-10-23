import type { CwConfigCardStyles } from './types'

/** @internal */
export const configCardBase: CwConfigCardStyles = {
  headerInner: 'flex flex-1 items-center justify-between min-w-0',
  title: 'text-sm font-semibold leading-none text-[var(--text-color-primary)]',
  collapseIcon:
    'flex items-center justify-center w-6 h-6 text-[var(--text-color-placeholder)] transform transition-transform duration-200 ease-in-out',
  collapseIconStyles: {
    size: 0.75,
  },
  item: 'flex items-start gap-4 mb-4 last:mb-0',
  itemLabel:
    'flex-shrink-0 text-sm text-[var(--text-color-secondary)] whitespace-nowrap text-left',
  itemValue: 'flex-1 text-sm text-[var(--text-color-primary)] break-words text-right',
  itemValueRichText: 'flex-1 text-right',
  itemValueComponent: 'flex-1 text-right',
}
