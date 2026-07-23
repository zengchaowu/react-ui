import type { ReactNode } from 'react'

export interface CwToastProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwToast`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwToast({ children, className, ...rest }: CwToastProps & Record<string, unknown>) {
  return (
    <div data-cw="CwToast" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwToast
