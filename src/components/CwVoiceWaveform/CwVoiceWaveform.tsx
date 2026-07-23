import type { ReactNode } from 'react'

export interface CwVoiceWaveformProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwVoiceWaveform`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwVoiceWaveform({ children, className, ...rest }: CwVoiceWaveformProps & Record<string, unknown>) {
  return (
    <div data-cw="CwVoiceWaveform" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwVoiceWaveform
