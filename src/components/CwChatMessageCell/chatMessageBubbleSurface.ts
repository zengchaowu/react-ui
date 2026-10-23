/** 对端气泡外框（文本 / Markdown / 文件等） */
import {
  chatMessageAssistantBodyTextClass,
  chatMessageBodyTextClass,
} from './chatMessageTypography'
import {
  CW_WORKSPACE_CHAT_INSET_PAD,
  CW_WORKSPACE_CHAT_RADIUS,
  CW_WORKSPACE_OWN_OUTLINED_BUBBLE,
} from './chatWorkspaceSurface'

export const chatPeerBubbleBodyClasses = [
  'border-0',
  'bg-[var(--chat-message-bubble-peer-bg)]',
  'text-[var(--text-color-primary)]',
  'shadow-none',
].join(' ')

/** 无边框/背景的对端气泡（如 AI 助手 Markdown） */
export const chatPeerPlainBubbleBodyClasses =
  'border-0 bg-transparent text-[var(--text-color-primary)] shadow-none'

export interface CwChatMessageBubbleAppearance {
  /** 去掉气泡边框与背景 */
  borderless?: boolean
  /** 去掉气泡内边距（默认 p-2） */
  paddingless?: boolean
  /** 描边己方气泡（Cursor / workspace） */
  outlined?: boolean
}

/** AI 助手 Markdown 默认外观（与 ai-chat `AI_CHAT_ASSISTANT_BUBBLE_APPEARANCE` 一致） */
export const CW_AI_ASSISTANT_BUBBLE_APPEARANCE: CwChatMessageBubbleAppearance = {
  borderless: true,
  paddingless: true,
}

/** Code Workspace / Cursor 风格：己方描边、拉满宽度 */
export const CW_WORKSPACE_OWN_BUBBLE_APPEARANCE: CwChatMessageBubbleAppearance = {
  outlined: true,
}

export function resolveChatPeerBubbleBodyClasses(
  appearance?: CwChatMessageBubbleAppearance,
): string {
  if (appearance?.borderless) return chatPeerPlainBubbleBodyClasses
  return chatPeerBubbleBodyClasses
}

export function resolveChatBubbleContentPaddingClass(
  appearance?: CwChatMessageBubbleAppearance,
): string {
  if (appearance?.paddingless) return ''
  if (appearance?.outlined) return CW_WORKSPACE_CHAT_INSET_PAD
  return 'p-2'
}

/** AI 助手 Markdown：无边框且无内边距（与 `CW_AI_ASSISTANT_BUBBLE_APPEARANCE` 一致） */
export function isAssistantBubbleAppearance(
  appearance?: CwChatMessageBubbleAppearance,
): boolean {
  return !!(appearance?.borderless && appearance?.paddingless)
}

export function resolveChatBubbleTextShellClasses(
  appearance?: CwChatMessageBubbleAppearance,
): string {
  const bodyClass = isAssistantBubbleAppearance(appearance)
    ? chatMessageAssistantBodyTextClass
    : chatMessageBodyTextClass
  const widthClass =
    appearance?.paddingless || appearance?.outlined ? 'w-full' : 'w-fit'
  const radiusClass = appearance?.outlined ? CW_WORKSPACE_CHAT_RADIUS : 'rounded-md'
  return `relative box-border ${widthClass} min-w-0 max-w-full overflow-hidden ${radiusClass} ${bodyClass}`
}

/** 己方气泡底色 */
export const chatOwnBubbleBodyClasses =
  'bg-[var(--chat-message-bubble-own-bg)] text-[var(--text-color-primary)]'

export const chatOwnOutlinedBubbleBodyClasses = CW_WORKSPACE_OWN_OUTLINED_BUBBLE

export function resolveChatOwnBubbleBodyClasses(
  appearance?: CwChatMessageBubbleAppearance,
): string {
  if (appearance?.outlined) return chatOwnOutlinedBubbleBodyClasses
  return chatOwnBubbleBodyClasses
}

export function isOutlinedBubbleAppearance(
  appearance?: CwChatMessageBubbleAppearance,
): boolean {
  return !!appearance?.outlined
}

/** 己方媒体气泡描边（图片 / 文件） */
export const chatOwnMediaBubbleRingClasses =
  'ring-1 ring-[var(--chat-message-bubble-peer-ring)]'

/** 合并转发卡片（对方侧）：白/浅底 + 描边，避免与聊天记录弹窗白底融为一体 */
export const chatForwardBundleCardBodyClasses = [
  'border',
  'border-[var(--border-color)]',
  'bg-[var(--chat-message-card-bg)]',
  'text-[var(--text-color-primary)]',
  'shadow-none',
].join(' ')

/** 合并转发卡片（己方侧） */
export const chatOwnForwardBundleCardBodyClasses = [
  chatOwnBubbleBodyClasses,
  chatOwnMediaBubbleRingClasses,
].join(' ')

/** 气泡正文可选区：显式 ::selection，避免 overflow / chip 样式导致选区不可见 */
export const chatBubbleTextSelectionClasses =
  [
    'select-text cursor-text',
    '[&::selection]:bg-[var(--rich-editor-chip-selection-bg)]',
    '[&::selection]:text-[var(--text-color-primary)]',
    /** emoji / 内联图 clip：选区高亮；与正文一致用文本光标 */
    '[&_.cw-emoji-wrap]:select-text',
    '[&_.cw-emoji-glyph::selection]:bg-[var(--rich-editor-chip-selection-bg)]',
    '[&_.cw-inline-image-clip]:cursor-text',
    '[&_.cw-im-mention]:cursor-text',
  ].join(' ')

/** 移动端长按工具条打开时标记在 `data-cw-chat-message-bubble-body` 上（系统选区常被浮层清掉，用 CSS 保持高亮） */
export const CW_CHAT_MESSAGE_TOOLBAR_ACTIVE_ATTR = 'data-cw-chat-message-toolbar-active'

/** 文本/Markdown 气泡外壳：随内容收缩，上限 max-w-full，长串换行不撑出横向滚动 */
export const chatBubbleTextShellClasses =
  `relative box-border w-fit min-w-0 max-w-full overflow-hidden rounded-md ${chatMessageBodyTextClass}`

/** 气泡正文：保留换行 + 任意位置断词（勿用未进产物的 `break-anywhere`） */
export const chatBubbleTextContentClasses =
  'box-border block min-w-0 max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere]'
