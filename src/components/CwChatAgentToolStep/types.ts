import type { AgentToolStep } from '@zengchaowu/shared/types/im-chat'
import type { CwChatAgentToolStepLayout } from '@zengchaowu/ui-shared/components/CwChatAgentToolStep/styles'
import type { CwChatAgentToolStepTexts } from '@zengchaowu/ui-shared/components/CwChatAgentToolStep/types'

export type { CwChatAgentToolStepLayout }

export interface CwChatAgentToolStepProps {
  step: AgentToolStep
  defaultExpanded?: boolean
  detailExpanded?: boolean
  showDetailChevron?: boolean
  /** logLine：Cursor 式灰字一行；standalone：独立工具卡 */
  layout?: CwChatAgentToolStepLayout
  /** 为 false 时不展示完成/失败状态文案 */
  showStatus?: boolean
  /** 为 false 时不展示勾选图标（仍显示 loading / error） */
  showStatusIcon?: boolean
  texts?: Partial<CwChatAgentToolStepTexts>
  /** 等价 Vue `@update:detailExpanded` */
  onUpdateDetailExpanded?: (value: boolean) => void
}
