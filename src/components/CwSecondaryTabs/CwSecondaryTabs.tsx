import type { ReactNode } from 'react'

export interface CwSecondaryTabsProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwSecondaryTabs`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwSecondaryTabs({ children, className, ...rest }: CwSecondaryTabsProps & Record<string, unknown>) {
  return (
    <div data-cw="CwSecondaryTabs" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwSecondaryTabs
