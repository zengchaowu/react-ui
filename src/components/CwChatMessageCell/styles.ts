import type { CwTooltipStyles } from '../CwTooltip/types'
import type { CwChatMessageCellStyles } from './types'
import { chatMessageFooterMetaTextClass } from './chatMessageTypography'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '../../utils/focusStyles'

/** 己方发送态 tooltip：`appearance="inline"` */
export const CW_CHAT_OWN_OUTBOUND_STATUS_TOOLTIP_APPEARANCE = 'inline' as const

/** @deprecated 使用 appearance=`inline` */
export const CW_CHAT_OWN_OUTBOUND_STATUS_TOOLTIP_STYLES = {
  root: 'inline-flex w-auto max-w-none shrink-0 items-center justify-center',
}

export const defaultCwChatMessageCellStyles: CwChatMessageCellStyles = {
  row: 'cw-chat-message-cell flex w-full flex-col gap-1',
  /** 发送态 + 气泡同一行、贴紧排列（微信式） */
  ownOutboundRow:
    'flex min-w-0 max-w-full flex-row items-center justify-end gap-1',
  ownOutboundStatusSlot:
    'flex shrink-0 items-center justify-center',
  meta:
    `max-w-full md:max-w-[66.666667%] px-1 ${chatMessageFooterMetaTextClass}`,
  metaOwn: 'text-right',
  metaPeer: 'text-left',
  inlineAttachmentMetaBtn:
    `mr-1 inline-flex items-center gap-0.5 rounded border-0 bg-transparent p-0 font-medium text-[var(--brand-color-6)] outline-none hover:text-[var(--brand-color-hover)] ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
}
