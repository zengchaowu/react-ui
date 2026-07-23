import type { ReactNode } from 'react'

export interface CwChatConversationCellProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwChatConversationCell`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwChatConversationCell({ children, className, ...rest }: CwChatConversationCellProps & Record<string, unknown>) {
  return (
    <div data-cw="CwChatConversationCell" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwChatConversationCell
