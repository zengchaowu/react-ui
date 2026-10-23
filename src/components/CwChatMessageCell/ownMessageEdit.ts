import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'

/** Cursor / workspace：己方纯文本/Markdown 可在描边气泡内原地编辑 */
export function isWorkspaceOwnMessageEditable(message: ChatMessage): boolean {
  if (!message.isOwn) return false
  if (message.status === 'sending') return false
  if (message.inlineUploading) return false
  if ((message.inlineAttachmentCount ?? 0) > 0) return false
  return message.type === 'text' || message.type === 'markdown'
}

export function hasNonCollapsedTextSelection(): boolean {
  if (typeof window === 'undefined') return false
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return false
  return sel.toString().trim().length > 0
}
