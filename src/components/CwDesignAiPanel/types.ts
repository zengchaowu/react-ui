/** React 端占位：设计编辑器子组件当前仅在 Vue/Web 端提供。 */
export interface CwDesignAiPanelProps {
  /** 是否正在生成 */
  busy?: boolean
  /** 是否正在流式输出 */
  streaming?: boolean
  /** 助手展示名称 */
  agentDisplayName?: string
  className?: string
}

export type CwDesignAiChatMessageStatus =
  | 'streaming'
  | 'done'
  | 'error'
  | 'applied'
  | 'stopped'
  | 'plan'

export interface CwDesignAiChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  status?: CwDesignAiChatMessageStatus
  error?: string
  at: Date
}

export type CwDesignAiPlanTodoStatus = 'pending' | 'running' | 'done' | 'error' | 'skipped'

export interface CwDesignAiPlanTodoView {
  id: string
  content: string
  status: CwDesignAiPlanTodoStatus
  error?: string
}

export interface CwDesignAiActivePlan {
  title: string
  userGoal: string
  todos: CwDesignAiPlanTodoView[]
  appliedNames: string[]
}

export interface CwDesignAiPanelEmits {
  onClose?: () => void
  onSend?: (prompt: string) => void
  onStop?: () => void
  onClear?: () => void
  onStartPlan?: () => void
}
