import CwChatShellTabIcon from './CwChatShellTabIcon'
import CwChatShellConnDot from './CwChatShellConnDot'
import CwLoading from '../CwLoading/CwLoading'
import type { CwChatShellTabbarIconProps } from './types'
import { CW_CHAT_SHELL_DEFAULT_AVATAR_SRC } from './constants'

export function CwChatShellTabbarIcon({
  item,
  active,
  iconStyles,
  mineAvatarSrc = '',
  mineAvatarText = '我',
  mineAvatarFallbackSrc = CW_CHAT_SHELL_DEFAULT_AVATAR_SRC,
  mineAvatarSize,
  mineAvatarLoading = false,
  connDotState = 'muted',
  connDotTitle = '预览：未连接实时通道',
  showConnDot = true,
}: CwChatShellTabbarIconProps) {
  return (
    <CwChatShellTabIcon
      item={item}
      active={active}
      iconStyles={iconStyles}
      mineAvatarSrc={mineAvatarSrc}
      mineAvatarText={mineAvatarText}
      mineAvatarFallbackSrc={mineAvatarFallbackSrc}
      mineAvatarSize={mineAvatarSize}
      avatarBadgeSlot={
        showConnDot ? (
          <CwChatShellConnDot state={connDotState} title={connDotTitle} tabbar />
        ) : undefined
      }
      avatarOverlaySlot={
        mineAvatarLoading ? <CwLoading type="spinner" size="small" /> : undefined
      }
    />
  )
}

export default CwChatShellTabbarIcon
