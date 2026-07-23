import type { ReactNode } from 'react'

export interface TpLeafletProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `TpLeaflet`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function TpLeaflet({ children, className, ...rest }: TpLeafletProps & Record<string, unknown>) {
  return (
    <div data-cw="TpLeaflet" className={className} {...rest}>
      {children}
    </div>
  )
}

export default TpLeaflet
