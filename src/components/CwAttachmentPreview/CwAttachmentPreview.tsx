import type { ReactNode } from 'react'

export interface CwAttachmentPreviewProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwAttachmentPreview`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwAttachmentPreview({ children, className, ...rest }: CwAttachmentPreviewProps & Record<string, unknown>) {
  return (
    <div data-cw="CwAttachmentPreview" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwAttachmentPreview
