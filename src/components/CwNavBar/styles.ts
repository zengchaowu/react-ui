import type { CwNavBarAppearance, CwNavBarStyles } from './types'

/** 栏内行布局骨架；组件会始终附加 */
export const navBarInnerStructure =
  'relative flex min-w-0 items-center gap-1'

export const navBarBase: CwNavBarStyles = {
  root: 'cw-nav-bar relative isolate z-[var(--z-index-above)] min-w-0 shrink-0',
  bordered: 'hairline-border-b border-[var(--border-color)]',
  inner: navBarInnerStructure,
  innerCompact: 'h-10 px-2',
  innerComfortable: 'h-12 px-4',
  titleOverlay:
    'pointer-events-none absolute inset-0 z-[var(--z-index-above)] flex min-w-0 items-center justify-center overflow-hidden px-10',
  left: 'relative z-[var(--z-index-above-high)] flex shrink-0 items-center justify-start min-w-0',
  center: 'relative z-[var(--z-index-above-high)] min-w-0 flex-1 flex items-center justify-center truncate',
  right:
    'relative z-[var(--z-index-above-high)] ml-auto flex shrink-0 items-center justify-end min-w-0',
  title:
    'block max-w-full truncate text-center [font-size:var(--chat-conversation-title-font-size)] leading-snug text-[var(--text-color-primary)]',
  iconButton:
    'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--text-color-secondary)] transition-colors hover:bg-[var(--bg-color-component-hover)]',
  textButton:
    'inline-flex h-8 shrink-0 items-center rounded-md px-1.5 text-sm leading-none transition-colors hover:bg-[var(--bg-color-component-hover)]',
}

/** 栏内图标按钮（default 外观 secondary 色） */
export const CW_NAV_BAR_ICON_BUTTON_CLASS = navBarBase.iconButton

/** 栏内文字操作钮 */
export const CW_NAV_BAR_TEXT_BUTTON_CLASS = navBarBase.textButton

/**
 * IM 顶栏图标按钮：与标题同色（勿复用 default iconButton，其 secondary 色会压过 primary）
 */
export const CW_NAV_BAR_CHAT_ICON_BUTTON_CLASS = [
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
  'text-[var(--text-color-primary)]',
  'transition-colors hover:bg-[var(--bg-color-component-hover)]',
].join(' ')

export const appearanceStyles: Record<
  CwNavBarAppearance,
  Partial<CwNavBarStyles> & { innerExtra?: string }
> = {
  default: {},
  emphasized: {
    title:
      'block max-w-full truncate text-center [font-size:var(--chat-conversation-title-font-size)] leading-snug text-[var(--text-color-primary)]',
    iconButton: CW_NAV_BAR_CHAT_ICON_BUTTON_CLASS,
    innerExtra: 'gap-1 px-1',
  },
  'full-width': {
    root: [
      'cw-nav-bar relative isolate z-[var(--z-index-above)] flex w-full min-w-0 shrink-0 flex-col',
      'bg-[var(--bg-color-container)] py-1.5',
    ].join(' '),
    bordered: 'hairline-border-b border-[var(--border-color)]',
    innerCompact: 'h-10 w-full min-w-0 px-1.5',
  },
}
