import CwAvatar from '../../CwAvatar/CwAvatar'
import { CW_CHAT_AVATAR_PROPS } from '../../CwAvatar/cwAvatarPresets'

export interface CwImMentionChipTooltipContentProps {
  label: string
  avatar?: string
  avatarFallbackSrc: string
}

export function CwImMentionChipTooltipContent({
  label,
  avatar,
  avatarFallbackSrc,
}: CwImMentionChipTooltipContentProps) {
  return (
    <div className="flex min-w-0 max-w-full items-center gap-2 py-0.5">
      <CwAvatar
        src={avatar}
        fallbackSrc={avatarFallbackSrc}
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
  )
}

export default CwImMentionChipTooltipContent
