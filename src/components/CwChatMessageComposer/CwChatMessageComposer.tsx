import type { ReactNode } from 'react'

export interface CwChatMessageComposerProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwChatMessageComposer`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwChatMessageComposer({ children, className, ...rest }: CwChatMessageComposerProps & Record<string, unknown>) {
  return (
    <div data-cw="CwChatMessageComposer" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwChatMessageComposer
