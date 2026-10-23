import type { CwProgressStyles } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const defaultCwProgressStyles: CwProgressStyles = {
  root: 'cw-progress inline-flex select-none',
  rootNormal: 'cursor-pointer',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',

  track:
    'relative rounded-full bg-[var(--bg-color-component)] outline-none focus:outline-none overflow-hidden',
  trackNormal: '',
  trackDisabled:
    'bg-[var(--bg-color-component-disabled)] border border-[var(--border-color)] cursor-not-allowed',
  trackReadonly: 'cursor-default',
  trackFocused: INTERACTIVE_FOCUS_CLASS,

  fill:
    'pointer-events-none absolute rounded-full bg-[var(--brand-color-6)] transition-[width,height] duration-100 ease-out',
  fillNormal: '',
  fillReadonly: '',
  fillDisabled: 'bg-[var(--border-color)]',

  sizeSmall: 'h-10 w-1',
  sizeMedium: 'h-12 w-1.5',
  sizeLarge: 'h-16 w-2',
}

export const horizontalCwProgressSizeStyles: Record<
  'small' | 'medium' | 'large',
  string
> = {
  small: 'h-1 w-24',
  medium: 'h-1.5 w-32',
  large: 'h-2 w-40',
}
