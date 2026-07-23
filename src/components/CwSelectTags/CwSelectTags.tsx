import type { ReactNode } from 'react'

export interface CwSelectTagsProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwSelectTags`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwSelectTags({ children, className, ...rest }: CwSelectTagsProps & Record<string, unknown>) {
  return (
    <div data-cw="CwSelectTags" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwSelectTags
