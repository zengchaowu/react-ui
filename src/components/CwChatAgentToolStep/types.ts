import type { AgentToolStep } from '@zengchaowu/shared/types/im-chat'

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
}

export interface CwChatAgentToolStepProps {
  step: AgentToolStep
  /** 非受控：初始是否展开详情 */
  defaultExpanded?: boolean
  /** 受控：详情是否展开 */
  detailExpanded?: boolean
  /** 可展开时是否在标题前显示 chevron（Timeline 内嵌时为 false） */
  showDetailChevron?: boolean
  styles?: Partial<CwChatAgentToolStepStyles>
  texts?: Partial<CwChatAgentToolStepTexts>
}

export interface CwChatAgentToolStepEmits {
  (e: 'update:detailExpanded', value: boolean): void
}
