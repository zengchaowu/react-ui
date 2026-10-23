import type { KeyboardEvent, MouseEvent } from 'react'
import {
  IM_RICH_LABEL_ATTR,
  IM_RICH_MENTION_ATTR,
  IM_RICH_USER_ID_ATTR,
} from '@zengchaowu/shared/functions/im/imRichContentHtml'
import CwAvatar from '../CwAvatar/CwAvatar'
import { CW_CHAT_AVATAR_PROPS } from '../CwAvatar/cwAvatarPresets'
import CwTooltip from '../CwTooltip/CwTooltip'
import {
  READONLY_BUBBLE_MENTION_CHIP_INNER_CLASS,
  USER_MENTION_CHIP_HOVER_WRAP_CLASS,
} from './chipStyles'
import type { CwImMentionProfileClickPayload } from './mentionProfile.types'

export interface CwChatMentionInlineClipProps {
  userId: string
  label: string
  tooltipEnabled?: boolean
  avatar?: string
  avatarFallbackSrc?: string
  profileClickable?: boolean
  /** 等价 Vue `@profile-click` */
  onProfileClick?: (payload: CwImMentionProfileClickPayload) => void
}

export function CwChatMentionInlineClip({
  userId,
  label,
  tooltipEnabled = false,
  avatar,
  avatarFallbackSrc,
  profileClickable = true,
  onProfileClick,
}: CwChatMentionInlineClipProps) {
  const displayText = (() => {
    const body = label.trim() || userId.trim()
    return body ? `@${body}` : '@'
  })()

  /** wire attrs 与 `.cw-im-mention` 同节点，便于划选 `rangeCoversNodeContents` 判定完整 chip */
  const mentionWireAttrs: Record<string, string> = {
    [IM_RICH_MENTION_ATTR]: '',
    [IM_RICH_USER_ID_ATTR]: userId.trim(),
    [IM_RICH_LABEL_ATTR]: label.trim() || userId.trim(),
  }

  const chip = (
    <span
      className={[READONLY_BUBBLE_MENTION_CHIP_INNER_CLASS, 'mx-0.5 align-middle']
        .filter(Boolean)
        .join(' ')}
      {...mentionWireAttrs}
    >
      {displayText}
    </span>
  )

  function onChipClick(e?: MouseEvent | KeyboardEvent) {
    if (!profileClickable) return
    e?.preventDefault()
    e?.stopPropagation()
    const trimmedUserId = userId.trim()
    if (!trimmedUserId) return
    onProfileClick?.({
      userId: trimmedUserId,
      label,
      ...(avatar?.trim() ? { avatar: avatar.trim() } : {}),
    })
  }

  if (tooltipEnabled && avatarFallbackSrc?.trim()) {
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
            {chip}
          </span>
        }
      >
        <div className="flex min-w-0 max-w-full items-center gap-2 py-0.5">
          <CwAvatar
            src={avatar}
            fallbackSrc={avatarFallbackSrc.trim()}
            text={label}
            {...CW_CHAT_AVATAR_PROPS}
            size={1.75}
            className="inline-flex shrink-0"
            texts={{ defaultAlt: label }}
          />
          <span className="min-w-0 truncate text-sm font-medium leading-snug text-[var(--inverse-surface-fg)]">
            {label}
          </span>
        </div>
      </CwTooltip>
    )
  }

  return chip
}

export default CwChatMentionInlineClip
