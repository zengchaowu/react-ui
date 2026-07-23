import type { ReactNode } from 'react'

export interface CwSkeletonProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwSkeleton`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwSkeleton({ children, className, ...rest }: CwSkeletonProps & Record<string, unknown>) {
  return (
    <div data-cw="CwSkeleton" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwSkeleton
