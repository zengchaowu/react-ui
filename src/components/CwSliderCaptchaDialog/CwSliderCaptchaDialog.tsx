import type { ReactNode } from 'react'

export interface CwSliderCaptchaDialogProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwSliderCaptchaDialog`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwSliderCaptchaDialog({ children, className, ...rest }: CwSliderCaptchaDialogProps & Record<string, unknown>) {
  return (
    <div data-cw="CwSliderCaptchaDialog" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwSliderCaptchaDialog
