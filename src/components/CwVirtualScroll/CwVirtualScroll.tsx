import type { ReactNode } from 'react'

export interface CwVirtualScrollProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwVirtualScroll`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwVirtualScroll({ children, className, ...rest }: CwVirtualScrollProps & Record<string, unknown>) {
  return (
    <div data-cw="CwVirtualScroll" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwVirtualScroll
