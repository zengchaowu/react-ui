import type { ReactNode } from 'react'

export interface CwImagePreviewProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwImagePreview`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwImagePreview({ children, className, ...rest }: CwImagePreviewProps & Record<string, unknown>) {
  return (
    <div data-cw="CwImagePreview" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwImagePreview
