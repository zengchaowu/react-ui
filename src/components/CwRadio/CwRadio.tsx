import type { ReactNode } from 'react'

export interface CwRadioProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwRadio`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwRadio({ children, className, ...rest }: CwRadioProps & Record<string, unknown>) {
  return (
    <div data-cw="CwRadio" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwRadio
