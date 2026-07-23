import type { ReactNode } from 'react'

export interface CwEmptyStateProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwEmptyState`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwEmptyState({ children, className, ...rest }: CwEmptyStateProps & Record<string, unknown>) {
  return (
    <div data-cw="CwEmptyState" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwEmptyState
