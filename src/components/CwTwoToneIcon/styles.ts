import type { CwTwoToneIconStyles } from './types'

export const twoToneIconBase: CwTwoToneIconStyles = {
  root: [
    'cw-two-tone-icon relative inline-block h-[1em] w-[1em] align-[-2px]',
    "[&_g:first-child_[fill]:not([fill='none'])]:!fill-current",
    "[&_g:first-child_[stroke]:not([stroke='none'])]:!stroke-current",
    "[&_g:last-child_[fill]:not([fill='none'])]:!fill-current",
    "[&_g:last-child_[stroke]:not([stroke='none'])]:!stroke-current",
  ].join(' '),
}
