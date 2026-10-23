import type { HTMLAttributes } from 'react'
import type { ImFileChangeRecord } from '@zengchaowu/shared/functions/im/imFileChanges'
import type { ImDisplayActivityItem } from '@zengchaowu/shared/functions/ai/groupImDisplayBlocksForRender'

export interface CwChatWorkedBlockProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  chatMessageId?: string
  items: ImDisplayActivityItem[]
  reviewForStep?: (toolCallId: string) => ImFileChangeRecord | null | undefined
  onOpenPath?: (path: string) => void
}
