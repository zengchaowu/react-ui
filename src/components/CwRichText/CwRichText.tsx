import type { ReactNode } from 'react'

export interface CwRichTextProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwRichText`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwRichText({ children, className, ...rest }: CwRichTextProps & Record<string, unknown>) {
  return (
    <div data-cw="CwRichText" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwRichText
