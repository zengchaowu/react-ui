import type { ReactNode } from 'react'

export interface CwSliderProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwSlider`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwSlider({ children, className, ...rest }: CwSliderProps & Record<string, unknown>) {
  return (
    <div data-cw="CwSlider" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwSlider
