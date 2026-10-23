export const assistantActionsBase = {
  root: 'group/asst-footer flex w-full min-w-0 max-w-full items-center justify-between gap-4 pt-2',
  /**
   * hover 消息底部操作区才显示（仅 fine pointer；触屏常显）。
   * 不要用 group-hover/msg：整条长回复顶部移入也会把底栏带出来。
   */
  rootRevealOnHover:
    'transition-opacity duration-150 [@media(pointer:fine)]:opacity-0 [@media(pointer:fine)]:hover:opacity-100 [@media(pointer:fine)]:focus-within:opacity-100 [@media(pointer:fine)]:group-[.is-asst-footer-hot]/msg:opacity-100',
  leftGroup: 'flex min-w-0 flex-1 flex-wrap items-center gap-4',
  rightGroup: 'ml-auto flex shrink-0 items-center justify-end',
  actionIcon:
    'inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[var(--text-color-primary)] outline-none transition-colors duration-150 hover:text-[var(--brand-color-6)] active:text-[var(--brand-color-6)] focus-visible:text-[var(--brand-color-6)] disabled:cursor-not-allowed disabled:opacity-45',
  actionIconActive:
    'text-[var(--brand-color-6)] hover:text-[var(--brand-color-6)] active:text-[var(--brand-color-6)]',
} as const

export const cwChatMessageAssistantActionIconStyles = {
  size: 1.25,
  class: 'inline-flex items-center justify-center',
} as const

/** 与 CwChatMessageCellAssistantActions 操作按钮一致的 class（如 assistantShare slot） */
export const CW_CHAT_MESSAGE_ASSISTANT_ACTIONS_ACTION_ICON_CLASS =
  assistantActionsBase.actionIcon
