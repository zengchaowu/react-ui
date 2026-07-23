import type { CwPaginationStyles } from './types'

export const defaultStyles: CwPaginationStyles = {
  root: 'cw-pagination flex items-center gap-2 flex-wrap',
  rootDisabled: 'pointer-events-none',
  info: 'text-sm text-[var(--text-color-secondary)] mr-2',
  nav: 'flex items-center gap-1',
  button: 'min-w-[1.75rem] h-7 px-1.5 flex items-center justify-center rounded text-sm outline-none focus:outline-none',
  buttonActive: 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)]',
  buttonDisabled: 'cursor-not-allowed',
  ellipsis: 'min-w-[1.75rem] h-7 px-1.5 flex items-center justify-center text-[var(--text-color-secondary)]',
  jumper: 'flex items-center gap-2 text-sm text-[var(--text-color-secondary)]',
  jumperInput: 'w-16',
  pageSize: 'flex items-center gap-2 text-sm text-[var(--text-color-secondary)] flex-shrink-0',
  pageSizeSelect: 'w-auto min-w-20 flex-shrink-0',
}
