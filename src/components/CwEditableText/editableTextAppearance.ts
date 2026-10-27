import type { CwInputAppearance } from '@zengchaowu/ui-shared/components/CwInput/types'
import type { CwEditableTextAppearance } from './types'
import type { CwEditableTextStyles } from '@zengchaowu/ui-shared/components/CwEditableText/types'
import { editableTextBase } from '@zengchaowu/ui-shared/components/CwEditableText/styles'

export interface ResolvedEditableTextAppearance {
  styles: CwEditableTextStyles
  inputAppearance: CwInputAppearance
}

function mergeStyles(
  patch: Partial<CwEditableTextStyles>,
): CwEditableTextStyles {
  return { ...editableTextBase, ...patch }
}

function previewAlignClass(align: 'left' | 'right'): string {
  // 右对齐用 row-reverse：锚点（编辑/loading）在文字左侧，且主轴起点在右，文字贴右
  return align === 'right'
    ? 'flex-row-reverse justify-start text-right'
    : 'justify-start text-left'
}

function textAlignClass(align: 'left' | 'right'): string {
  return align === 'right' ? 'text-right' : 'text-left'
}

/** 右对齐时图标/loading 锚在文字左侧 */
function overlaySideStyles(align: 'left' | 'right'): Partial<CwEditableTextStyles> {
  if (align !== 'right') return {}
  return {
    editIconContainer:
      'pointer-events-auto absolute right-0 top-1/2 z-[var(--z-index-above)] flex shrink-0 -translate-y-1/2 items-center justify-center py-0.5 pr-1 outline-none transition-opacity',
    overlayLoading:
      'pointer-events-none absolute right-0 top-1/2 z-[var(--z-index-above)] mr-0.5 flex -translate-y-1/2 items-center justify-center',
    loadingContainer:
      'pointer-events-none absolute right-0 top-1/2 z-[var(--z-index-above)] mr-0.5 flex -translate-y-1/2 items-center justify-center',
    loadingContainerInField:
      'pointer-events-none absolute right-0 top-1/2 z-[var(--z-index-above)] mr-0.5 flex -translate-y-1/2 items-center justify-center',
  }
}

export function resolveEditableTextStyles(
  appearance: CwEditableTextAppearance,
  align: 'left' | 'right' = 'left',
): ResolvedEditableTextAppearance {
  const previewAlign = previewAlignClass(align)
  const textAlign = textAlignClass(align)
  const side = overlaySideStyles(align)
  const editJustify =
    align === 'right' ? 'flex-row-reverse justify-start' : 'justify-start'

  switch (appearance) {
    case 'plain':
      return {
        inputAppearance: 'plain',
        styles: mergeStyles({
          root: 'cw-editable-text block w-full min-w-0',
          // 必须用 flex + w-full：inline-flex 会随文字收缩，对齐看不出来
          previewContainer: `group/cw-editable-text relative flex w-full min-w-0 max-w-full items-center outline-none focus:outline-none py-0 ${previewAlign}`,
          // 颜色交给 previewTextNormal / Empty，勿写进 previewText（会盖住 placeholder）
          previewText:
            'inline-flex items-center min-h-[1lh] h-[1lh] min-w-0 max-w-full truncate font-inherit leading-inherit',
          previewTextAlign: textAlign,
          editContainer: `flex w-full max-w-full min-w-0 items-center min-h-0 ${editJustify}`,
          savingText:
            'inline-flex items-center min-h-[1lh] h-[1lh] min-w-0 max-w-full truncate font-inherit leading-inherit text-[var(--text-color-primary)]',
          ...side,
        }),
      }
    case 'title':
      return {
        inputAppearance: 'plain',
        styles: mergeStyles({
          root: `${editableTextBase.root} w-full min-w-0`,
          editContainer: `inline-flex w-full max-w-full min-w-0 items-center text-lg font-semibold leading-snug text-[var(--text-color-primary)] ${editJustify}`,
          savingText:
            'inline min-w-0 truncate text-lg font-semibold leading-snug text-[var(--text-color-primary)]',
          previewText:
            'inline text-lg font-semibold leading-snug text-[var(--text-color-primary)]',
          previewTextAlign: textAlign,
          previewContainer: `group/cw-editable-text relative flex w-full min-w-0 max-w-full items-center outline-none focus:outline-none ${previewAlign}`,
          ...side,
        }),
      }
    case 'field-inline':
      return {
        inputAppearance: 'default',
        styles: mergeStyles({
          previewContainer: `group/cw-editable-text relative flex w-full min-w-0 max-w-full items-center outline-none focus:outline-none ${previewAlign}`,
          editContainer: `flex w-full max-w-full min-w-0 items-center ${editJustify}`,
          savingText:
            'inline min-w-0 max-w-full truncate text-sm text-[var(--text-color-primary)]',
          previewTextAlign: textAlign,
          ...side,
        }),
      }
    default:
      return {
        inputAppearance: 'default',
        styles: mergeStyles({
          editContainer: `inline-flex w-full max-w-full min-w-0 items-center ${editJustify}`,
          previewContainer: `group/cw-editable-text relative flex w-full min-w-0 max-w-full items-center outline-none focus:outline-none ${previewAlign}`,
          savingText:
            'inline min-w-0 max-w-full truncate text-sm text-[var(--text-color-primary)]',
          previewTextAlign: textAlign,
          ...side,
        }),
      }
  }
}

/** 供 CwEditableEmail 等复用预览区样式 */
export function resolveEditableTextPreviewStyles(
  appearance: CwEditableTextAppearance,
  align: 'left' | 'right' = 'left',
): CwEditableTextStyles {
  return resolveEditableTextStyles(appearance, align).styles
}
