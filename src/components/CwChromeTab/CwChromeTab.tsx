import type { ReactNode } from 'react'

export interface CwChromeTabProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwChromeTab`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwChromeTab({ children, className, ...rest }: CwChromeTabProps & Record<string, unknown>) {
  return (
    <div data-cw="CwChromeTab" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwChromeTab
