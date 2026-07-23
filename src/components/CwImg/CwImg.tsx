import type { ReactNode } from 'react'

export interface CwImgProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwImg`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwImg({ children, className, ...rest }: CwImgProps & Record<string, unknown>) {
  return (
    <div data-cw="CwImg" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwImg
