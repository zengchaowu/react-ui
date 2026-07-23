import type { ReactNode } from 'react'

export interface CwConfirmDialogProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwConfirmDialog`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwConfirmDialog({ children, className, ...rest }: CwConfirmDialogProps & Record<string, unknown>) {
  return (
    <div data-cw="CwConfirmDialog" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwConfirmDialog
