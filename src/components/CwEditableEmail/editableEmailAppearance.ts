import type {
  CwEditableEmailAppearance,
  CwEditableEmailStyles,
} from './types'
import { resolveEditableTextPreviewStyles } from '../CwEditableText/editableTextAppearance'
import { editableEmailBase } from './styles'

export function resolveEditableEmailStyles(
  appearance: CwEditableEmailAppearance,
  align: 'left' | 'right' = 'left',
): CwEditableEmailStyles {
  const previewStyles = resolveEditableTextPreviewStyles(appearance, align)
  const rootExtra =
    appearance === 'plain' || appearance === 'title' ? ' w-full min-w-0' : ''

  return {
    ...editableEmailBase,
    root: `${editableEmailBase.root}${rootExtra}`,
    previewContainer: previewStyles.previewContainer,
    previewText: previewStyles.previewText,
    previewTextAlign: previewStyles.previewTextAlign,
    // EditableText 的 editContainer 无 gap；邮件编辑态 input 旁有 loading，保留间距
    editContainer: `${previewStyles.editContainer} gap-2`,
  }
}
