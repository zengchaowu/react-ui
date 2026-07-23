import type { ReactNode } from 'react'

export interface TpOfficePreviewProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `TpOfficePreview`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function TpOfficePreview({ children, className, ...rest }: TpOfficePreviewProps & Record<string, unknown>) {
  return (
    <div data-cw="TpOfficePreview" className={className} {...rest}>
      {children}
    </div>
  )
}

export default TpOfficePreview
