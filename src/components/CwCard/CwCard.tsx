import type { ReactNode } from 'react'

export interface CwCardProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwCard`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwCard({ children, className, ...rest }: CwCardProps & Record<string, unknown>) {
  return (
    <div data-cw="CwCard" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwCard
