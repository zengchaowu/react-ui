import type { ReactNode } from 'react'

export interface CwDataTableProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwDataTable`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwDataTable({ children, className, ...rest }: CwDataTableProps & Record<string, unknown>) {
  return (
    <div data-cw="CwDataTable" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwDataTable
