import type { CwDivStyles } from './types'

export const divBase: CwDivStyles = {
  root: 'cw-div relative flex min-h-0 flex-col !overflow-hidden',
  viewport:
    'cw-div__viewport relative min-h-0 w-full max-w-[inherit] max-h-[inherit] flex-[1_1_0%] !overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:!hidden [&::-webkit-scrollbar]:!h-0 [&::-webkit-scrollbar]:!w-0',
  content:
    'cw-div__content relative flex min-h-full min-w-full w-full flex-1 flex-col touch-pan-x touch-pan-y',
  /** 仅控制透明度；轨道须保持 pointer-events-auto，否则透明时无法 hover 唤起（对齐旧版 CSS） */
  scrollbarHidden: 'opacity-0',
  scrollbarShown: 'opacity-100 transition-opacity duration-[250ms] ease-out',
  scrollbarVertical:
    'cw-div__scrollbar cw-div__scrollbar--vertical group pointer-events-auto absolute bottom-px right-px top-px z-[var(--z-index-scrollbar)] flex w-2 touch-none justify-center',
  scrollbarVerticalHasHorizontal: '!bottom-[0.5625rem]',
  scrollbarHorizontal:
    'cw-div__scrollbar cw-div__scrollbar--horizontal group pointer-events-auto absolute bottom-px left-px right-px z-[var(--z-index-scrollbar)] flex h-2 touch-none items-center',
  scrollbarHorizontalHasVertical: '!right-[0.5625rem]',
  thumbBase:
    'cw-div__thumb absolute cursor-pointer rounded-full bg-[var(--scrollbar-color)] transition-[background-color,width,height] duration-200 ease-out group-hover:bg-[var(--scrollbar-hover-color)] group-active:bg-[var(--scrollbar-hover-color)]',
  thumbVertical:
    'left-1/2 min-h-6 w-[0.3125rem] -translate-x-1/2 group-hover:w-1.5 group-active:w-1.5',
  thumbHorizontal:
    'top-1/2 min-w-6 h-[0.3125rem] -translate-y-1/2 group-hover:h-1.5 group-active:h-1.5',
}
