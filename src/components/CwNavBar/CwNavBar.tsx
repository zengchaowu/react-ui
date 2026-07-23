import type { ReactNode } from 'react'

export interface CwNavBarProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwNavBar`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwNavBar({ children, className, ...rest }: CwNavBarProps & Record<string, unknown>) {
  return (
    <div data-cw="CwNavBar" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwNavBar
