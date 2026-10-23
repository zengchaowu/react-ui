import type { CwCardStyles } from './types'

/** 默认与各 appearance 壳层共用：固定头高，避免 py-* 撑高 */
export const CARD_HEADER_CLASS =
  'flex items-center justify-between px-4 h-9 relative'

/** @internal 库内默认 class */
export const cardBase: CwCardStyles = {
  root: 'cw-card w-full bg-[var(--bg-color-container)] border border-[var(--border-color)] rounded-lg overflow-hidden',
  header: CARD_HEADER_CLASS,
  /** 与 hairline.css 同 0.5px；inset 仍用伪元素，色用 component 以区别于外框 */
  headerDivider:
    'after:pointer-events-none after:absolute after:inset-x-4 after:bottom-0 after:h-0 after:border-0 after:border-b after:border-solid after:[border-bottom-width:0.5px] after:border-[var(--bg-color-component)]',
  headerClickable:
    'cursor-pointer outline-none focus:outline-none transition-colors duration-200 hover:bg-[var(--bg-color-component-hover)]',
  headerLeft: '',
  headerRight: '',
  body: 'pt-3 px-3 pb-4',
}
