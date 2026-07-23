import type { ReactNode } from 'react'

export interface CwChatMessageQuoteProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwChatMessageQuote`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwChatMessageQuote({ children, className, ...rest }: CwChatMessageQuoteProps & Record<string, unknown>) {
  return (
    <div data-cw="CwChatMessageQuote" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwChatMessageQuote
