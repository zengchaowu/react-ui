import type { ReactNode } from 'react'

export interface CwTooltipProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwTooltip`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwTooltip({ children, className, ...rest }: CwTooltipProps & Record<string, unknown>) {
  return (
    <div data-cw="CwTooltip" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwTooltip
