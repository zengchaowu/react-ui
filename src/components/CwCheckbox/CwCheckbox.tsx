import type { ReactNode } from 'react'

export interface CwCheckboxProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwCheckbox`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwCheckbox({ children, className, ...rest }: CwCheckboxProps & Record<string, unknown>) {
  return (
    <div data-cw="CwCheckbox" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwCheckbox
