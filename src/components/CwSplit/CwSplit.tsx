import type { ReactNode } from 'react'

export interface CwSplitProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwSplit`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwSplit({ children, className, ...rest }: CwSplitProps & Record<string, unknown>) {
  return (
    <div data-cw="CwSplit" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwSplit
