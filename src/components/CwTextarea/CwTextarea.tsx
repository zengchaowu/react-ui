import type { ReactNode } from 'react'

export interface CwTextareaProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwTextarea`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwTextarea({ children, className, ...rest }: CwTextareaProps & Record<string, unknown>) {
  return (
    <div data-cw="CwTextarea" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwTextarea
