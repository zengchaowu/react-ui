import type { ReactNode } from 'react'

export interface CwTabbarProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwTabbar`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwTabbar({ children, className, ...rest }: CwTabbarProps & Record<string, unknown>) {
  return (
    <div data-cw="CwTabbar" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwTabbar
