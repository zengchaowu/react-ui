import type { CwLoginMethodSwitchStyles } from './types'

export const defaultCwLoginMethodSwitchStyles: CwLoginMethodSwitchStyles = {
  root: 'cw-login-method-switch relative inline-flex min-h-12 w-fit items-center text-left py-3 pl-4 pr-12',
  rootDisabled: 'opacity-50',
  badge:
    'pointer-events-none inline-block rounded-md bg-[var(--bg-color-component)] px-3 py-1.5 text-sm font-medium text-[var(--text-color-primary)]',
  toggleHit: 'absolute top-0 right-0 h-12 w-12',
  toggleHitDisabled: 'cursor-default pointer-events-none',
  toggleHitEnabled: 'cursor-pointer',
  clipWrap: 'pointer-events-none absolute inset-0 overflow-hidden',
  clipInner: 'absolute inset-0 flex items-center justify-center bg-[var(--bg-color-secondarycomponent)]',
  iconWrap:
    'inline-flex h-6 w-6 items-center justify-center text-[var(--text-color-secondary)] [&_svg]:h-full [&_svg]:w-full',
}
