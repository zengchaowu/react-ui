import type { ReactNode } from 'react'

export interface CwCellProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwCell`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwCell({ children, className, ...rest }: CwCellProps & Record<string, unknown>) {
  return (
    <div data-cw="CwCell" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwCell
