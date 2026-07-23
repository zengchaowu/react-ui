import type { ReactNode } from 'react'

export interface CwChatAgentToolTimelineProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwChatAgentToolTimeline`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwChatAgentToolTimeline({ children, className, ...rest }: CwChatAgentToolTimelineProps & Record<string, unknown>) {
  return (
    <div data-cw="CwChatAgentToolTimeline" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwChatAgentToolTimeline
