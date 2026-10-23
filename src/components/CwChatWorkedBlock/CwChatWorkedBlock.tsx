import { useMemo, useState, type ReactNode } from 'react'
import type { AgentToolStep } from '@zengchaowu/shared/types/im-chat'
import { formatWorkedLabel } from '@zengchaowu/shared/functions/ai/agentToolDisplayPolicy'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'
import { CwIcon } from '../CwIcon'
import { CwChatActivityItems } from '../CwChatActivityItems'
import type { CwChatWorkedBlockProps } from './types'

/** 与 CwChatAgentToolTimeline/styles 的 agentToolTimelineBase 保持一致 */
const agentToolTimelineBase = {
  root:
    'cw-chat-agent-tool-timeline w-full min-w-0 max-w-full bg-transparent text-[var(--text-color-primary)]',
  header: `group flex w-full min-w-0 cursor-pointer items-center gap-1 border-0 bg-transparent px-0 py-1 text-left outline-none ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  headerChevron:
    'shrink-0 text-[var(--text-color-placeholder)] transition-[opacity,transform] duration-150 [@media(pointer:fine)]:opacity-0 [@media(pointer:fine)]:group-hover:opacity-100 [@media(pointer:fine)]:group-focus-visible:opacity-100',
  headerChevronExpanded: 'rotate-90',
  headerLabel:
    '[font-size:var(--font-size-body)] leading-snug text-[var(--text-color-primary)]',
}

/** 与 CwChatAgentToolStep/chrome 的 AGENT_TOOL_CHEVRON_SIZE 一致 */
const AGENT_TOOL_CHEVRON_SIZE = 0.625

function ShimmerLabel({
  active,
  className,
  children,
}: {
  active?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={[
        'cw-agent-tool-shimmer-label',
        active ? 'cw-agent-tool-shimmer-label--active' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}

function walkSteps(
  steps: AgentToolStep[],
  visit: (step: AgentToolStep) => void,
): void {
  for (const step of steps) {
    visit(step)
    if (step.children?.length) walkSteps(step.children, visit)
  }
}

export function CwChatWorkedBlock({
  chatMessageId,
  items,
  reviewForStep,
  onOpenPath,
  className,
  ...rest
}: CwChatWorkedBlockProps) {
  const [expanded, setExpanded] = useState(false)
  const [heldOpen, setHeldOpen] = useState(false)

  const timing = useMemo(() => {
    let startedAt = ''
    let endedAt = ''
    let running = false

    const see = (start?: string, end?: string, status?: string) => {
      if (status === 'running' || (start && !end)) running = true
      if (start && (!startedAt || start < startedAt)) startedAt = start
      if (end && (!endedAt || end > endedAt)) endedAt = end
    }

    for (const item of items) {
      if (item.kind === 'explore') {
        walkSteps(item.steps, (step) => see(step.startedAt, step.endedAt, step.status))
        continue
      }
      walkSteps([item.step], (step) => see(step.startedAt, step.endedAt, step.status))
    }

    return {
      startedAt: startedAt || undefined,
      endedAt: running ? undefined : endedAt || undefined,
      running,
    }
  }, [items])

  const headerLabel = formatWorkedLabel(timing)

  function toggle() {
    setHeldOpen(true)
    setExpanded((value) => !value)
  }

  return (
    <div
      className={['w-full min-w-0', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {timing.running && !heldOpen ? (
        <CwChatActivityItems
          chatMessageId={chatMessageId}
          items={items}
          reviewForStep={reviewForStep}
          onOpenPath={onOpenPath}
        />
      ) : (
        <div
          className={agentToolTimelineBase.root}
          data-cw-chat-worked=""
          data-cw-chat-message-bubble-body=""
          data-chat-message-id={chatMessageId}
        >
          <button
            type="button"
            className={agentToolTimelineBase.header}
            aria-expanded={expanded ? 'true' : 'false'}
            onClick={toggle}
          >
            <ShimmerLabel
              active={timing.running}
              className={agentToolTimelineBase.headerLabel}
            >
              {headerLabel}
            </ShimmerLabel>
            <CwIcon
              name="common--dir--arrow-right-line"
              prefix="icon"
              className={[
                agentToolTimelineBase.headerChevron,
                expanded ? agentToolTimelineBase.headerChevronExpanded : '',
              ]
                .filter(Boolean)
                .join(' ')}
              size={AGENT_TOOL_CHEVRON_SIZE}
            />
          </button>
          {expanded && (
            <CwChatActivityItems
              chatMessageId={chatMessageId}
              items={items}
              reviewForStep={reviewForStep}
              onOpenPath={onOpenPath}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default CwChatWorkedBlock
