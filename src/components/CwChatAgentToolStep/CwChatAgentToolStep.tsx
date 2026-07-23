import type { ReactNode } from 'react'

export interface CwChatAgentToolStepProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwChatAgentToolStep`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwChatAgentToolStep({ children, className, ...rest }: CwChatAgentToolStepProps & Record<string, unknown>) {
  return (
    <div data-cw="CwChatAgentToolStep" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwChatAgentToolStep
