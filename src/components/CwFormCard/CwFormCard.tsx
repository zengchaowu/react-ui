import type { ReactNode } from 'react'

export interface CwFormCardProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwFormCard`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwFormCard({ children, className, ...rest }: CwFormCardProps & Record<string, unknown>) {
  return (
    <div data-cw="CwFormCard" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwFormCard
