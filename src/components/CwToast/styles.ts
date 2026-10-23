import type { CwToastStyles } from './types'

/** Toast 内容样式；壳层由 CwDynamicDialog variant=toast 提供 */
/** 库内默认内容区 class */
export const cwToastContentStyles: CwToastStyles = {
  root: '',
  positionTop: '',
  positionMiddle: '',
  positionBottom: '',
  box: 'inline-flex box-border min-h-[var(--size-toast-min-h)] max-w-full min-w-0 items-start gap-2 overflow-hidden rounded-lg bg-[var(--toast-surface-bg)] px-3 py-2 text-sm text-[var(--toast-surface-fg)] shadow-[var(--shadow-2)] outline-none touch-pan-x',
  iconWrap: 'mt-0.5 flex shrink-0 items-center justify-center',
  messageWrap: 'flex min-h-[var(--size-toast-message-min-h)] min-w-0 max-w-full flex-[1_1_0%] items-center',
  message:
    'm-0 block max-w-full whitespace-normal break-words [overflow-wrap:anywhere] leading-snug text-[length:inherit] text-[var(--toast-surface-fg)]',
}
