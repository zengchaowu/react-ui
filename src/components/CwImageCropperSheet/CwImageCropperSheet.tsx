import type { ReactNode } from 'react'

export interface CwImageCropperSheetProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwImageCropperSheet`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwImageCropperSheet({ children, className, ...rest }: CwImageCropperSheetProps & Record<string, unknown>) {
  return (
    <div data-cw="CwImageCropperSheet" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwImageCropperSheet
