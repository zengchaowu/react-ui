import {
  chatMessageBodyTextClass,
  chatMessageSecondaryTextClass,
} from '../CwChatMessageCell/chatMessageTypography'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const forwardBundleBase = {
  bodyInner:
    `box-border flex min-w-0 cursor-pointer select-text flex-col gap-1 px-3 py-2.5 text-left outline-none ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  title:
    `line-clamp-2 min-w-0 break-words ${chatMessageBodyTextClass} font-medium leading-snug text-[var(--text-color-primary)]`,
  line:
    `min-w-0 line-clamp-1 break-words ${chatMessageSecondaryTextClass} text-[var(--text-color-secondary)]`,
}
