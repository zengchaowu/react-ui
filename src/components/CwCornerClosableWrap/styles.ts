import type { CwIconEmbed } from '../CwIcon/types'
import type { CwCornerClosableWrapStyles } from './types'

/** 关闭图标固定 12px；图标在圆钮内略偏右上 */
export const CW_CORNER_CLOSABLE_WRAP_CLOSE_ICON_STYLES: CwIconEmbed = {
  size: 0.75,
  class: 'absolute left-[0.3125rem] top-[1.25rem] inline-flex items-center justify-center leading-none text-[var(--text-color-secondary)]',
}

/** @internal */
export const cornerClosableWrapBase: CwCornerClosableWrapStyles = {
  root: 'cw-corner-closable-wrap group relative inline-block w-fit max-w-full shrink-0 overflow-hidden',
  rootRounded: 'rounded-[var(--radius-default)]',
  rootSquare: 'rounded-none',
  closeWrap:
    'absolute right-0 top-0 z-[var(--z-index-above)] size-9 translate-x-1/2 -translate-y-1/2 transition-opacity [@media(pointer:fine)]:pointer-events-none [@media(pointer:fine)]:opacity-0 group-hover:pointer-events-auto group-focus-within:pointer-events-auto [@media(pointer:fine)]:group-hover:opacity-100 [@media(pointer:fine)]:group-focus-within:opacity-100',
  closeWrapDisabled:
    '!pointer-events-none !opacity-0 group-hover:!pointer-events-none group-hover:!opacity-0 group-focus-within:!pointer-events-none group-focus-within:!opacity-0',
  closeCircle:
    'relative size-full cursor-pointer rounded-full bg-[var(--bg-color-component)] transition-colors duration-150 hover:bg-[var(--bg-color-secondarycomponent-hover)]',
  closeCircleDisabled: 'cursor-default hover:bg-[var(--bg-color-component)]',
}
