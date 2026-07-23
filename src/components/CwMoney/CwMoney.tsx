import type { ReactNode } from 'react'

export interface CwMoneyProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwMoney`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwMoney({ children, className, ...rest }: CwMoneyProps & Record<string, unknown>) {
  return (
    <div data-cw="CwMoney" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwMoney
