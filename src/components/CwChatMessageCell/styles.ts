import type { CwChatMessageCellStyles } from './types'
import { CHAT_BUBBLE_MAX_WIDTH_CLASS } from './chatMessageBubbleLayout'
import { chatMessageFooterMetaTextClass } from './chatMessageTypography'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

/** 己方发送态 tooltip：`appearance="inline"` */
export const CW_CHAT_OWN_OUTBOUND_STATUS_TOOLTIP_APPEARANCE = 'inline' as const

export const messageCellBase: CwChatMessageCellStyles = {
  row: 'cw-chat-message-cell flex w-full flex-col gap-1',
  /** 发送态 + 气泡同一行；默认 w-fit，与气泡贴紧（微信式） */
  ownOutboundRow:
    'flex w-fit max-w-full min-w-0 flex-row items-center gap-1',
  ownOutboundStatusSlot:
    'flex shrink-0 items-center justify-center',
  meta:
    `${CHAT_BUBBLE_MAX_WIDTH_CLASS} ${chatMessageFooterMetaTextClass}`,
  metaOwn: 'text-right',
  metaPeer: 'text-left',
  inlineAttachmentMetaBtn:
    `mr-1 inline-flex items-center gap-0.5 rounded border-0 bg-transparent p-0 font-medium text-[var(--brand-color-6)] outline-none hover:text-[var(--brand-color-hover)] ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
}
