import type { ReactNode } from 'react'

export interface CwStackProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwStack`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwStack({ children, className, ...rest }: CwStackProps & Record<string, unknown>) {
  return (
    <div data-cw="CwStack" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwStack
