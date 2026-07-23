import type { ReactNode } from 'react'

export interface CwImageCropperProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwImageCropper`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwImageCropper({ children, className, ...rest }: CwImageCropperProps & Record<string, unknown>) {
  return (
    <div data-cw="CwImageCropper" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwImageCropper
