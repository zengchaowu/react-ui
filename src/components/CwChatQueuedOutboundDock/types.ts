import type { HTMLAttributes } from 'react'

export type CwChatQueuedOutboundItem = {
  clientMessageId: string
  content: string
  attachmentCount?: number
}

export interface CwChatQueuedOutboundDockProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: CwChatQueuedOutboundItem[]
  defaultExpanded?: boolean
  onRemove?: (clientMessageId: string) => void
}
