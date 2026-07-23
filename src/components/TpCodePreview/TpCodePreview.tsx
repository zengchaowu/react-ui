import type { ReactNode } from 'react'

export interface TpCodePreviewProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `TpCodePreview`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function TpCodePreview({ children, className, ...rest }: TpCodePreviewProps & Record<string, unknown>) {
  return (
    <div data-cw="TpCodePreview" className={className} {...rest}>
      {children}
    </div>
  )
}

export default TpCodePreview
