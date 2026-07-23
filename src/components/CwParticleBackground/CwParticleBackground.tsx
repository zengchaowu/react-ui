import type { ReactNode } from 'react'

export interface CwParticleBackgroundProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwParticleBackground`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwParticleBackground({ children, className, ...rest }: CwParticleBackgroundProps & Record<string, unknown>) {
  return (
    <div data-cw="CwParticleBackground" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwParticleBackground
