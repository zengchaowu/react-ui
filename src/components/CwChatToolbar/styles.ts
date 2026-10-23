import type { CwChatToolbarStyles } from './types'

export const chatToolbarBase: CwChatToolbarStyles = {
  root: 'cw-chat-toolbar flex min-h-0 shrink-0 flex-none flex-wrap items-center gap-1.5 hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-container)] px-2 py-1',
  cluster: 'flex flex-wrap items-center gap-2',
  itemButton:
    'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-[var(--text-color-secondary)] transition-colors hover:bg-[var(--bg-color-component-hover)] hover:text-[var(--brand-color-6)] active:bg-[var(--bg-color-secondarycontainer)] disabled:pointer-events-none disabled:opacity-40',
}
