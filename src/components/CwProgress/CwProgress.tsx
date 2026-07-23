import type { ReactNode } from 'react'

export interface CwProgressProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwProgress`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwProgress({ children, className, ...rest }: CwProgressProps & Record<string, unknown>) {
  return (
    <div data-cw="CwProgress" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwProgress
