import type { ReactNode } from 'react'

export interface CwLoginMethodSwitchProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwLoginMethodSwitch`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwLoginMethodSwitch({ children, className, ...rest }: CwLoginMethodSwitchProps & Record<string, unknown>) {
  return (
    <div data-cw="CwLoginMethodSwitch" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwLoginMethodSwitch
