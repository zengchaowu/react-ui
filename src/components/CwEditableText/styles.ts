import type { CwEditableTextStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

/** @internal 库内默认 class */
export const editableTextBase: CwEditableTextStyles = {
  root: 'cw-editable-text inline-flex items-center',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',

  previewContainer:
    'group/cw-editable-text relative inline-flex max-w-full min-w-0 items-center outline-none focus:outline-none',
  previewContainerNormal: 'cursor-pointer',
  previewContainerDisabled: 'cursor-not-allowed',
  previewContainerReadonly: 'cursor-default',
  previewContainerFocused: INTERACTIVE_FOCUS_CLASS,

  previewText: 'text-sm',
  previewTextNormal: 'text-[var(--text-color-primary)]',
  previewTextDisabled: 'text-[var(--text-color-disabled)]',
  previewTextReadonly: 'text-[var(--text-color-primary)]',
  previewTextEmpty: 'text-[var(--text-color-placeholder)]',
  previewTextAlign: '',

  /**
   * 左对齐：图标在文字右侧（left-0 + pl）。
   * 右对齐见 appearance 覆写为 right-0 + pr。
   * 用 padding 不用 margin：margin 不计入命中，移向图标时会先离开 group-hover。
   */
  editIconContainer:
    'pointer-events-auto absolute left-0 top-1/2 z-[var(--z-index-above)] flex shrink-0 -translate-y-1/2 items-center justify-center py-0.5 pl-1 outline-none transition-opacity',
  editIconContainerNormal:
    'text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] cursor-pointer',
  editIconContainerDisabled: 'text-[var(--text-color-disabled)] cursor-not-allowed',
  editIconContainerReadonly: 'text-[var(--text-color-secondary)] cursor-default',
  editIconContainerVisible: 'opacity-100',
  /**
   * 隐藏时仍保留 pointer-events，否则绝对定位在文字外的图标无法被 hover 到
   *（离开文字 → group-hover 取消 → pointer-events-none → 图标消失）。
   */
  editIconContainerHoverReveal:
    'opacity-0 group-hover/cw-editable-text:opacity-100 group-focus-within/cw-editable-text:opacity-100',

  /** 文本旁 w-0 锚点，供图标/loading 绝对定位且不撑宽布局 */
  overlayAnchor: 'relative inline-block w-0 shrink-0 self-center overflow-visible',

  /** 左对齐：loading 在文字右侧 */
  overlayLoading:
    'pointer-events-none absolute left-0 top-1/2 z-[var(--z-index-above)] ml-0.5 flex -translate-y-1/2 items-center justify-center',

  editContainer: 'inline-flex max-w-full min-w-0 items-center',
  loadingContainer:
    'pointer-events-none absolute left-0 top-1/2 z-[var(--z-index-above)] ml-0.5 flex -translate-y-1/2 items-center justify-center',
  loadingContainerInField:
    'pointer-events-none absolute left-0 top-1/2 z-[var(--z-index-above)] ml-0.5 flex -translate-y-1/2 items-center justify-center',

  iconStyles: {
    class: 'inline-flex items-center justify-center',
    size: 1,
  },
}
