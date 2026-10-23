import type { AgentToolStep } from '@zengchaowu/shared/types/im-chat'

export interface CwChatAgentToolTimelineStyles {
  root: string
  header: string
  headerChevron: string
  headerChevronExpanded: string
  headerLabel: string
  list: string
  step: string
  stepHeader: string
  stepIcon: string
  stepIconRunning: string
  stepIconDone: string
  stepIconError: string
  stepName: string
  stepStatus: string
  stepDetail: string
  stepDetailPre: string
}

export interface CwChatAgentToolTimelineTexts {
  collapsedSummary: string
  runningLabel: string
  doneLabel: string
  errorLabel: string
  expandStep: string
  argsHeading: string
  resultHeading: string
}

export interface CwChatAgentToolTimelineProps {
  steps: AgentToolStep[]
  defaultExpanded?: boolean
  /** 覆盖默认「Exploring N files, M searches」标题 */
  summaryLabel?: string
  texts?: Partial<CwChatAgentToolTimelineTexts>
}
