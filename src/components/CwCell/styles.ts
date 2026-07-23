import type {
  CwCellAppearance,
  CwCellGroupAppearance,
  CwCellGroupStyles,
  CwCellStyles,
} from './types'

export const cellBase: CwCellStyles = {
  root: 'cw-cell relative flex items-center px-4 py-3 bg-[var(--bg-color-container)] transition-colors',
  clickable: 'cursor-pointer active:bg-[var(--bg-color-component-hover)]',
  content: 'flex-1 flex flex-col min-w-0',
  titleRow: 'flex min-w-0 items-center gap-3',
  titleMain: 'min-w-0 flex-1 font-body-medium text-[var(--text-color-primary)]',
  titleRightSlot: 'flex shrink-0 items-center',
  title: 'font-body-medium text-[var(--text-color-primary)]',
  subtitle: 'font-body-small text-[var(--text-color-secondary)] mt-1',
  rightSlot: 'flex items-center ml-4 gap-2',
  arrowIconStyles: {
    root: 'flex items-center justify-center text-[var(--text-color-placeholder)]',
    size: 1.25,
  },
  dividerRoot:
    'cw-cell-underline pointer-events-none absolute bottom-0 left-0 right-0 h-0 hairline-border-b border-solid border-[var(--border-color-hairline)] bg-transparent',
}

/** @deprecated 使用 cellBase */
export const defaultCellStyles = cellBase

export const cellGroupBase: CwCellGroupStyles = {
  root: 'cw-cell-group overflow-hidden [&_>div:last-child_.cw-cell-underline]:hidden',
}

/** @deprecated 使用 cellGroupBase */
export const defaultCellGroupStyles = cellGroupBase

const settingsTitle =
  '[font-size:var(--font-size-body)] font-normal leading-snug text-[var(--text-color-primary)]'
const settingsSubtitle =
  '[font-size:var(--font-size-caption)] font-normal leading-snug text-[var(--text-color-secondary)] mt-0.5'

const conversationManageBg = 'bg-[var(--chat-message-bubble-peer-bg)]'

const conversationManageDividerRoot = [
  'cw-cell-underline pointer-events-none absolute bottom-0 h-0',
  'hairline-border-b border-solid border-[var(--chat-conversation-list-row-divider)] !bg-transparent',
  'left-[1rem] right-[0.75rem]',
].join(' ')

const conversationManageTitle =
  '[font-size:var(--font-size-body)] font-normal leading-snug text-[var(--text-color-primary)]'
const conversationManageSubtitle =
  '[font-size:var(--font-size-xs)] font-normal leading-snug text-[var(--text-color-secondary)] mt-0.5'

export const cellAppearanceStyles: Record<
  CwCellAppearance,
  Partial<CwCellStyles>
> = {
  default: {},
  settings: {
    root: 'cw-cell relative flex items-center px-3 py-2.5 bg-[var(--bg-color-container)] transition-colors',
    title: settingsTitle,
    titleMain: `min-w-0 flex-1 ${settingsTitle}`,
    subtitle: settingsSubtitle,
  },
  fullWidth: {
    root: 'cw-cell relative flex items-center px-4 py-2.5 bg-[var(--bg-color-container)] transition-colors',
  },
  profile: {
    root: 'cw-cell relative flex items-center px-5 py-6 bg-[var(--bg-color-container)] transition-colors',
  },
  conversationManage: {
    root: [
      'cw-cell relative flex items-center px-4 py-2.5 transition-colors',
      conversationManageBg,
    ].join(' '),
    title: conversationManageTitle,
    titleMain: `min-w-0 flex-1 ${conversationManageTitle}`,
    subtitle: conversationManageSubtitle,
    arrowIconStyles: {
      root: 'flex items-center justify-center text-[var(--text-color-placeholder)]',
      size: 1.125,
    },
    dividerRoot: conversationManageDividerRoot,
  },
  sheet: {
    root: 'cw-cell relative flex items-center px-3.5 py-3.5 bg-[var(--bg-color-container)] transition-colors',
    rightSlot: 'flex items-center ml-4 gap-1.5',
  },
  compact: {
    root: 'cw-cell relative flex items-center px-4 py-2 bg-[var(--bg-color-container)] transition-colors',
    content: 'flex-1 min-w-0',
    rightSlot: 'flex items-center ml-2',
  },
  form: {
    root: 'cw-cell relative flex items-center px-4 py-2.5 sm:py-3 bg-[var(--bg-color-container)] transition-colors',
    content: 'max-w-[40%] shrink-0 min-w-0 flex flex-col',
    title: 'text-sm font-normal text-[var(--text-color-secondary)]',
    titleMain:
      'min-w-0 flex-1 text-sm font-normal text-[var(--text-color-secondary)]',
    rightSlot: 'ml-3 flex min-w-0 flex-1 items-center justify-end gap-2',
  },
}

export const cellGroupAppearanceStyles: Record<
  CwCellGroupAppearance,
  Partial<CwCellGroupStyles>
> = {
  default: {},
  settings: {
    root: [
      'cw-cell-group overflow-hidden rounded-lg mx-3 mb-2',
      'bg-[var(--bg-color-container)]',
      '[&_>div:last-child_.cw-cell-underline]:hidden',
    ].join(' '),
  },
  fullWidth: {
    root: [
      'cw-cell-group overflow-hidden mb-2',
      'bg-[var(--bg-color-container)]',
      '[&_>div:last-child_.cw-cell-underline]:hidden',
    ].join(' '),
  },
  conversationManage: {
    root: [
      'cw-cell-group overflow-hidden mb-2',
      conversationManageBg,
      '[&_>div:last-child_.cw-cell-underline]:hidden',
    ].join(' '),
  },
  sheet: {
    root: [
      'cw-cell-group overflow-hidden rounded-xl',
      'bg-[var(--bg-color-container)]',
      '[&_>div:last-child_.cw-cell-underline]:hidden',
    ].join(' '),
  },
}

/** 组 appearance → 默认注入的 cell appearance（default 不注入） */
export const cellGroupDefaultCellAppearance: Partial<
  Record<CwCellGroupAppearance, CwCellAppearance>
> = {
  settings: 'settings',
  fullWidth: 'fullWidth',
  conversationManage: 'conversationManage',
  sheet: 'sheet',
}
