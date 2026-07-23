import type { ReactNode } from 'react'

export interface CwImageGalleryProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwImageGallery`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwImageGallery({ children, className, ...rest }: CwImageGalleryProps & Record<string, unknown>) {
  return (
    <div data-cw="CwImageGallery" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwImageGallery
