import type { ReactNode } from 'react'

export interface CwDataTreeProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwDataTree`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwDataTree({ children, className, ...rest }: CwDataTreeProps & Record<string, unknown>) {
  return (
    <div data-cw="CwDataTree" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwDataTree
