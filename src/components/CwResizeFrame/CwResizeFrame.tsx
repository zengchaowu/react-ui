import type { ReactNode } from 'react'

export interface CwResizeFrameProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwResizeFrame`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwResizeFrame({ children, className, ...rest }: CwResizeFrameProps & Record<string, unknown>) {
  return (
    <div data-cw="CwResizeFrame" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwResizeFrame
