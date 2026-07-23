import type { ReactNode } from 'react'

export interface PageLoginProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `PageLogin`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function PageLogin({ children, className, ...rest }: PageLoginProps & Record<string, unknown>) {
  return (
    <div data-cw="PageLogin" className={className} {...rest}>
      {children}
    </div>
  )
}

export default PageLogin
