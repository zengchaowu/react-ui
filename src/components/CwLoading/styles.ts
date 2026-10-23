import type { CwLoadingAppearance, CwLoadingStyles } from './types'

const spinnerBase =
  'border-solid rounded-full border-b-transparent border-l-transparent animate-spin'

export const loadingBase: CwLoadingStyles = {
  root: 'cw-loading inline-flex items-center justify-center',
  loader: 'flex items-center justify-center',
  spinner: 'relative inline-block',
  spinnerCircle: `${spinnerBase} border-t-[var(--brand-color-6)] border-r-[var(--brand-color-6)]`,
  dots: 'flex items-center gap-1.5',
  dot: 'rounded-full bg-[var(--brand-color-6)]',
  bars: 'flex items-end gap-0.5',
  bar: 'bg-[var(--brand-color-6)] origin-bottom',
  small: '',
  medium: '',
  large: '',
}

export const appearanceStyles: Record<
  CwLoadingAppearance,
  Partial<CwLoadingStyles>
> = {
  default: {},
  currentColor: {
    spinnerCircle: `${spinnerBase} border-t-[currentColor] border-r-[currentColor]`,
  },
  inverse: {
    spinnerCircle: [
      spinnerBase,
      'border-t-[var(--cw-loading-inverse-fg)]',
      'border-r-[var(--cw-loading-inverse-fg)]',
      'border-b-[color-mix(in_srgb,var(--cw-loading-inverse-fg)_30%,transparent)]',
      'border-l-[color-mix(in_srgb,var(--cw-loading-inverse-fg)_30%,transparent)]',
    ].join(' '),
  },
  inverseTiny: {
    root: 'inline-flex items-center justify-center',
    spinnerCircle: [
      'h-2.5 w-2.5 border-[1.5px] border-solid rounded-full animate-spin',
      'border-[var(--text-color-anti)] border-b-transparent border-l-transparent',
    ].join(' '),
  },
  treeInline: {
    root: 'inline-flex h-3 w-3 shrink-0 items-center justify-center text-[var(--text-color-placeholder)]',
    spinnerCircle: `${spinnerBase} border-t-[var(--brand-color-6)] border-r-[var(--brand-color-6)] !h-3 !w-3 border-[1.5px]`,
  },
  mutedInline: {
    root: 'inline-flex h-2.5 w-2.5 shrink-0 items-center justify-center text-[var(--text-color-secondary)]',
    spinnerCircle: `${spinnerBase} border-t-[var(--text-color-secondary)] border-r-[var(--text-color-secondary)] !h-2.5 !w-2.5 border-[1.5px]`,
  },
  inlineText: {
    root: 'inline-flex h-[0.75em] w-[0.75em] shrink-0 items-center justify-center text-[var(--text-color-secondary)]',
    spinnerCircle: [
      spinnerBase,
      'border-t-current border-r-current',
      '!h-[0.75em] !w-[0.75em] border-[max(1px,0.06em)]',
    ].join(' '),
  },
}
