import type { ReactNode } from 'react'

export interface CwConfigCardProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwConfigCard`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwConfigCard({ children, className, ...rest }: CwConfigCardProps & Record<string, unknown>) {
  return (
    <div data-cw="CwConfigCard" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwConfigCard
