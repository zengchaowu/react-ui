import type { CwCenterRulerPickerStyles } from './types'
import { withInteractiveFocus } from '../../utils/focusStyles'

export const defaultStyles: CwCenterRulerPickerStyles = {
  root: 'cw-center-ruler-picker w-full min-w-0 outline-none',
  rootDisabled: 'opacity-60',
  rootReadonly: 'cursor-default',

  viewport:
    'relative h-[2.125rem] touch-none select-none overflow-hidden outline-none focus:outline-none',
  viewportFocused: withInteractiveFocus('rounded-[var(--radius-default)]'),
  centerIndicator:
    'pointer-events-none absolute inset-y-0 left-1/2 z-[var(--z-index-above)] w-px -translate-x-1/2 bg-[var(--brand-color-6)] opacity-35',
  track: 'absolute inset-y-0 left-0 flex items-end will-change-transform',
  trackDragging: '',
  trackIdle: 'transition-transform duration-200 ease-out',
  tick: 'flex shrink-0 flex-col items-center justify-end pb-0.5 tabular-nums',
  tickMark: 'mb-1 h-2 w-px bg-[var(--component-border)]',
  tickLabel: 'min-h-[1em] [font-size:var(--font-size-caption)] leading-none',
  tickLabelHidden: 'invisible',
  tickLabelActive: 'font-semibold text-[var(--brand-color-6)]',
  tickLabelInactive: 'text-[var(--text-color-placeholder)]',
}
