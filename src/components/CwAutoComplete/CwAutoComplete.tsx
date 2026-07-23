import type { ReactNode } from 'react'

export interface CwAutoCompleteProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwAutoComplete`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwAutoComplete({ children, className, ...rest }: CwAutoCompleteProps & Record<string, unknown>) {
  return (
    <div data-cw="CwAutoComplete" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwAutoComplete
