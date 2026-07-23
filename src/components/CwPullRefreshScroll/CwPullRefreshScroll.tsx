import type { ReactNode } from 'react'

export interface CwPullRefreshScrollProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwPullRefreshScroll`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwPullRefreshScroll({ children, className, ...rest }: CwPullRefreshScrollProps & Record<string, unknown>) {
  return (
    <div data-cw="CwPullRefreshScroll" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwPullRefreshScroll
