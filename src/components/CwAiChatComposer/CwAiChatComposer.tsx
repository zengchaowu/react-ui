import type { ReactNode } from 'react'

export interface CwAiChatComposerProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwAiChatComposer`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwAiChatComposer({ children, className, ...rest }: CwAiChatComposerProps & Record<string, unknown>) {
  return (
    <div data-cw="CwAiChatComposer" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwAiChatComposer
