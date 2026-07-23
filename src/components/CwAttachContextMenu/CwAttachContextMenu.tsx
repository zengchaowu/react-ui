import type { ReactNode } from 'react'

export interface CwAttachContextMenuProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwAttachContextMenu`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwAttachContextMenu({ children, className, ...rest }: CwAttachContextMenuProps & Record<string, unknown>) {
  return (
    <div data-cw="CwAttachContextMenu" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwAttachContextMenu
