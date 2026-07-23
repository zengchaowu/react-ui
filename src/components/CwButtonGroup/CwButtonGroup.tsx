import type { ReactNode } from 'react'

export interface CwButtonGroupProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwButtonGroup`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwButtonGroup({ children, className, ...rest }: CwButtonGroupProps & Record<string, unknown>) {
  return (
    <div data-cw="CwButtonGroup" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwButtonGroup
