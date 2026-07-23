import type { ReactNode } from 'react'

export interface TpCodeEditorProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `TpCodeEditor`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function TpCodeEditor({ children, className, ...rest }: TpCodeEditorProps & Record<string, unknown>) {
  return (
    <div data-cw="TpCodeEditor" className={className} {...rest}>
      {children}
    </div>
  )
}

export default TpCodeEditor
