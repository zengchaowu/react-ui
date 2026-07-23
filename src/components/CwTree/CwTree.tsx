import type { ReactNode } from 'react'

export interface CwTreeProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwTree`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwTree({ children, className, ...rest }: CwTreeProps & Record<string, unknown>) {
  return (
    <div data-cw="CwTree" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwTree
