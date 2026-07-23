import type { ReactNode } from 'react'

export interface CwBadgeProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwBadge`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwBadge({ children, className, ...rest }: CwBadgeProps & Record<string, unknown>) {
  return (
    <div data-cw="CwBadge" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwBadge
