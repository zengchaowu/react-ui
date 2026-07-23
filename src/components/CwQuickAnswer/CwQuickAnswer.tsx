import type { ReactNode } from 'react'

export interface CwQuickAnswerProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwQuickAnswer`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwQuickAnswer({ children, className, ...rest }: CwQuickAnswerProps & Record<string, unknown>) {
  return (
    <div data-cw="CwQuickAnswer" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwQuickAnswer
