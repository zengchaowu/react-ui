import type { ReactNode } from 'react'

export interface CwFileIconProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwFileIcon`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwFileIcon({ children, className, ...rest }: CwFileIconProps & Record<string, unknown>) {
  return (
    <div data-cw="CwFileIcon" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwFileIcon
