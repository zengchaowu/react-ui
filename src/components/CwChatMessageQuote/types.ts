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


/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwChatMessageQuoteEmits {
  dismiss: []
  navigate: []
}
