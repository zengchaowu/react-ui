import type { ChatMessageQuotePreview } from '@zengchaowu/shared/types/im-chat'
import type { defaultCwChatMessageQuoteStyles } from './styles'

export type CwChatMessageQuoteStyles = typeof defaultCwChatMessageQuoteStyles

export interface CwChatMessageQuoteProps {
  preview: ChatMessageQuotePreview
  /** 输入框上方引用条可关闭 */
  dismissible?: boolean
  /** 气泡内引用条：点击滚动到被引用消息 */
  navigable?: boolean
  styles?: Partial<CwChatMessageQuoteStyles>
}

export interface CwChatMessageQuoteEmits {
  dismiss: []
  navigate: []
}
