import type { ReactNode } from 'react'

export interface CwMarkdownProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwMarkdown`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwMarkdown({ children, className, ...rest }: CwMarkdownProps & Record<string, unknown>) {
  return (
    <div data-cw="CwMarkdown" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwMarkdown
