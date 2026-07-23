import type { ReactNode } from 'react'

export interface CwDropdownProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwDropdown`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwDropdown({ children, className, ...rest }: CwDropdownProps & Record<string, unknown>) {
  return (
    <div data-cw="CwDropdown" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwDropdown
