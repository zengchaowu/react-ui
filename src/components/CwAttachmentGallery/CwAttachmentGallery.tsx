import type { ReactNode } from 'react'

export interface CwAttachmentGalleryProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwAttachmentGallery`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwAttachmentGallery({ children, className, ...rest }: CwAttachmentGalleryProps & Record<string, unknown>) {
  return (
    <div data-cw="CwAttachmentGallery" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwAttachmentGallery
