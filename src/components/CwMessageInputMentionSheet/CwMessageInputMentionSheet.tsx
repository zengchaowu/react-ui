import type { ReactNode } from 'react'

export interface CwMessageInputMentionSheetProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwMessageInputMentionSheet`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwMessageInputMentionSheet({ children, className, ...rest }: CwMessageInputMentionSheetProps & Record<string, unknown>) {
  return (
    <div data-cw="CwMessageInputMentionSheet" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwMessageInputMentionSheet
