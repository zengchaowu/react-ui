import type { ReactNode } from 'react'

export interface CwUnlockLoginDialogProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwUnlockLoginDialog`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwUnlockLoginDialog({ children, className, ...rest }: CwUnlockLoginDialogProps & Record<string, unknown>) {
  return (
    <div data-cw="CwUnlockLoginDialog" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwUnlockLoginDialog
