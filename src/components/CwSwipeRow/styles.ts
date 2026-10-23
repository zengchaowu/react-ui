import type { CwSwipeRowStyles } from './types'

export const swipeRowBase: CwSwipeRowStyles = {
  swipeOuter: 'cw-swipe-row relative w-full min-w-0',
  swipeTrack: 'relative w-full overflow-hidden',
  swipeActionsBar:
    'absolute inset-y-0 right-0 z-[var(--z-index-base)] flex flex-row items-stretch bg-transparent pointer-events-none',
  /**
   * isSwipeOpen 时：操作栏置于滑动层之上并接收点击。
   * 部分移动端在 transform 后仍由全宽滑动层拦截右侧触摸，故需抬高层级。
   */
  swipeActionsBarRevealed:
    'z-[var(--z-index-above-high)] pointer-events-auto',
  swipeSlideLayer: 'relative z-[var(--z-index-above)]',
  swipeActionBtn:
    'flex min-w-[4.25rem] max-w-[6.5rem] shrink-0 items-center justify-center px-2 text-center [font-size:var(--font-size-body)] font-medium leading-tight text-[var(--text-color-anti)] active:opacity-90',
  swipeActionToneDefault: 'bg-[var(--text-color-secondary)]',
  swipeActionTonePrimary: 'bg-[var(--brand-color-6)]',
  swipeActionToneMuted: 'bg-[var(--text-color-placeholder)]',
  swipeActionToneWarning: 'bg-[var(--warning-color-6)]',
  swipeActionToneDanger: 'bg-[var(--error-color-6)]',
  rowDividerInset:
    'pointer-events-none absolute bottom-0 right-3 h-0 left-[calc(0.75rem+2.5rem+0.625rem)] hairline-border-b border-[var(--border-color)]',
}

/** 会话列表行（2.5rem 头像）内缩底部分割线 */
export const CW_SWIPE_ROW_CHAT_CONVERSATION_DIVIDER_INSET_CLASS =
  'pointer-events-none absolute bottom-0 right-3 h-0 left-[calc(0.75rem+2.5rem+0.625rem)] hairline-border-b border-[var(--border-color)]'

/** 转发会话选择行（2.25rem 头像）内缩底部分割线 */
export const CW_SWIPE_ROW_CHAT_FORWARD_DIVIDER_INSET_CLASS =
  'pointer-events-none absolute bottom-0 right-3 h-0 left-[calc(0.75rem+2.25rem+0.625rem)] hairline-border-b border-[var(--border-color)]'
