import type { ReactNode } from 'react'

export interface CwTabsStripProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwTabsStrip`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwTabsStrip({ children, className, ...rest }: CwTabsStripProps & Record<string, unknown>) {
  return (
    <div data-cw="CwTabsStrip" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwTabsStrip
