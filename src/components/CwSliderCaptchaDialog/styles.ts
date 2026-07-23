import type { CwSliderCaptchaDialogStyles } from './types'
import { designPxToRemNum } from '../../utils/cwRemSize'

export const defaultStyles: CwSliderCaptchaDialogStyles = {
  root: 'cw-slider-captcha-dialog box-border flex w-full max-w-full flex-col gap-3 overflow-x-hidden',
  loading:
    'flex h-[9.375rem] w-full items-center justify-center rounded-lg border border-[var(--component-border)] bg-[var(--bg-color-container)] text-sm text-[var(--text-color-secondary)]',
  imageStage:
    'relative aspect-[2/1] w-full overflow-hidden rounded-lg border border-[var(--component-border)] select-none touch-none',
  backgroundImage: 'pointer-events-none block h-full w-full object-cover',
  puzzleImage:
    'pointer-events-none absolute left-0 top-0 shadow-md will-change-transform',
  refreshMask:
    'pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--bg-color-container)]/35',
  refreshBadge:
    'rounded-full bg-[var(--bg-color-container)]/90 px-2.5 py-1 text-xs text-[var(--text-color-secondary)] shadow-sm',
  track:
    'relative h-10 w-full overflow-hidden rounded-full border border-[var(--component-border)] bg-[var(--bg-color-secondarycontainer)] touch-none select-none',
  progress: 'absolute inset-y-0 left-0 z-[var(--z-index-base)] rounded-full bg-[var(--brand-color-light)]',
  hint: 'pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-[var(--text-color-secondary)]',
  handle:
    'absolute top-1/2 z-[var(--z-index-above)] box-border flex h-full w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--component-border)] bg-[var(--bg-color-container)] text-[var(--text-color-primary)] shadow-sm touch-none will-change-[left] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
  footer: 'flex items-center justify-between gap-2',
  error: 'min-w-0 flex-1 text-xs text-[var(--error-color-6)]',
  refreshAction:
    'shrink-0 cursor-pointer text-xs text-[var(--brand-color)] outline-none focus-visible:underline disabled:cursor-not-allowed disabled:opacity-50',
  iconStyles: {
    size: designPxToRemNum(14),
  },
}
