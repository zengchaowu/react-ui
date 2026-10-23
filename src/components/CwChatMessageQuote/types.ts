import type { HTMLAttributes } from 'react'
import type { ChatMessageQuotePreview } from '@zengchaowu/shared/types/im-chat'

export interface CwChatMessageQuoteProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'onClick'> {
  preview: ChatMessageQuotePreview
  /** 输入框上方引用条可关闭 */
  dismissible?: boolean
  /** 气泡内引用条：点击滚动到被引用消息 */
  navigable?: boolean
  onDismiss?: () => void
  onNavigate?: () => void
}
