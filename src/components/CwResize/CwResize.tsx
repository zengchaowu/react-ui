import type { ReactNode } from 'react'

export interface CwResizeProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwResize`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwResize({ children, className, ...rest }: CwResizeProps & Record<string, unknown>) {
  return (
    <div data-cw="CwResize" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwResize
