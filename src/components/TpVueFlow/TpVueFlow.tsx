import type { ReactNode } from 'react'

export interface TpVueFlowProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `TpVueFlow`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function TpVueFlow({ children, className, ...rest }: TpVueFlowProps & Record<string, unknown>) {
  return (
    <div data-cw="TpVueFlow" className={className} {...rest}>
      {children}
    </div>
  )
}

export default TpVueFlow
