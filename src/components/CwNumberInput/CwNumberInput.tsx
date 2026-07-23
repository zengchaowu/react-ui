import type { ReactNode } from 'react'

export interface CwNumberInputProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwNumberInput`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwNumberInput({ children, className, ...rest }: CwNumberInputProps & Record<string, unknown>) {
  return (
    <div data-cw="CwNumberInput" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwNumberInput
