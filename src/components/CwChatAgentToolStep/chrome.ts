import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const AGENT_TOOL_SHIMMER_LABEL_CLASS = 'cw-agent-tool-shimmer-label'
export const AGENT_TOOL_SHIMMER_LABEL_ACTIVE_CLASS = 'cw-agent-tool-shimmer-label--active'

export const AGENT_TOOL_CHEVRON_SIZE = 0.625
export const AGENT_TOOL_STATUS_ICON_SIZE = 0.75

export const agentToolHeaderChevronClass =
  'shrink-0 text-[var(--text-color-placeholder)] transition-[opacity,transform] duration-150 [@media(pointer:fine)]:opacity-0 [@media(pointer:fine)]:group-hover:opacity-100 [@media(pointer:fine)]:group-focus-visible:opacity-100'

export const agentToolHeaderChevronExpandedClass = 'rotate-90'

/** 命令卡折叠时 stdout/stderr 最多约 4 行（caption × leading-snug × 4） */
export const agentToolTerminalOutputCollapsedClass =
  'max-h-[4.125rem] overflow-hidden overscroll-none'

/** 展开后由外层统一滚动 */
export const agentToolTerminalOutputExpandedClass =
  'max-h-52 overflow-y-auto overscroll-y-contain'

/** 悬浮在输出区底部，fine pointer 设备上 hover 卡片时显示，触控设备默认可见可点 */
export const agentToolTerminalHoverToggleClass =
  `absolute inset-x-0 bottom-0 z-[var(--z-index-above)] flex justify-center pb-0.5 transition-opacity duration-150 [@media(pointer:fine)]:pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto [@media(pointer:fine)]:opacity-0 [@media(pointer:fine)]:group-hover:opacity-100 [@media(pointer:fine)]:group-focus-within:opacity-100`

export const agentToolTerminalHoverToggleButtonClass =
  `flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 outline-none ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`

export const agentToolTerminalHoverChevronClass =
  'shrink-0 text-[var(--text-color-placeholder)] transition-colors duration-150 group-hover:text-[var(--text-color-secondary)] hover:!text-[var(--text-color-primary)]'

/** 折叠态可见行数上限，与 agentToolTerminalOutputCollapsedClass 一致 */
export const AGENT_TOOL_TERMINAL_COLLAPSED_MAX_LINES = 4
