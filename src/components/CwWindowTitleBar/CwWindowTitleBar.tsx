import type { ReactNode } from 'react'

export interface CwWindowTitleBarProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwWindowTitleBar`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwWindowTitleBar({ children, className, ...rest }: CwWindowTitleBarProps & Record<string, unknown>) {
  return (
    <div data-cw="CwWindowTitleBar" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwWindowTitleBar
