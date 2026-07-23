import type { ReactNode } from 'react'

export interface CwChatToolbarProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwChatToolbar`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwChatToolbar({ children, className, ...rest }: CwChatToolbarProps & Record<string, unknown>) {
  return (
    <div data-cw="CwChatToolbar" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwChatToolbar
