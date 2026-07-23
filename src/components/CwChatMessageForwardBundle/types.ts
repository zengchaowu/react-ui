import type { ChatForwardBundleItem } from '@zengchaowu/shared/types/im-chat'
import type { defaultCwChatMessageForwardBundleStyles } from './styles'
import type { CwChatMessageForwardBundleTexts } from './texts'

export type CwChatMessageForwardBundleStyles = typeof defaultCwChatMessageForwardBundleStyles

export interface CwChatMessageForwardBundleProps {
  chatMessageId: string
  items: ChatForwardBundleItem[]
  showOnRight?: boolean
  /** 预览行内 @ 展示昵称 */
  mentionLabelResolver?: (userId: string) => string
  styles?: Partial<CwChatMessageForwardBundleStyles>
  texts?: Partial<CwChatMessageForwardBundleTexts>
}

export interface CwChatMessageForwardBundleEmits {
  open: []
}
