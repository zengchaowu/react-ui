import { useState, type ReactNode } from 'react'
import type { AgentToolStep } from '@zengchaowu/shared/types/im-chat'
import {
  countExploreActivity,
  formatDelegatePresentation,
  formatExploringGroupHeadline,
  isFileEditToolStep,
} from '@zengchaowu/shared/functions/ai/agentToolDisplayPolicy'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'
import CwIcon from '../CwIcon/CwIcon'
import CwChatAgentToolStep from '../CwChatAgentToolStep/CwChatAgentToolStep'
import CwChatFileChangeBlock from '../CwChatFileChangeBlock/CwChatFileChangeBlock'
import type { CwChatActivityItemsProps } from './types'

/** 与 CwChatAgentToolTimeline/styles 的 agentToolTimelineBase.header 一致 */
const TIMELINE_HEADER_CLASS =
  `group flex w-full min-w-0 cursor-pointer items-center gap-1 border-0 bg-transparent px-0 py-1 text-left outline-none ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`
/** 与 CwChatAgentToolTimeline/styles 的 agentToolTimelineBase.headerLabel 一致 */
const TIMELINE_HEADER_LABEL_CLASS =
  '[font-size:var(--font-size-body)] leading-snug text-[var(--text-color-primary)]'
/** 与 CwChatAgentToolStep/chrome 的 agentToolHeaderChevronClass 一致 */
const TIMELINE_HEADER_CHEVRON_CLASS =
  'shrink-0 text-[var(--text-color-placeholder)] transition-[opacity,transform] duration-150 [@media(pointer:fine)]:opacity-0 [@media(pointer:fine)]:group-hover:opacity-100 [@media(pointer:fine)]:group-focus-visible:opacity-100'
/** 与 CwChatAgentToolStep/chrome 的 agentToolHeaderChevronExpandedClass 一致 */
const TIMELINE_HEADER_CHEVRON_EXPANDED_CLASS = 'rotate-90'
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

export function CwChatActivityItems({
  chatMessageId,
  items,
  reviewForStep,
  onOpenPath,
  className,
}: CwChatActivityItemsProps) {
  const [exploreOpen, setExploreOpen] = useState<Record<number, boolean>>({})

  function exploreExpanded(index: number): boolean {
    return exploreOpen[index] !== false
  }

  function toggleExplore(index: number) {
    setExploreOpen((prev) => ({
      ...prev,
      [index]: !exploreExpanded(index),
    }))
  }

  function renderStep(step: AgentToolStep) {
    if (isFileEditToolStep(step)) {
      return (
        <CwChatFileChangeBlock
          key={step.id}
          chatMessageId={chatMessageId}
          step={step}
          review={reviewForStep?.(step.id)}
          onOpenPath={onOpenPath}
        />
      )
    }
    return (
      <CwChatAgentToolStep
        key={step.id}
        step={step}
        layout="logLine"
        showDetailChevron={false}
        showStatus={false}
        showStatusIcon={false}
      />
    )
  }

  return (
    <div
      className={['flex w-full min-w-0 flex-col gap-1.5', className]
        .filter(Boolean)
        .join(' ')}
    >
      {items.map((item, index) => {
        if (item.kind === 'explore') {
          return (
            <div key={`activity-${index}`} className="min-w-0">
              <button
                type="button"
                className={TIMELINE_HEADER_CLASS}
                aria-expanded={exploreExpanded(index) ? 'true' : 'false'}
                onClick={() => toggleExplore(index)}
              >
                <ShimmerLabel
                  active={countExploreActivity(item.steps).running}
                  className={TIMELINE_HEADER_LABEL_CLASS}
                >
                  {formatExploringGroupHeadline(item.steps)}
                </ShimmerLabel>
                <CwIcon
                  name="common--dir--arrow-right-line"
                  prefix="icon"
                  className={[
                    TIMELINE_HEADER_CHEVRON_CLASS,
                    exploreExpanded(index)
                      ? TIMELINE_HEADER_CHEVRON_EXPANDED_CLASS
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  size={AGENT_TOOL_CHEVRON_SIZE}
                />
              </button>
              {exploreExpanded(index) ? (
                <div className="mt-1 flex flex-col gap-1.5">
                  {item.steps.map((step) => renderStep(step))}
                </div>
              ) : null}
            </div>
          )
        }

        if (item.kind === 'delegate') {
          const presentation = formatDelegatePresentation(item.step)
          return (
            <div key={`activity-${index}`} className="min-w-0 py-1">
              <div className="flex min-w-0 items-baseline gap-2">
                <ShimmerLabel
                  active={item.step.status === 'running'}
                  className={[
                    TIMELINE_HEADER_LABEL_CLASS,
                    'min-w-0 truncate',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {presentation.title}
                </ShimmerLabel>
                {presentation.kind ? (
                  <span className="shrink-0 [font-size:var(--font-size-body)] leading-snug text-[var(--text-color-secondary)]">
                    {presentation.kind}
                  </span>
                ) : null}
              </div>
              {presentation.detail ? (
                <p className="mt-0.5 truncate [font-size:var(--font-size-caption)] leading-snug text-[var(--text-color-secondary)]">
                  {presentation.detail}
                </p>
              ) : null}
              {presentation.waiting ? (
                <p className="mt-1 [font-size:var(--font-size-body)] leading-snug text-[var(--text-color-secondary)]">
                  Waiting for subagent
                </p>
              ) : null}
              {item.step.note?.trim() || item.step.children?.length ? (
                <div className="mt-1 flex flex-col gap-1.5">
                  {item.step.note?.trim() ? (
                    <p className="whitespace-pre-wrap [font-size:var(--font-size-caption)] leading-relaxed text-[var(--text-color-secondary)]">
                      {item.step.note}
                    </p>
                  ) : null}
                  {(item.step.children ?? []).map((child) => renderStep(child))}
                </div>
              ) : null}
            </div>
          )
        }

        if (item.kind === 'file_change') {
          return (
            <CwChatFileChangeBlock
              key={`activity-${index}`}
              chatMessageId={chatMessageId}
              step={item.step}
              review={reviewForStep?.(item.step.id)}
              onOpenPath={onOpenPath}
            />
          )
        }

        if (item.kind === 'command') {
          return (
            <CwChatAgentToolStep
              key={`activity-${index}`}
              step={item.step}
              layout="standalone"
              defaultExpanded={item.step.status === 'error'}
            />
          )
        }

        return null
      })}
    </div>
  )
}

export default CwChatActivityItems
