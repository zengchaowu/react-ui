import type { ReactNode } from 'react'

export interface CwAvatarProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwAvatar`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwAvatar({ children, className, ...rest }: CwAvatarProps & Record<string, unknown>) {
  return (
    <div data-cw="CwAvatar" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwAvatar
