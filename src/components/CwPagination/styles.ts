import type { CwPaginationStyles } from './types'

/** @internal 库内默认 class */
export const paginationBase: CwPaginationStyles = {
  root: 'cw-pagination inline-flex w-max max-w-full items-center gap-2',
  rootDisabled: 'pointer-events-none',
  info: 'shrink-0 whitespace-nowrap text-xs text-[var(--text-color-secondary)]',
  nav: 'flex shrink-0 items-center gap-1',
  button: 'min-w-[1.75rem] h-7 px-1.5 flex items-center justify-center rounded text-sm outline-none focus:outline-none',
  /** 页码切换时不要颜色过渡，否则旧选中项会「淡出」 */
  pageButton: '!transition-none',
  buttonActive: 'bg-[var(--brand-color-6)] text-[var(--text-color-anti)]',
  buttonDisabled: 'cursor-not-allowed',
  ellipsis: 'min-w-[1.75rem] h-7 px-1.5 flex items-center justify-center text-[var(--text-color-secondary)]',
  jumper:
    'flex w-auto shrink-0 items-center gap-2 whitespace-nowrap text-sm text-[var(--text-color-secondary)]',
  jumperInput: 'w-16 min-w-16 max-w-16 shrink-0',
  /** 勿让内部 CwSelect（默认 w-full）把「每页」挤成竖排 */
  pageSize:
    'flex w-auto shrink-0 items-center gap-2 whitespace-nowrap text-sm text-[var(--text-color-secondary)]',
  pageSizeSelect: 'w-[4.75rem] min-w-[4.75rem] max-w-[4.75rem] shrink-0',
}
