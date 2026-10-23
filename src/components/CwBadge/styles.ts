import type { CwBadgeAppearance, CwBadgeStyles } from './types'

export const badgeBase: CwBadgeStyles = {
  root: 'cw-badge inline-flex',
  rootWithSlot: 'relative',
  badgeOverlay: 'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2',
  content: 'inline-flex items-center justify-center text-[var(--text-color-anti)] rounded-full',
  text: 'font-medium whitespace-nowrap',
  dot: 'w-2 h-2 rounded-full',
  xsmall: 'min-w-[0.875rem] h-3.5 px-1 [font-size:var(--font-size-xs)]',
  small: 'min-w-[1rem] h-4 px-1 text-xs',
  medium: 'min-w-[1.25rem] h-5 px-1.5 text-xs',
  large: 'min-w-[1.5rem] h-6 px-2 text-sm',
}

export const appearanceStyles: Record<
  CwBadgeAppearance,
  Partial<CwBadgeStyles>
> = {
  default: {},
  'corner-dot': {
    badgeOverlay: 'absolute top-0 right-0 translate-x-[30%] -translate-y-[30%]',
    dot: 'w-1.5 h-1.5 rounded-full',
  },
}
