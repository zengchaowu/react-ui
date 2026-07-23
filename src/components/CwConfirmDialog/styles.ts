import type { CwConfirmDialogStyles } from './types'

export const defaultStyles: CwConfirmDialogStyles = {
  /** 内边距由 CwDynamicDialog body 统一提供，此处只排布标题/正文 */
  content: 'flex w-full min-w-0 flex-col',
  /** 仅当 showTitleInContent 时：与顶栏标题同字重层级，略大以区分正文 */
  title: 'text-base font-semibold text-[var(--text-color-primary)] mb-2',
  message: 'mb-4 text-sm leading-relaxed text-[var(--text-color-secondary)]',
  footer: 'flex w-full min-w-0 shrink-0 flex-wrap items-center justify-end gap-2'
}

