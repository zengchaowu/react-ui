import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import CwTooltip from '../../CwTooltip/CwTooltip'
import CwImMentionChipTooltipContent from './CwImMentionChipTooltipContent'
import { USER_MENTION_CHIP_HOVER_WRAP_CLASS } from './chipStyles'
import type { CwImMentionProfileClickPayload } from './mentionProfile.types'

export interface CwImMentionChipWithTooltipProps {
  userId: string
  label: string
  avatar?: string
  avatarFallbackSrc: string
  profileClickable?: boolean
  /** Vue 默认插槽 */
  children?: ReactNode
  /** 等价 Vue `@profile-click` */
  onProfileClick?: (payload: CwImMentionProfileClickPayload) => void
}

export function CwImMentionChipWithTooltip({
  userId,
  label,
  avatar,
  avatarFallbackSrc,
  profileClickable = false,
  children,
  onProfileClick,
}: CwImMentionChipWithTooltipProps) {
  function onChipClick(event?: MouseEvent | KeyboardEvent) {
    if (!profileClickable) return
    event?.preventDefault()
    event?.stopPropagation()
    const trimmedUserId = userId.trim()
    if (!trimmedUserId) return
    onProfileClick?.({
      userId: trimmedUserId,
      label,
      ...(avatar?.trim() ? { avatar: avatar.trim() } : {}),
    })
  }

  return (
    <CwTooltip
      placement="top"
      showDelay={300}
      appearance="mention"
      triggerSlot={
        <span
          className={USER_MENTION_CHIP_HOVER_WRAP_CLASS}
          tabIndex={profileClickable ? 0 : undefined}
          aria-label={profileClickable ? `查看 ${label} 的资料` : undefined}
          onClick={(event) => {
            event.stopPropagation()
            onChipClick(event)
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            event.stopPropagation()
            onChipClick(event)
          }}
        >
          {children}
        </span>
      }
    >
      <CwImMentionChipTooltipContent
        label={label}
        avatar={avatar}
        avatarFallbackSrc={avatarFallbackSrc}
      />
    </CwTooltip>
  )
}

export default CwImMentionChipWithTooltip
