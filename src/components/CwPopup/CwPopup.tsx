import type { ReactNode } from 'react'

export interface CwPopupProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwPopup`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwPopup({ children, className, ...rest }: CwPopupProps & Record<string, unknown>) {
  return (
    <div data-cw="CwPopup" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwPopup
