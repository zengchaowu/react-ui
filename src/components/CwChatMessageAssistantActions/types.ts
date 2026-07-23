import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'

export type CwChatAssistantMessageFeedbackVote = 'up' | 'down'

export interface CwChatMessageAssistantActionsStyles {
  root: string
  leftGroup: string
  rightGroup: string
  actionIcon: string
  actionIconActive: string
}

export interface CwChatMessageAssistantActionsTexts {
  speechLabel: string
  speechPlayingLabel: string
  copyLabel: string
  likeLabel: string
  dislikeLabel: string
}

export interface CwChatMessageAssistantActionsProps {
  message: ChatMessage
  disabled?: boolean
  speechPlaying?: boolean
  feedbackVote?: CwChatAssistantMessageFeedbackVote | null
  styles?: Partial<CwChatMessageAssistantActionsStyles>
  texts?: Partial<CwChatMessageAssistantActionsTexts>
}

export interface CwChatMessageAssistantActionsEmits {
  speech: [message: ChatMessage]
  copy: [message: ChatMessage]
  feedback: [message: ChatMessage, vote: CwChatAssistantMessageFeedbackVote | null]
}
