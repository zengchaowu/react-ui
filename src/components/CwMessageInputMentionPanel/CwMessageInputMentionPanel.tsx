import type { ReactNode } from 'react'

export interface CwMessageInputMentionPanelProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwMessageInputMentionPanel`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwMessageInputMentionPanel({ children, className, ...rest }: CwMessageInputMentionPanelProps & Record<string, unknown>) {
  return (
    <div data-cw="CwMessageInputMentionPanel" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwMessageInputMentionPanel
