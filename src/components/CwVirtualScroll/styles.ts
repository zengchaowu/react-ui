import type { CwVirtualScrollStyles } from './types'

/** @internal */
export const virtualScrollBase: CwVirtualScrollStyles = {
  root: 'cw-virtual-scroll relative flex h-full min-h-0 w-full flex-col outline-none focus:outline-none',
  rootNormal: 'cursor-default',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',
  container: 'relative h-full w-full min-h-0',
  // 与行同底，避免窗口切换时透出页面灰底闪一下
  content: 'relative bg-[var(--bg-color-container)]',
  contentRow: 'flex flex-row items-stretch',
  /** 固定尺寸：文档流 + spacer */
  itemFlow: 'relative shrink-0 box-border overflow-hidden',
  spacer: 'relative shrink-0 pointer-events-none bg-[var(--bg-color-container)]',
  /** 变高：绝对定位 */
  item: 'absolute left-0 top-0 overflow-hidden',
  empty: 'absolute inset-0 flex items-center justify-center',
  emptyContent: 'flex flex-col items-center justify-center',
  emptyText: 'text-sm text-[var(--text-color-secondary)]',
  // 保留类型槽位；滚动条改由 CwDiv 提供
  scrollbar: '',
  scrollbarTrack: '',
  scrollbarThumb: '',
  scrollbarThumbNormal: '',
  scrollbarThumbHover: '',
  scrollbarThumbDragging: '',
  scrollbarVisible: '',
  scrollbarVertical: '',
  scrollbarHorizontal: '',
}
