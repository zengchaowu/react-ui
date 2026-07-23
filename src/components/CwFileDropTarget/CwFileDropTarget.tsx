import type { ReactNode } from 'react'

export interface CwFileDropTargetProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwFileDropTarget`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwFileDropTarget({ children, className, ...rest }: CwFileDropTargetProps & Record<string, unknown>) {
  return (
    <div data-cw="CwFileDropTarget" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwFileDropTarget
