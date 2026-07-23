import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'
import type { CwButtonAppearance } from './types'

/** 组件内部默认根/内容类（不可被业务覆盖） */
export const buttonBase = {
  root: 'cw-button inline-flex items-center justify-center outline-none focus:outline-none transition-colors duration-200 font-normal select-none',
  rootNormal: 'cursor-pointer',
  rootDisabled: 'cursor-not-allowed pointer-events-none',
  rootFocused: INTERACTIVE_FOCUS_CLASS,
  loadingSpinner: 'mr-2',
  content: 'flex items-center justify-center',
  loadingStyles: {
    root: '',
    spinnerCircle:
      'border-solid rounded-full border-b-transparent border-l-transparent animate-spin',
  },
} as const

/**
 * appearance → 额外 root / content 类。
 * 部分场景会跳过默认 size/shape/variant 色（见 CwButton.vue）。
 */
export const appearanceRootClass: Record<CwButtonAppearance, string> = {
  default: '',
  icon: [
    '!p-0 !leading-none shrink-0 rounded-md',
    'h-[var(--cw-button-icon-size,2rem)] w-[var(--cw-button-icon-size,2rem)]',
    'min-h-[var(--cw-button-icon-size,2rem)] min-w-[var(--cw-button-icon-size,2rem)]',
    'max-h-[var(--cw-button-icon-size,2rem)] max-w-[var(--cw-button-icon-size,2rem)]',
  ].join(' '),
  chrome: [
    '!py-0 !px-2 !leading-none rounded-md text-[0.8125rem] font-medium tabular-nums',
    'h-[var(--cw-button-chrome-height,var(--cw-button-icon-size,2rem))]',
    'min-h-[var(--cw-button-chrome-height,var(--cw-button-icon-size,2rem))]',
    'max-h-[var(--cw-button-chrome-height,var(--cw-button-icon-size,2rem))]',
  ].join(' '),
  avatar: [
    '!p-0 rounded-full overflow-hidden shrink-0',
    'h-[var(--cw-button-icon-size,2rem)] w-[var(--cw-button-icon-size,2rem)]',
    'min-h-[var(--cw-button-icon-size,2rem)] min-w-[var(--cw-button-icon-size,2rem)]',
    'max-h-[var(--cw-button-icon-size,2rem)] max-w-[var(--cw-button-icon-size,2rem)]',
  ].join(' '),
  backdrop: [
    'absolute inset-0 !h-full !w-full !rounded-none cursor-default !pointer-events-auto',
    '!bg-transparent hover:!bg-transparent active:!bg-transparent',
    'data-[keyboard-active=true]:!bg-transparent',
  ].join(' '),
  tile: '!flex-col !h-auto !w-full gap-2.5 !py-2 !px-2 rounded-2xl',
  'desktop-icon': [
    'desktop-icon-btn',
    '!flex !flex-col !h-auto !min-h-0 !min-w-0 !w-full',
    '!items-center !justify-start !gap-0',
    '!overflow-visible !p-0 !m-0',
    '!rounded-none !border-0 !bg-transparent !shadow-none',
    '!font-normal !leading-none !select-none',
  ].join(' '),
  dock: [
    '!p-0 !leading-none shrink-0 rounded-[0.5rem]',
    'h-[var(--cw-button-dock-height,var(--cw-button-icon-size,2.5rem))]',
    'w-[var(--cw-button-dock-width,var(--cw-button-icon-size,2.5rem))]',
    'min-h-[var(--cw-button-dock-height,var(--cw-button-icon-size,2.5rem))]',
    'min-w-[var(--cw-button-dock-width,var(--cw-button-icon-size,2.5rem))]',
    'max-h-[var(--cw-button-dock-height,var(--cw-button-icon-size,2.5rem))]',
    'max-w-[var(--cw-button-dock-width,var(--cw-button-icon-size,2.5rem))]',
    '!bg-transparent hover:!bg-white/15 active:!bg-white/22',
    'data-[keyboard-active=true]:!bg-white/22',
  ].join(' '),
  'list-item':
    '!relative !w-full !h-auto !min-h-0 !justify-start gap-3 !px-3 !py-2 !rounded-md text-left text-sm',
  preset:
    '!flex-col !h-auto !w-full gap-1.5 !p-2 rounded-lg border transition-colors border-[color-mix(in_srgb,var(--component-border)_60%,transparent)]',
  'on-media':
    '!bg-white/92 !text-neutral-900 hover:!bg-white shadow-[0_2px_10px_rgba(0,0,0,0.18)]',
  'on-media-text':
    '!inline-flex !items-center !justify-center !h-auto !min-h-0 !px-2 !py-1.5 !bg-transparent !text-white/75 hover:!text-white hover:!bg-transparent active:!bg-transparent data-[keyboard-active=true]:!bg-transparent',
  'overlay-icon': [
    '!bg-transparent hover:!bg-transparent active:!bg-transparent',
    'data-[keyboard-active=true]:!bg-transparent',
  ].join(' '),
}

export const appearanceContentClass: Record<CwButtonAppearance, string> = {
  default: '',
  icon: '!flex !h-full !w-full !items-center !justify-center !leading-none !gap-0',
  chrome: '!flex !h-full !items-center !justify-center !leading-none',
  avatar: '!flex !h-full !w-full !items-center !justify-center !overflow-hidden',
  backdrop: 'sr-only',
  tile: 'flex flex-col items-center gap-2.5',
  'desktop-icon': [
    'desktop-icon-btn__content',
    '!flex !w-full !min-w-0 !flex-col !items-center !justify-start !gap-0 !overflow-visible !p-0 !text-center !select-none',
  ].join(' '),
  dock: '!flex !h-full !w-full !items-center !justify-center !leading-none !gap-0',
  'list-item': 'flex w-full items-center gap-3 min-w-0',
  preset: 'flex flex-col items-center gap-1.5 w-full',
  'on-media': 'flex items-center justify-center',
  'on-media-text': 'flex items-center justify-center gap-1.5 text-xs leading-none',
  'overlay-icon': 'flex items-center justify-center',
}

export const appearanceSelectedRootClass: Partial<Record<CwButtonAppearance, string>> = {
  'list-item': 'bg-[color-mix(in_srgb,var(--text-color-anti)_7%,transparent)] text-[var(--brand-color-6)]',
  preset: 'border-[var(--brand-color-6)] ring-1 ring-[var(--brand-color-6)]',
}

export const appearanceUnselectedRootClass: Partial<Record<CwButtonAppearance, string>> = {
  'list-item': 'hover:bg-[color-mix(in_srgb,var(--text-color-anti)_5%,transparent)]',
  preset: '',
}

/** 这些 appearance 自带色/透明底，跳过 type/variant 色板 */
export const appearanceSkipsVariantColor = new Set<CwButtonAppearance>([
  'backdrop',
  'dock',
  'desktop-icon',
  'on-media',
  'on-media-text',
  'overlay-icon',
])

/** 这些 appearance 自带尺寸，跳过默认 size 映射 */
export const appearanceSkipsSize = new Set<CwButtonAppearance>([
  'icon',
  'chrome',
  'avatar',
  'backdrop',
  'tile',
  'desktop-icon',
  'dock',
  'list-item',
  'preset',
  'on-media-text',
  'overlay-icon',
])

/** 这些 appearance 自带圆角，跳过 shape */
export const appearanceSkipsShape = new Set<CwButtonAppearance>([
  'icon',
  'chrome',
  'avatar',
  'backdrop',
  'tile',
  'desktop-icon',
  'dock',
  'list-item',
  'preset',
  'overlay-icon',
])
