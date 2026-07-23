import type { ReactNode } from 'react'

export interface CwIconPickerProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwIconPicker`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwIconPicker({ children, className, ...rest }: CwIconPickerProps & Record<string, unknown>) {
  return (
    <div data-cw="CwIconPicker" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwIconPicker
