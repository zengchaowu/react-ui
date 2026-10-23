import type { ImFileChangeRecord } from '@zengchaowu/shared/functions/im/imFileChanges'
import type { ImDisplayActivityItem } from '@zengchaowu/shared/functions/ai/groupImDisplayBlocksForRender'

export interface CwChatActivityItemsProps {
  /** 所属消息 id，透传给文件变更块 */
  chatMessageId?: string
  /** 活动条目（explore / delegate / file_change / command） */
  items: ImDisplayActivityItem[]
  /** 按 toolCallId 取文件变更记录 */
  reviewForStep?: (toolCallId: string) => ImFileChangeRecord | null | undefined
  /** 等价 Vue `@open-path` */
  onOpenPath?: (path: string) => void
  /** 额外 class，合并到根节点 */
  className?: string
}
