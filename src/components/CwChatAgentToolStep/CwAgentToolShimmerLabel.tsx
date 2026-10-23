import type { ReactNode } from 'react'

export interface CwAgentToolShimmerLabelProps {
  active?: boolean
  className?: string
  children?: ReactNode
}

export function CwAgentToolShimmerLabel({
  active = false,
  className,
  children,
}: CwAgentToolShimmerLabelProps) {
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

export default CwAgentToolShimmerLabel
