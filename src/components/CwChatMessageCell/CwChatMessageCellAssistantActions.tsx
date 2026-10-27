import type { KeyboardEvent, ReactNode } from 'react'
import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'
import CwIcon from '../CwIcon/CwIcon'
import type { CwChatAssistantMessageFeedbackVote } from '@zengchaowu/ui-shared/components/CwChatMessageCell/types'
import {
  assistantActionsBase,
  cwChatMessageAssistantActionIconStyles,
} from './assistantActionsStyles'
import { defaultCwChatMessageAssistantActionsTexts } from '@zengchaowu/ui-shared/components/CwChatMessageCell/assistantActionsTexts'
import { useChatVoiceIconFrame } from './useChatVoiceIconFrame'

export interface CwChatMessageCellAssistantActionsProps {
  message: ChatMessage
  disabled?: boolean
  speechPlaying?: boolean
  feedbackVote?: CwChatAssistantMessageFeedbackVote | null
  /** hover 消息底部操作区才显示（fine pointer；触屏常显） */
  revealOnHover?: boolean
  /** 具名插槽 `share` */
  shareSlot?: ReactNode
  className?: string
  /** 等价 Vue `@speech` */
  onSpeech?: (message: ChatMessage) => void
  /** 等价 Vue `@copy` */
  onCopy?: (message: ChatMessage) => void
  /** 等价 Vue `@feedback` */
  onFeedback?: (
    message: ChatMessage,
    vote: CwChatAssistantMessageFeedbackVote | null,
  ) => void
}

export function CwChatMessageCellAssistantActions({
  message,
  disabled = false,
  speechPlaying = false,
  feedbackVote = null,
  revealOnHover = false,
  shareSlot,
  className,
  onSpeech,
  onCopy,
  onFeedback,
}: CwChatMessageCellAssistantActionsProps) {
  const actionIconStyles = cwChatMessageAssistantActionIconStyles
  const texts = defaultCwChatMessageAssistantActionsTexts
  const { iconName: speechIconName } = useChatVoiceIconFrame(speechPlaying)

  function onSpeechClick() {
    if (disabled) return
    onSpeech?.(message)
  }

  function onCopyClick() {
    if (disabled) return
    onCopy?.(message)
  }

  function onFeedbackClick(vote: CwChatAssistantMessageFeedbackVote) {
    if (disabled) return
    onFeedback?.(message, feedbackVote === vote ? null : vote)
  }

  function keyHandler(action: () => void) {
    return (event: KeyboardEvent<HTMLSpanElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      event.stopPropagation()
      action()
    }
  }

  const rootClassName = [
    assistantActionsBase.root,
    revealOnHover ? assistantActionsBase.rootRevealOnHover : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClassName}>
      <div className={assistantActionsBase.leftGroup}>
        <span
          role="button"
          tabIndex={0}
          className={[
            assistantActionsBase.actionIcon,
            speechPlaying ? assistantActionsBase.actionIconActive : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-disabled={disabled ? 'true' : undefined}
          aria-label={speechPlaying ? texts.speechPlayingLabel : texts.speechLabel}
          title={speechPlaying ? texts.speechPlayingLabel : texts.speechLabel}
          onClick={(event) => {
            event.stopPropagation()
            onSpeechClick()
          }}
          onKeyDown={keyHandler(onSpeechClick)}
        >
          <CwIcon
            name={speechIconName}
            prefix="icon"
            size={actionIconStyles.size ?? 1}
            className={[actionIconStyles.class, 'scale-x-[-1]']
              .filter(Boolean)
              .join(' ')}
          />
        </span>
        <span
          role="button"
          tabIndex={0}
          className={assistantActionsBase.actionIcon}
          aria-disabled={disabled ? 'true' : undefined}
          aria-label={texts.copyLabel}
          title={texts.copyLabel}
          onClick={(event) => {
            event.stopPropagation()
            onCopyClick()
          }}
          onKeyDown={keyHandler(onCopyClick)}
        >
          <CwIcon
            name="common--action--copy-line"
            prefix="icon"
            size={actionIconStyles.size ?? 1}
            className={actionIconStyles.class}
          />
        </span>
        <span
          role="button"
          tabIndex={0}
          className={[
            assistantActionsBase.actionIcon,
            feedbackVote === 'up' ? assistantActionsBase.actionIconActive : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-disabled={disabled ? 'true' : undefined}
          aria-label={texts.likeLabel}
          aria-pressed={feedbackVote === 'up' ? 'true' : 'false'}
          title={texts.likeLabel}
          onClick={(event) => {
            event.stopPropagation()
            onFeedbackClick('up')
          }}
          onKeyDown={keyHandler(() => onFeedbackClick('up'))}
        >
          <CwIcon
            name="chat--social--like-line"
            prefix="icon"
            size={actionIconStyles.size ?? 1}
            className={actionIconStyles.class}
          />
        </span>
        <span
          role="button"
          tabIndex={0}
          className={[
            assistantActionsBase.actionIcon,
            feedbackVote === 'down' ? assistantActionsBase.actionIconActive : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-disabled={disabled ? 'true' : undefined}
          aria-label={texts.dislikeLabel}
          aria-pressed={feedbackVote === 'down' ? 'true' : 'false'}
          title={texts.dislikeLabel}
          onClick={(event) => {
            event.stopPropagation()
            onFeedbackClick('down')
          }}
          onKeyDown={keyHandler(() => onFeedbackClick('down'))}
        >
          <CwIcon
            name="chat--social--dislike-line"
            prefix="icon"
            size={actionIconStyles.size ?? 1}
            className={actionIconStyles.class}
          />
        </span>
      </div>
      <div className={assistantActionsBase.rightGroup}>{shareSlot}</div>
    </div>
  )
}

export default CwChatMessageCellAssistantActions
