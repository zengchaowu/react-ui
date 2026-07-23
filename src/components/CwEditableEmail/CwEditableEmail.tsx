import type { ReactNode } from 'react'

export interface CwEditableEmailProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwEditableEmail`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwEditableEmail({ children, className, ...rest }: CwEditableEmailProps & Record<string, unknown>) {
  return (
    <div data-cw="CwEditableEmail" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwEditableEmail
