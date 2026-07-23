import type { CwAvatarAppearance } from './types'

export const avatarBase = {
  root: 'cw-avatar bg-[var(--bg-color-secondarycomponent)]',
  imageContainer: 'absolute inset-0 w-full h-full',
  circle: 'rounded-full',
  square: 'rounded',
  defaultSize: 2.5,
  imgStyles: {
    root: 'w-full h-full',
    image: 'block w-full h-full object-cover',
    loadingContainer:
      'absolute inset-0 flex items-center justify-center bg-[var(--bg-color-secondarycomponent)]',
    errorContainer: 'absolute inset-0 opacity-0 pointer-events-none',
  },
} as const

/** @deprecated */
export const defaultStyles = {
  ...avatarBase,
  size: avatarBase.defaultSize,
}

export const appearanceRootClass: Record<CwAvatarAppearance, string> = {
  default: '',
  'on-media': 'shadow-[0_8px_28px_rgba(0,0,0,0.28)]',
  'on-media-windows': 'shadow-[0_8px_24px_rgba(0,0,0,0.35)]',
  chat: [
    'border border-solid border-[var(--chat-avatar-border)]',
    'bg-gradient-to-br from-[var(--chat-avatar-placeholder-from)] via-[var(--chat-avatar-placeholder-via)] to-[var(--chat-avatar-placeholder-to)]',
    '[box-shadow:var(--chat-avatar-inner-highlight)]',
  ].join(' '),
}

export const appearanceShapeExtraClass: Partial<
  Record<CwAvatarAppearance, Partial<Record<'circle' | 'square', string>>>
> = {
  'on-media': {
    circle: 'rounded-full ring-[3px] ring-white/80',
  },
  chat: {
    square: 'rounded-[var(--radius-default)]',
  },
}
