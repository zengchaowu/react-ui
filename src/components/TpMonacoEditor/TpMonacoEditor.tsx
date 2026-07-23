import type { ReactNode } from 'react'

export interface TpMonacoEditorProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `TpMonacoEditor`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function TpMonacoEditor({ children, className, ...rest }: TpMonacoEditorProps & Record<string, unknown>) {
  return (
    <div data-cw="TpMonacoEditor" className={className} {...rest}>
      {children}
    </div>
  )
}

export default TpMonacoEditor
