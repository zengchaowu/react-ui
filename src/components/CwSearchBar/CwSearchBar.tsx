import type { ReactNode } from 'react'

export interface CwSearchBarProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwSearchBar`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwSearchBar({ children, className, ...rest }: CwSearchBarProps & Record<string, unknown>) {
  return (
    <div data-cw="CwSearchBar" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwSearchBar
