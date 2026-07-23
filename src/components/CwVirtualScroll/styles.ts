import type { CwVirtualScrollStyles } from './types'

export const defaultStyles: CwVirtualScrollStyles = {
  root: 'cw-virtual-scroll w-full h-full relative overflow-hidden outline-none focus:outline-none',
  rootNormal: 'cursor-default',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',
  container: 'relative w-full h-full',
  content: 'relative will-change-transform',
  item: 'absolute left-0 right-0 top-0 will-change-transform',
  empty: 'absolute inset-0 flex items-center justify-center',
  emptyContent: 'flex flex-col items-center justify-center',
  emptyText: 'text-sm text-[var(--text-color-secondary)]',
  scrollbar: 'absolute opacity-0 transition-opacity duration-200',
  scrollbarTrack: 'absolute inset-0 rounded-full pointer-events-auto bg-transparent',
  scrollbarThumb: 'absolute rounded-full bg-[var(--scrollbar-color)] pointer-events-auto transition-[background-color,width,height] duration-200 ease-out',
  scrollbarThumbNormal: '',
  scrollbarThumbHover: 'bg-[var(--scrollbar-hover-color)]',
  scrollbarThumbDragging: 'bg-[var(--scrollbar-hover-color)]',
  scrollbarVisible: 'opacity-100',
  scrollbarVertical: 'pointer-events-auto flex justify-center right-[0.0625rem] top-[0.0625rem] bottom-[0.0625rem] w-[0.625rem]',
  scrollbarHorizontal: 'pointer-events-auto flex items-center left-[0.0625rem] right-[0.0625rem] bottom-[0.0625rem] h-[0.625rem]'
}

