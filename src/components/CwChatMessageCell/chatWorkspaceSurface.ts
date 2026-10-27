/**
 * Cursor / workspace 聊天表面 token（与 vue-ui `components/chatWorkspaceSurface.ts` 对齐）。
 */

export const CW_WORKSPACE_CHAT_INSET_PAD = 'p-2.5'
export const CW_WORKSPACE_CHAT_INSET_PAD_X = 'px-2.5'
export const CW_WORKSPACE_CHAT_RADIUS = 'rounded-2xl'

/** 己方描边气泡：默认一点点灰底；悬停透明（编辑态由 OwnEdit 单独透明） */
export const CW_WORKSPACE_OWN_OUTLINED_BUBBLE = [
  'border',
  'border-[var(--chat-message-bubble-own-border)]',
  'bg-[color-mix(in_srgb,var(--text-color-primary)_0.5%,transparent)]',
  'text-[var(--text-color-primary)]',
  'shadow-none',
  'transition-[border-color,background-color] duration-150 ease-out',
  'hover:border-[var(--border-color-emphasis)]',
  'hover:bg-transparent',
  'group-hover/own-bubble:border-[var(--border-color-emphasis)]',
  'group-hover/own-bubble:bg-transparent',
].join(' ')
