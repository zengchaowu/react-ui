import type { ReactNode } from 'react'

export interface CwPhoneLoginDialogProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwPhoneLoginDialog`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwPhoneLoginDialog({ children, className, ...rest }: CwPhoneLoginDialogProps & Record<string, unknown>) {
  return (
    <div data-cw="CwPhoneLoginDialog" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwPhoneLoginDialog
