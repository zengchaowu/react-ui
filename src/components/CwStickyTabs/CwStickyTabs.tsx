import type { ReactNode } from 'react'

export interface CwStickyTabsProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwStickyTabs`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwStickyTabs({ children, className, ...rest }: CwStickyTabsProps & Record<string, unknown>) {
  return (
    <div data-cw="CwStickyTabs" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwStickyTabs
