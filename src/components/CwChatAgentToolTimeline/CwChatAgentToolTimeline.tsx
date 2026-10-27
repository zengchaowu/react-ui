import { useMemo, useState, type HTMLAttributes } from 'react'
import {
  countExploreActivity,
  formatExploringGroupHeadline,
} from '@zengchaowu/shared/functions/ai/agentToolDisplayPolicy'
import { CwIcon } from '../CwIcon'
import CwChatAgentToolStep from '../CwChatAgentToolStep/CwChatAgentToolStep'
import CwAgentToolShimmerLabel from '../CwChatAgentToolStep/CwAgentToolShimmerLabel'
import { AGENT_TOOL_CHEVRON_SIZE } from '@zengchaowu/ui-shared/components/CwChatAgentToolStep/chrome'
import { agentToolTimelineBase } from '@zengchaowu/ui-shared/components/CwChatAgentToolTimeline/styles'
import type { CwChatAgentToolTimelineProps } from '@zengchaowu/ui-shared/components/CwChatAgentToolTimeline/types'

export interface CwChatAgentToolTimelineComponentProps
  extends CwChatAgentToolTimelineProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  className?: string
}

export function CwChatAgentToolTimeline({
  steps,
  defaultExpanded = false,
  summaryLabel,
  texts: _texts,
  className,
  ...rest
}: CwChatAgentToolTimelineComponentProps) {
  const [panelExpanded, setPanelExpanded] = useState(defaultExpanded)

  const visibleSteps = useMemo(
    () => (steps ?? []).filter((s) => s?.id && s?.name),
    [steps],
  )

  const isExploring = useMemo(
    () => countExploreActivity(visibleSteps).running,
    [visibleSteps],
  )

  const headerSummary = useMemo(() => {
    if (summaryLabel?.trim()) return summaryLabel.trim()
    return formatExploringGroupHeadline(visibleSteps)
  }, [summaryLabel, visibleSteps])

  function togglePanel() {
    setPanelExpanded((prev) => !prev)
  }

  if (visibleSteps.length === 0) return null

  return (
    <div
      {...rest}
      className={[agentToolTimelineBase.root, className]
        .filter(Boolean)
        .join(' ')}
      data-cw-agent-tool-timeline
    >
      <button
        type="button"
        className={agentToolTimelineBase.header}
        aria-expanded={panelExpanded ? 'true' : 'false'}
        onClick={togglePanel}
      >
        <CwAgentToolShimmerLabel
          active={isExploring}
          className={agentToolTimelineBase.headerLabel}
        >
          {headerSummary}
        </CwAgentToolShimmerLabel>
        <CwIcon
          name="common--dir--arrow-right-line"
          prefix="icon"
          className={[
            agentToolTimelineBase.headerChevron,
            panelExpanded ? agentToolTimelineBase.headerChevronExpanded : '',
          ]
            .filter(Boolean)
            .join(' ')}
          size={AGENT_TOOL_CHEVRON_SIZE}
        />
      </button>
      {panelExpanded ? (
        <div className={agentToolTimelineBase.list}>
          {visibleSteps.map((step) => (
            <CwChatAgentToolStep
              key={step.id}
              step={step}
              showDetailChevron={false}
              layout="logLine"
              showStatus={false}
              showStatusIcon={false}
              data-cw-agent-tool-step-id={step.id}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default CwChatAgentToolTimeline
