import type { CwChatMessageAssistantActionsStyles } from './types'

export const defaultCwChatMessageAssistantActionsStyles: CwChatMessageAssistantActionsStyles =
  {
    root: 'flex w-full min-w-0 max-w-full items-center justify-between gap-4 pt-2',
    leftGroup: 'flex min-w-0 flex-1 flex-wrap items-center gap-4',
    rightGroup: 'ml-auto flex shrink-0 items-center justify-end',
    actionIcon:
      'inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[var(--text-color-primary)] outline-none transition-colors duration-150 hover:text-[var(--brand-color-6)] active:text-[var(--brand-color-6)] focus-visible:text-[var(--brand-color-6)] disabled:cursor-not-allowed disabled:opacity-45',
    actionIconActive:
      'text-[var(--brand-color-6)] hover:text-[var(--brand-color-6)] active:text-[var(--brand-color-6)]',
  }

export const cwChatMessageAssistantActionIconStyles = {
  size: 1.25,
  class: 'inline-flex items-center justify-center',
} as const
