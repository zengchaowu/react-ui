import type { CwSliderCaptchaDialogStyles } from './types'
import { designPxToRemNum } from '@zengchaowu/ui-shared/functions/ui/cwRemSize'

export const sliderCaptchaDialogBase: CwSliderCaptchaDialogStyles = {
  root:
    'cw-slider-captcha-dialog box-border flex w-full max-w-full flex-col gap-2.5 overflow-x-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-color-container)] p-2.5',
  loading:
    'flex h-[9.375rem] w-full items-center justify-center rounded-md bg-[var(--bg-color-secondarycontainer)] text-sm text-[var(--text-color-secondary)]',
  imageStage:
    'relative aspect-[2/1] w-full shrink-0 overflow-hidden rounded-md bg-[var(--bg-color-secondarycontainer)] select-none touch-none',
  backgroundImage: 'pointer-events-none absolute inset-0 h-full w-full object-cover',
  puzzleImage:
    'pointer-events-none absolute left-0 top-0 object-fill will-change-transform drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]',
  toolbar:
    'absolute right-2 top-2 z-[var(--z-index-above)] flex items-center gap-1.5',
  toolbarBtn:
    'inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-white outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/80 disabled:cursor-not-allowed disabled:opacity-50 [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.45))]',
  refreshMask:
    'pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25',
  refreshBadge:
    'rounded-full bg-[var(--bg-color-container)]/90 px-2.5 py-1 text-xs text-[var(--text-color-secondary)]',
  track:
    'relative h-10 w-full overflow-hidden rounded-md border border-[var(--border-color)] bg-[var(--bg-color-secondarycontainer)] touch-none select-none',
  progress:
    'absolute inset-y-0 left-0 z-[var(--z-index-base)] bg-[var(--brand-color-6)]',
  hint: 'pointer-events-none absolute inset-0 flex items-center justify-center px-12 text-sm text-[var(--text-color-secondary)]',
  handle:
    'absolute top-0 z-[var(--z-index-above)] box-border flex h-full w-10 items-center justify-center rounded-md border border-[var(--border-color)] bg-[var(--bg-color-container)] text-[var(--text-color-primary)] touch-none will-change-[left] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]',
  footer: 'flex min-h-0 items-center justify-start',
  error: 'min-w-0 flex-1 text-xs text-[var(--error-color-6)]',
  iconStyles: {
    size: designPxToRemNum(16),
    class: 'text-current',
  },
  toolbarIconStyles: {
    size: designPxToRemNum(16),
    class: 'text-white',
  },
}
