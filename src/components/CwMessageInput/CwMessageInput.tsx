import type { ReactNode } from 'react'

export interface CwMessageInputProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwMessageInput`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwMessageInput({ children, className, ...rest }: CwMessageInputProps & Record<string, unknown>) {
  return (
    <div data-cw="CwMessageInput" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwMessageInput
