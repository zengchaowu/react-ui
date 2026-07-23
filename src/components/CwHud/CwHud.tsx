import type { ReactNode } from 'react'

export interface CwHudProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwHud`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwHud({ children, className, ...rest }: CwHudProps & Record<string, unknown>) {
  return (
    <div data-cw="CwHud" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwHud
