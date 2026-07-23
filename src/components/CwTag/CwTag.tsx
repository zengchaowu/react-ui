import type { ReactNode } from 'react'

export interface CwTagProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwTag`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwTag({ children, className, ...rest }: CwTagProps & Record<string, unknown>) {
  return (
    <div data-cw="CwTag" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwTag
