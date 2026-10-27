import type { CwChatConversationCellStyles } from '@zengchaowu/ui-shared/components/CwChatConversationCell/types'

/** 与 CwSwipeRow/styles 的 `CW_SWIPE_ROW_CHAT_CONVERSATION_DIVIDER_INSET_CLASS` 一致 */
const CW_SWIPE_ROW_CHAT_CONVERSATION_DIVIDER_INSET_CLASS =
  'pointer-events-none absolute bottom-0 right-3 h-0 left-[calc(0.75rem+2.5rem+0.625rem)] hairline-border-b border-[var(--border-color)]'

export const conversationCellBase: CwChatConversationCellStyles = {
  root: 'conversation-cell relative flex min-h-[var(--size-conversation-cell-min)] w-full min-w-0 cursor-pointer items-center gap-2.5 px-3 py-2 transition-colors duration-100',
  rootSelected: 'bg-[var(--chat-ding-row-selected-bg)]',
  rootUnselected: 'bg-[var(--chat-ding-sidebar-bg)] hover:bg-[var(--chat-ding-row-hover-bg)]',
  /** flex：避免内层 inline-flex（角标根）参与行盒基线对齐，在头像下产生空白条 */
  avatarWrap: 'relative shrink-0 flex items-center',
  redDot:
    'absolute -top-px -right-px box-border h-2 min-w-2 rounded-full border border-[var(--text-color-anti)] bg-[var(--error-color-6)]',
  body: 'min-w-0 flex flex-1 flex-col gap-0.5 overflow-hidden',
  rowTop: 'flex items-center justify-between gap-2',
  nameRow: 'min-w-0 flex items-center gap-1',
  name: 'min-w-0 truncate [font-size:var(--chat-conversation-title-font-size)] leading-snug text-[var(--text-color-primary)]',
  time: 'shrink-0 [font-size:var(--chat-conversation-list-secondary-font-size)] tabular-nums leading-none text-[var(--text-color-placeholder)]',
  rowBottom:
    'flex min-h-4 items-center gap-2 [font-size:var(--chat-conversation-list-secondary-font-size)] leading-snug',
  description:
    'min-w-0 flex-1 text-[var(--text-color-placeholder)] line-clamp-1 break-all ' +
    '[&_.rich-hl]:font-medium ' +
    '[&_.rich-hl-error]:text-[var(--error-color-6)] ' +
    '[&_.rich-hl-draft]:text-[var(--brand-color-6)] ' +
    '[&_.rich-hl-mention]:text-[var(--brand-color-6)] ' +
    '[&_.rich-hl-wallet]:text-[var(--warning-color-6)] ' +
    '[&_.rich-failed]:text-[var(--error-color-6)]',
  rowDividerInset: CW_SWIPE_ROW_CHAT_CONVERSATION_DIVIDER_INSET_CLASS,
}
