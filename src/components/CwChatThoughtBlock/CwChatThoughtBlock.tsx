import { useEffect, useRef, useState } from 'react'
import { formatThoughtLabel } from '@zengchaowu/shared/functions/ai/formatThoughtLabel'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'
import { CwIcon } from '../CwIcon'
import { CwMarkdown } from '../CwMarkdown'
import { CwAgentToolShimmerLabel } from '../CwChatAgentToolStep/CwAgentToolShimmerLabel'
import {
  AGENT_TOOL_CHEVRON_SIZE,
  agentToolHeaderChevronClass,
  agentToolHeaderChevronExpandedClass,
} from '@zengchaowu/ui-shared/components/CwChatAgentToolStep/chrome'
import {
  chatAgentAuxiliaryBodyTextClass,
  chatAgentAuxiliaryLabelTextClass,
} from '@zengchaowu/ui-shared/components/CwChatMessageCell/chatMessageTypography'
import type { CwChatThoughtBlockProps } from './types'

export function CwChatThoughtBlock({
  chatMessageId,
  content,
  startedAt,
  endedAt,
  defaultExpanded,
  className,
}: CwChatThoughtBlockProps) {
  const pinnedRef = useRef(false)
  const [expanded, setExpanded] = useState(
    () => defaultExpanded ?? !String(endedAt ?? '').trim(),
  )

  const prevEndedRef = useRef(endedAt)

  useEffect(() => {
    const prev = prevEndedRef.current
    prevEndedRef.current = endedAt
    if (pinnedRef.current || defaultExpanded !== undefined) return
    if (endedAt && !String(prev ?? '').trim()) setExpanded(false)
  }, [endedAt, defaultExpanded])

  const streaming = !String(endedAt ?? '').trim()

  const headerLabel = formatThoughtLabel({
    startedAt,
    endedAt,
    streaming,
  })

  const bodyText = String(content ?? '').trim()

  if (!bodyText) return null

  const toggle = () => {
    pinnedRef.current = true
    setExpanded((value) => !value)
  }

  return (
    <div
      className={[
        'cw-chat-thought-block w-full min-w-0 max-w-full cursor-text select-text text-[var(--text-color-secondary)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-cw-chat-message-bubble-body
      data-chat-message-id={chatMessageId}
      data-cw-chat-thought
    >
      <button
        type="button"
        className={[
          'group flex w-full min-w-0 cursor-pointer items-center gap-1 border-0 bg-transparent px-0 py-1 text-left outline-none',
          FOCUS_VISIBLE_INTERACTIVE_CLASS,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-expanded={expanded ? 'true' : 'false'}
        onClick={toggle}
      >
        <CwAgentToolShimmerLabel
          active={streaming}
          className={chatAgentAuxiliaryLabelTextClass}
        >
          {headerLabel}
        </CwAgentToolShimmerLabel>
        <CwIcon
          name="common--dir--arrow-right-line"
          prefix="icon"
          className={[
            agentToolHeaderChevronClass,
            expanded ? agentToolHeaderChevronExpandedClass : '',
          ]
            .filter(Boolean)
            .join(' ')}
          size={AGENT_TOOL_CHEVRON_SIZE}
        />
      </button>
      {expanded && (
        <CwMarkdown
          content={bodyText}
          size="small"
          contentTextClass={chatAgentAuxiliaryBodyTextClass}
          className="min-w-0 max-w-full pt-1 text-[var(--text-color-secondary)]"
        />
      )}
    </div>
  )
}

export default CwChatThoughtBlock
