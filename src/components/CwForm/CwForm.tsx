import type { ReactNode } from 'react'

export interface CwFormProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwForm`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwForm({ children, className, ...rest }: CwFormProps & Record<string, unknown>) {
  return (
    <div data-cw="CwForm" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwForm
