import type { ReactNode } from 'react'

export interface CwChatShellProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwChatShell`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwChatShell({ children, className, ...rest }: CwChatShellProps & Record<string, unknown>) {
  return (
    <div data-cw="CwChatShell" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwChatShell
