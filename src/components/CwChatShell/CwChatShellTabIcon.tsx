import { useMemo } from 'react'
import CwIcon from '../CwIcon/CwIcon'
import CwAvatar from '../CwAvatar/CwAvatar'
import { CW_CHAT_AVATAR_PROPS } from '@zengchaowu/ui-shared/components/CwAvatar/cwAvatarPresets'
import type { CwChatShellTabIconProps } from './types'
import { CW_CHAT_SHELL_MINE_AVATAR_SIZE } from '@zengchaowu/ui-shared/components/CwChatShell/constants'

export function CwChatShellTabIcon({
  item,
  active,
  iconStyles,
  mineAvatarSrc,
  mineAvatarText,
  mineAvatarFallbackSrc = '',
  mineAvatarSize = CW_CHAT_SHELL_MINE_AVATAR_SIZE,
  minePlaceholderText = '我',
  minePlaceholderClass = '',
  avatarBadgeSlot,
  avatarOverlaySlot,
}: CwChatShellTabIconProps) {
  const resolvedIconName = useMemo(() => {
    if (active && item.iconActiveName) return item.iconActiveName
    return item.iconName || ''
  }, [active, item.iconActiveName, item.iconName])

  if (item.useMineAvatar) {
    return (
      <span
        className={[
          'relative inline-flex shrink-0 overflow-visible rounded-[var(--radius-default)] align-middle leading-none',
          active && 'ring-2 ring-[var(--brand-color-6)]',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {mineAvatarSrc || mineAvatarFallbackSrc || !minePlaceholderText ? (
          <CwAvatar
            {...CW_CHAT_AVATAR_PROPS}
            size={mineAvatarSize}
            className="shrink-0"
            src={mineAvatarSrc}
            fallbackSrc={mineAvatarFallbackSrc}
            text={mineAvatarText}
            texts={{ defaultAlt: '我' }}
            badge={avatarBadgeSlot}
          />
        ) : (
          <span
            className={[
              'flex h-8 w-8 items-center justify-center rounded-[var(--radius-default)] bg-gradient-to-br from-[var(--brand-color-special)] to-[var(--brand-color-6)] text-xs font-semibold text-[var(--text-color-anti)]',
              minePlaceholderClass,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {minePlaceholderText}
          </span>
        )}
        {avatarOverlaySlot ? (
          <span
            className="pointer-events-none absolute left-1/2 top-1/2 z-[var(--z-index-above)] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            aria-hidden="true"
          >
            {avatarOverlaySlot}
          </span>
        ) : null}
      </span>
    )
  }

  if (!resolvedIconName) return null

  return (
    <CwIcon
      name={resolvedIconName}
      prefix="icon"
      mode={item.iconMode}
      size={iconStyles.size ?? 1}
      className={iconStyles.class}
    />
  )
}

export default CwChatShellTabIcon
