import type { ReactNode } from 'react'

export interface CwProfileUploaderProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwProfileUploader`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwProfileUploader({ children, className, ...rest }: CwProfileUploaderProps & Record<string, unknown>) {
  return (
    <div data-cw="CwProfileUploader" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwProfileUploader
