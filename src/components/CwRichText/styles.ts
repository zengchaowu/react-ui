import type { CwRichTextStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

/** @internal 库内默认 class */
export const richTextBase: CwRichTextStyles = {
  root: 'cw-rich-text inline-block',
  rootNormal: '',
  rootDisabled: '',
  rootReadonly: '',
  text: 'text-[var(--text-color-primary)]',
  link: 'outline-none focus:outline-none',
  linkNormal: 'text-[var(--brand-color-6)] cursor-pointer',
  linkDisabled: 'text-[var(--text-color-disabled)] cursor-not-allowed',
  linkReadonly: 'text-[var(--brand-color-6)] cursor-default',
  linkFocused: INTERACTIVE_FOCUS_CLASS,
  bold: 'font-semibold',
  italic: 'italic',
  underline: 'underline',
  sizeSmall: 'text-xs',
  sizeMedium: 'text-sm',
  sizeLarge: 'text-base',
}
