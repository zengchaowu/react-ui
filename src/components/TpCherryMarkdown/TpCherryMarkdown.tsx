import type { ReactNode } from 'react'

export interface TpCherryMarkdownProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `TpCherryMarkdown`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function TpCherryMarkdown({ children, className, ...rest }: TpCherryMarkdownProps & Record<string, unknown>) {
  return (
    <div data-cw="TpCherryMarkdown" className={className} {...rest}>
      {children}
    </div>
  )
}

export default TpCherryMarkdown
