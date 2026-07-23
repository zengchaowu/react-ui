import type { ReactNode } from 'react'

export interface CwInfiniteLoopScrollProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwInfiniteLoopScroll`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwInfiniteLoopScroll({ children, className, ...rest }: CwInfiniteLoopScrollProps & Record<string, unknown>) {
  return (
    <div data-cw="CwInfiniteLoopScroll" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwInfiniteLoopScroll
