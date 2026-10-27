import { useMemo } from 'react'
import { defaultCwChatShellConnDotStyles } from '@zengchaowu/ui-shared/components/CwChatShell/styles'
import type { CwChatShellConnDotProps } from './types'

export function CwChatShellConnDot({
  state = 'muted',
  tabbar = true,
  title = '',
}: CwChatShellConnDotProps) {
  const s = defaultCwChatShellConnDotStyles

  const stateClass = useMemo(() => {
    switch (state) {
      case 'connected':
        return s.stateConnected
      case 'connecting':
        return s.stateConnecting
      case 'disconnected':
        return s.stateDisconnected
      default:
        return s.stateMuted
    }
  }, [state, s])

  const rootClassList = useMemo(
    () => [s.root, tabbar && s.rootTabbar, stateClass].filter(Boolean).join(' '),
    [s, tabbar, stateClass],
  )

  return <span className={rootClassList} title={title} />
}

export default CwChatShellConnDot
