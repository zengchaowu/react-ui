import type { ChatMessage, ChatMessageKnowledgeSource } from '@zengchaowu/shared/types/im-chat'

export type CwWorkbenchAiMessageStatus =
  | 'streaming'
  | 'done'
  | 'error'
  | 'stopped'

export type CwWorkbenchAiMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  status?: CwWorkbenchAiMessageStatus
  error?: string
  at: Date
  /** RAG 引用溯源（domain knowledge_sources） */
  knowledgeSources?: ChatMessageKnowledgeSource[]
}

export interface CwWorkbenchAiPanelTexts {
  title?: string
  clearTitle?: string
  closeTitle?: string
  emptyMessages?: string
  composerPlaceholder?: string
  composerPlaceholderWithContext?: string
  stoppedSuffix?: string
  stoppedEmpty?: string
  userSenderName?: string
  assistantFallbackName?: string
}

export interface CwWorkbenchAiPanelProps {
  title?: string
  subtitle?: string
  messages?: ChatMessage[]
  busy?: boolean
  ready?: boolean
  errorMessage?: string
  avatarFallbackSrc?: string
  /** 宿主公共资源根（emojione 等）；qiankun 微应用须传自身源站 */
  publicAssetBaseUrl?: string
  hasSelectionContext?: boolean
  texts?: Partial<CwWorkbenchAiPanelTexts>
}
