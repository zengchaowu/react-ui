import type { ReactNode } from 'react'

export interface CwInfiniteScrollProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwInfiniteScroll`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwInfiniteScroll({ children, className, ...rest }: CwInfiniteScrollProps & Record<string, unknown>) {
  return (
    <div data-cw="CwInfiniteScroll" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwInfiniteScroll
