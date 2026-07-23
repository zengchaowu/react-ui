import type { ReactNode } from 'react'

export interface CwImageGalleryPreviewProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwImageGalleryPreview`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwImageGalleryPreview({ children, className, ...rest }: CwImageGalleryPreviewProps & Record<string, unknown>) {
  return (
    <div data-cw="CwImageGalleryPreview" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwImageGalleryPreview
