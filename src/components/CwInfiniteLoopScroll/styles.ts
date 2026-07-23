import type { CwInfiniteLoopScrollStyles } from './types'

export const defaultStyles: CwInfiniteLoopScrollStyles = {
  root: 'cw-infinite-loop-scroll w-full h-full relative overflow-hidden outline-none focus:outline-none touch-none',
  rootNormal: 'cursor-default',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',
  container: 'relative w-full h-full',
  content: 'relative will-change-transform',
  item: 'absolute left-0 right-0 top-0 will-change-transform',
  empty: 'absolute inset-0 flex items-center justify-center',
  emptyContent: 'flex flex-col items-center justify-center',
  emptyText: 'text-sm text-[var(--text-color-secondary)]'
}

