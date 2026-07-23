import type { ReactNode } from 'react'

export interface CwContextMenuProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwContextMenu`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwContextMenu({ children, className, ...rest }: CwContextMenuProps & Record<string, unknown>) {
  return (
    <div data-cw="CwContextMenu" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwContextMenu
