import type { ReactNode } from 'react'

export interface TpTipTapEditorProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `TpTipTapEditor`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function TpTipTapEditor({ children, className, ...rest }: TpTipTapEditorProps & Record<string, unknown>) {
  return (
    <div data-cw="TpTipTapEditor" className={className} {...rest}>
      {children}
    </div>
  )
}

export default TpTipTapEditor
