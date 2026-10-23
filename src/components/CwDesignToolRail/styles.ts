import type { CwDesignToolRailStyles } from './types'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

const toolRailMenuStyles = {
  /** 继承按钮文字色，与主图标同色 */
  dropdownCaret: 'inline-flex shrink-0 items-center justify-center text-current',
}

export const designToolRailSideBase: CwDesignToolRailStyles = {
  root:
    'flex w-11 shrink-0 flex-col overflow-hidden hairline-border-r border-[var(--border-color)] bg-[var(--bg-color-container)] py-1.5',
  leading: 'flex shrink-0 flex-col items-center px-1',
  center: '',
  scroll: 'flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto',
  group: 'flex flex-col items-center gap-0.5 px-1',
  divider: 'mx-auto my-1 h-0 w-6 shrink-0 hairline-border-t border-[var(--border-color)]',
  item:
    `inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-[var(--text-color-primary)] transition-[background-color,color] duration-150 hover:bg-[var(--bg-color-component-hover)] disabled:pointer-events-none disabled:opacity-35 ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  /** ! 避免与 item 的 text-* 在 Tailwind 源码序中互相覆盖，只改背景不改图标色 */
  itemActive:
    'bg-[var(--button-brand-tint-active-bg)] !text-[var(--brand-color-6)] hover:bg-[var(--button-brand-tint-active-bg)] hover:!text-[var(--brand-color-6)]',
  itemDanger:
    'hover:bg-[color-mix(in_srgb,var(--error-color-6)_12%,transparent)] hover:!text-[var(--error-color-6)]',
  footer:
    'mt-auto flex flex-col items-center gap-0.5 hairline-border-t border-[var(--border-color)] px-1 pt-1.5',
  ...toolRailMenuStyles,
}

export const designToolRailTopBase: CwDesignToolRailStyles = {
  root:
    'relative flex h-12 w-full shrink-0 items-center gap-1.5 overflow-hidden hairline-border-b border-[var(--border-color)] bg-[var(--bg-color-container)] px-2',
  /** 左右侧栏相对叠在上层；中间工具相对整条顶栏绝对居中 */
  leading: 'relative z-[var(--z-index-above)] flex shrink-0 items-center',
  center:
    'absolute left-1/2 top-1/2 z-[var(--z-index-base)] flex max-w-[min(100%,calc(100%-8rem))] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 overflow-x-auto',
  scroll: 'flex min-h-0 min-w-0 flex-1 items-center gap-1 overflow-x-auto',
  group: 'flex shrink-0 items-center gap-1',
  divider: 'mx-0.5 h-6 w-0 shrink-0 hairline-border-l border-[var(--border-color)]',
  item:
    `inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-[var(--text-color-primary)] transition-[background-color,color] duration-150 hover:bg-[var(--bg-color-component-hover)] disabled:pointer-events-none disabled:opacity-35 ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  itemActive:
    'bg-[var(--button-brand-tint-active-bg)] !text-[var(--brand-color-6)] hover:bg-[var(--button-brand-tint-active-bg)] hover:!text-[var(--brand-color-6)]',
  itemDanger:
    'hover:bg-[color-mix(in_srgb,var(--error-color-6)_12%,transparent)] hover:!text-[var(--error-color-6)]',
  footer:
    'relative z-[var(--z-index-above)] ml-auto flex shrink-0 items-center gap-0.5 hairline-border-l border-[var(--border-color)] pl-2',
  ...toolRailMenuStyles,
}
