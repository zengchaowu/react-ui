import type { AgentToolStep } from '@zengchaowu/shared/types/im-chat'
import type { ImFileChangeRecord } from '@zengchaowu/shared/functions/im/imFileChanges'

export interface CwChatFileChangeBlockProps {
  chatMessageId?: string
  step: AgentToolStep
  review?: ImFileChangeRecord | null
  /** Vue `@open-path` */
  onOpenPath?: (path: string) => void
  /** 额外 class，合并到根节点 */
  className?: string
}

export interface CwChatFileChangeBlockTexts {}
