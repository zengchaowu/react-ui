import type { ReactNode } from 'react'

export interface CwEditableTextProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwEditableText`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwEditableText({ children, className, ...rest }: CwEditableTextProps & Record<string, unknown>) {
  return (
    <div data-cw="CwEditableText" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwEditableText
