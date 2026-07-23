import type { ReactNode } from 'react'

export interface CwDesignEditorShellProps {
  children?: ReactNode
  className?: string
}

/**
 * Scaffold stub — port from vue-ui `CwDesignEditorShell`.
 * Directory/types/styles aligned; implement behavior in a follow-up batch.
 */
export function CwDesignEditorShell({ children, className, ...rest }: CwDesignEditorShellProps & Record<string, unknown>) {
  return (
    <div data-cw="CwDesignEditorShell" className={className} {...rest}>
      {children}
    </div>
  )
}

export default CwDesignEditorShell
