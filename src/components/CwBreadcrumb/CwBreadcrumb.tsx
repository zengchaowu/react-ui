import type { ReactNode } from 'react'

export interface CwBreadcrumbProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwBreadcrumb`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwBreadcrumb({ children, className, ...rest }: CwBreadcrumbProps & Record<string, unknown>) {
  return (
    <div data-cw="CwBreadcrumb" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwBreadcrumb
