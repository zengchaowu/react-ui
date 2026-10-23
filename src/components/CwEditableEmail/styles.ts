import type { CwEditableEmailStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

/** @internal 库内默认 class */
export const editableEmailBase: CwEditableEmailStyles = {
  root: 'cw-editable-email inline-flex items-center',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',

  previewContainer: 'flex items-center gap-2 outline-none focus:outline-none',
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

  editIconContainer: 'flex items-center justify-center outline-none',
  editIconContainerNormal:
    'text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] cursor-pointer',
  editIconContainerDisabled: 'text-[var(--text-color-disabled)] cursor-not-allowed',
  editIconContainerReadonly: 'text-[var(--text-color-secondary)] cursor-default',

  editContainer: 'flex items-center gap-2',
  loadingContainer:
    'flex shrink-0 items-center justify-center text-[var(--text-color-secondary)]',

  iconStyles: {
    class: 'inline-flex items-center justify-center',
    size: 1,
  },
}
