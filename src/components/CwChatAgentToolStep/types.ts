import type { AgentToolStep } from '@zengchaowu/shared/types/im-chat'
import type { CwChatAgentToolStepLayout } from './styles'

export interface CwChatAgentToolStepStyles {
  root: string
  header: string
  headerStatic: string
  headerChevron: string
  headerChevronExpanded: string
  stepIcon: string
  stepIconRunning: string
  stepIconDone: string
  stepIconError: string
  stepName: string
  stepStatus: string
  stepDetail: string
  stepDetailPre: string
}

export interface CwChatAgentToolStepTexts {
  runningLabel: string
  doneLabel: string
  errorLabel: string
  argsHeading: string
  resultHeading: string
  expandLabel: string
  collapseLabel: string
}

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

export interface CwChatAgentToolStepEmits {
  (e: 'update:detailExpanded', value: boolean): void
}
