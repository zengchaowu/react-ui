import type { ReactNode } from 'react'

export interface CwChatMessageListProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwChatMessageList`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwChatMessageList({ children, className, ...rest }: CwChatMessageListProps & Record<string, unknown>) {
  return (
    <div data-cw="CwChatMessageList" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwChatMessageList
