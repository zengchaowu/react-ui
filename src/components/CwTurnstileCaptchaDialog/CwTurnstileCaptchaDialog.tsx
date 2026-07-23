import type { ReactNode } from 'react'

export interface CwTurnstileCaptchaDialogProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwTurnstileCaptchaDialog`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwTurnstileCaptchaDialog({ children, className, ...rest }: CwTurnstileCaptchaDialogProps & Record<string, unknown>) {
  return (
    <div data-cw="CwTurnstileCaptchaDialog" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwTurnstileCaptchaDialog
