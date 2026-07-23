import type { ReactNode } from 'react'

export interface TpFabricDesignEditorProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `TpFabricDesignEditor`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function TpFabricDesignEditor({ children, className, ...rest }: TpFabricDesignEditorProps & Record<string, unknown>) {
  return (
    <div data-cw="TpFabricDesignEditor" className={className} {...rest}>
      {children}
    </div>
  )
}

export default TpFabricDesignEditor
