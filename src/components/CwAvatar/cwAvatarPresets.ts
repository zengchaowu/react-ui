import type { CwAvatarProps } from './types'

/** IM 列表/会话/成员格：方角 + `appearance="ring-bordered"` 官方预设 */
export const CW_CHAT_AVATAR_PROPS = {
  shape: 'square',
  appearance: 'ring-bordered',
} as const satisfies Pick<CwAvatarProps, 'shape' | 'appearance'>

/** 与 `CwChatConversationCell` 内会话头像一致（40px @16 → 2.5rem） */
export const CW_CHAT_CONVERSATION_AVATAR_DEFAULT_SIZE = 2.5
