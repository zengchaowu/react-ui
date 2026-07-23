import type { ReactNode } from 'react'

export interface CwCascaderProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwCascader`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwCascader({ children, className, ...rest }: CwCascaderProps & Record<string, unknown>) {
  return (
    <div data-cw="CwCascader" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwCascader
