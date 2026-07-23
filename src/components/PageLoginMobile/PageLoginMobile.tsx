import type { ReactNode } from 'react'

export interface PageLoginMobileProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `PageLoginMobile`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function PageLoginMobile({ children, className, ...rest }: PageLoginMobileProps & Record<string, unknown>) {
  return (
    <div data-cw="PageLoginMobile" className={className} {...rest}>
      {children}
    </div>
  )
}

export default PageLoginMobile
