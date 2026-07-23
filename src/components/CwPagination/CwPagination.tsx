import type { ReactNode } from 'react'

export interface CwPaginationProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwPagination`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwPagination({ children, className, ...rest }: CwPaginationProps & Record<string, unknown>) {
  return (
    <div data-cw="CwPagination" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwPagination
