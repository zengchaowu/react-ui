import type { ReactNode } from 'react'

export interface CwFileUploadProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwFileUpload`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwFileUpload({ children, className, ...rest }: CwFileUploadProps & Record<string, unknown>) {
  return (
    <div data-cw="CwFileUpload" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwFileUpload
