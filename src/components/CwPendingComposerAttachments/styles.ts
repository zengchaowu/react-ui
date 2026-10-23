import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

/** 与 CwChatMessageComposer 待发区同一套样式（宽窄屏共用） */
export const pendingComposerAttachmentStyles = {
  root: 'w-full min-w-0 shrink-0 overflow-x-auto px-3 pb-1.5 pt-1.5',
  rootCompact: 'w-full min-w-0 shrink-0 overflow-x-auto px-1.5 pb-1.5 pt-1.5',
  inner: 'flex w-max max-w-none flex-nowrap items-start gap-1.5',
  rasterFrame: `relative block h-9 w-9 cursor-pointer overflow-hidden rounded-md bg-[var(--bg-color-component)] outline-none ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  rasterImg: 'h-full w-full object-cover',
  fileCard: `relative flex h-9 w-[var(--size-pending-file-card)] cursor-pointer items-center gap-1 overflow-hidden rounded-md bg-[var(--bg-color-component)] px-1.5 outline-none ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  fileCardIconWrap:
    'flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden',
  fileCardMeta: 'flex min-w-0 flex-1 flex-col justify-center gap-0.5',
  fileCardTitle:
    'min-w-0 truncate [font-size:var(--font-size-xs)] font-medium leading-none text-[var(--text-color-primary)]',
  fileCardSize:
    'min-w-0 truncate [font-size:var(--font-size-xs)] leading-none text-[var(--text-color-secondary)]',
} as const
