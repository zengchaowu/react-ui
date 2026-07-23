import type { ReactNode } from 'react'

export interface TpGsapProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `TpGsap`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function TpGsap({ children, className, ...rest }: TpGsapProps & Record<string, unknown>) {
  return (
    <div data-cw="TpGsap" className={className} {...rest}>
      {children}
    </div>
  )
}

export default TpGsap
