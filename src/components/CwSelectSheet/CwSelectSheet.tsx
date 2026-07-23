import type { ReactNode } from 'react'

export interface CwSelectSheetProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwSelectSheet`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwSelectSheet({ children, className, ...rest }: CwSelectSheetProps & Record<string, unknown>) {
  return (
    <div data-cw="CwSelectSheet" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwSelectSheet
