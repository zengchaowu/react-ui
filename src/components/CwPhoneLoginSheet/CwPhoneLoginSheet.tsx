import type { ReactNode } from 'react'

export interface CwPhoneLoginSheetProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwPhoneLoginSheet`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwPhoneLoginSheet({ children, className, ...rest }: CwPhoneLoginSheetProps & Record<string, unknown>) {
  return (
    <div data-cw="CwPhoneLoginSheet" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwPhoneLoginSheet
