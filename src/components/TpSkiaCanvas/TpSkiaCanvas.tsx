import type { ReactNode } from 'react'

export interface TpSkiaCanvasProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `TpSkiaCanvas`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function TpSkiaCanvas({ children, className, ...rest }: TpSkiaCanvasProps & Record<string, unknown>) {
  return (
    <div data-cw="TpSkiaCanvas" className={className} {...rest}>
      {children}
    </div>
  )
}

export default TpSkiaCanvas
