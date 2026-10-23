import type { CwSplitStyles } from './types'

const dividerHandleBase =
  'absolute pointer-events-none box-content bg-transparent transition-colors duration-200'

/** @internal 库内默认 class */
export const splitBase: CwSplitStyles = {
  root: 'cw-split relative flex w-full h-full',
  first: 'flex h-full min-h-0 min-w-0 shrink-0 flex-col overflow-hidden',
  divider:
    'z-[var(--z-index-above-high)] relative min-h-0 min-w-0 flex-shrink-0 leading-none overflow-visible transition-colors duration-200 cursor-col-resize',
  dividerDragging: '',
  dividerHandle: dividerHandleBase,
  dividerHandleLine: 'h-auto w-0 hairline-border-l',
  dividerHandleLineActive:
    'h-auto w-0 border-0 border-solid !border-l-[length:1px] !border-l-[var(--brand-color-6)]',
  second: 'flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden',
}

export const verticalStyles: Partial<CwSplitStyles> = {
  root: 'cw-split relative flex flex-col w-full h-full',
  first: 'flex w-full min-h-0 min-w-0 shrink-0 flex-col overflow-hidden',
  divider:
    'z-[var(--z-index-above-high)] relative min-h-0 min-w-0 flex-shrink-0 leading-none overflow-visible transition-colors duration-200 cursor-row-resize',
  dividerHandleLine: 'h-0 w-auto hairline-border-t',
  dividerHandleLineActive:
    'h-0 w-auto border-0 border-solid !border-t-[length:1px] !border-t-[var(--brand-color-6)]',
}

export function resolveSplitStyles(
  direction: 'horizontal' | 'vertical',
): CwSplitStyles {
  if (direction === 'vertical') {
    return { ...splitBase, ...verticalStyles }
  }
  return splitBase
}
