import type { HTMLAttributes, ReactNode } from 'react'
import type { CwFloatingWindowShellProps } from '@zengchaowu/ui-shared/components/CwFloatingWindowShell/types'
import './cw-floating-window-shell.css'

export interface CwFloatingWindowShellComponentProps
  extends CwFloatingWindowShellProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: ReactNode
}

export function CwFloatingWindowShell({
  maximized = false,
  minimized = false,
  noTransition = false,
  gestureActive = false,
  children,
  className,
  ...rest
}: CwFloatingWindowShellComponentProps) {
  return (
    <div
      {...rest}
      className={['cw-floating-window', className].filter(Boolean).join(' ')}
      data-maximized={maximized || undefined}
      data-minimized={minimized || undefined}
      data-no-transition={noTransition || undefined}
      data-gesture={gestureActive || undefined}
    >
      {children}
    </div>
  )
}

export default CwFloatingWindowShell
