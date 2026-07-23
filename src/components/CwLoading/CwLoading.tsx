import type { ReactNode } from 'react'

export interface CwLoadingProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwLoading`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwLoading({ children, className, ...rest }: CwLoadingProps & Record<string, unknown>) {
  return (
    <div data-cw="CwLoading" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwLoading
