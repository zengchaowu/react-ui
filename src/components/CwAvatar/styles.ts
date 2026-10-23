import type { CwAvatarAppearance, CwAvatarRingLightElevation } from './types'

export const avatarBase = {
  root: 'cw-avatar bg-[var(--bg-color-secondarycomponent)]',
  imageContainer: 'absolute inset-0 w-full h-full',
  circle: 'rounded-full',
  square: 'rounded',
  defaultSize: 2.5,
  imgRootClass:
    'w-full h-full [&_img]:block [&_img]:h-full [&_img]:w-full [&_img]:object-cover',
} as const

export const ringLightElevationRootClass: Record<CwAvatarRingLightElevation, string> = {
  soft: '',
  strong: '',
}

export const appearanceRootClass: Record<CwAvatarAppearance, string> = {
  default: '',
  'ring-light': ringLightElevationRootClass.soft,
  'ring-bordered': [
    'border border-solid border-[var(--border-color)]',
    'bg-gradient-to-br from-[var(--chat-avatar-placeholder-from)] via-[var(--chat-avatar-placeholder-via)] to-[var(--chat-avatar-placeholder-to)]',
    '[box-shadow:var(--chat-avatar-inner-highlight)]',
  ].join(' '),
}

export const appearanceShapeExtraClass: Partial<
  Record<CwAvatarAppearance, Partial<Record<'circle' | 'square', string>>>
> = {
  'ring-light': {
    circle: 'rounded-full ring-[3px] ring-white/80',
  },
  'ring-bordered': {
    square: 'rounded-[var(--radius-default)]',
  },
}
