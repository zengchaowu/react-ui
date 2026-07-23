import type { ReactNode } from 'react'

export interface CwSelectProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwSelect`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwSelect({ children, className, ...rest }: CwSelectProps & Record<string, unknown>) {
  return (
    <div data-cw="CwSelect" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwSelect
