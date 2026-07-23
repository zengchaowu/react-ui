import type { ReactNode } from 'react'

export interface CwNavigationTreeProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwNavigationTree`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwNavigationTree({ children, className, ...rest }: CwNavigationTreeProps & Record<string, unknown>) {
  return (
    <div data-cw="CwNavigationTree" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwNavigationTree
