import type { ReactNode } from 'react'

export interface CwChatMessageCellProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwChatMessageCell`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwChatMessageCell({ children, className, ...rest }: CwChatMessageCellProps & Record<string, unknown>) {
  return (
    <div data-cw="CwChatMessageCell" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwChatMessageCell
