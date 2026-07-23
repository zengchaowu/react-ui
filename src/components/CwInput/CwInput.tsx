import type { ReactNode } from 'react'

export interface CwInputProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwInput`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwInput({ children, className, ...rest }: CwInputProps & Record<string, unknown>) {
  return (
    <div data-cw="CwInput" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwInput
