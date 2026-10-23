import type { HTMLAttributes } from 'react'
import type { ChatForwardBundleItem } from '@zengchaowu/shared/types/im-chat'
import type { CwChatMessageForwardBundleTexts } from './texts'

export type { CwChatMessageForwardBundleTexts } from './texts'

export interface CwChatMessageForwardBundleProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  chatMessageId: string
  items?: ChatForwardBundleItem[]
  showOnRight?: boolean
  /** 预览行内 @ 展示昵称 */
  mentionLabelResolver?: (userId: string) => string
  texts?: Partial<CwChatMessageForwardBundleTexts>
  /** 等价 Vue `@open`：点击卡片打开合并转发详情 */
  onOpen?: () => void
}

export interface CwChatMessageForwardBundleEmits {
  open: []
}
