import type { ReactNode } from 'react'

export interface CwDividerProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwDivider`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwDivider({ children, className, ...rest }: CwDividerProps & Record<string, unknown>) {
  return (
    <div data-cw="CwDivider" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwDivider
