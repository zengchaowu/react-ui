import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'
import type { CwButtonAppearance } from './types'

/** 组件内部默认根/内容类（不可被业务覆盖） */
export const buttonBase = {
  root: 'cw-button inline-flex items-center justify-center outline-none focus:outline-none transition-colors duration-200 font-normal select-none',
  rootNormal: 'cursor-pointer',
  rootDisabled: 'cursor-not-allowed pointer-events-none',
  rootFocused: INTERACTIVE_FOCUS_CLASS,
  loadingSpinner: 'mr-2',
  content: 'flex items-center justify-center',
} as const

/**
 * appearance → 额外 root / content 类。
 * 部分场景会跳过默认 size/shape/variant 色（见 CwButton.vue）。
 */
export const appearanceRootClass: Record<CwButtonAppearance, string> = {
  default: '',
  icon: [
    '!p-0 !leading-none shrink-0 rounded-md',
    'h-[var(--cw-button-icon-size)] w-[var(--cw-button-icon-size)]',
    'min-h-[var(--cw-button-icon-size)] min-w-[var(--cw-button-icon-size)]',
    'max-h-[var(--cw-button-icon-size)] max-w-[var(--cw-button-icon-size)]',
  ].join(' '),
  'inline-fixed': [
    '!py-0 !px-2 !leading-none rounded-md text-[0.8125rem] font-medium tabular-nums',
    'h-[var(--cw-button-inline-fixed-height)]',
    'min-h-[var(--cw-button-inline-fixed-height)]',
    'max-h-[var(--cw-button-inline-fixed-height)]',
  ].join(' '),
  'inline-padded': [
    '!h-auto !min-h-[var(--cw-button-inline-padded-min-height)] !max-h-none',
    '!py-[var(--cw-button-inline-padded-padding-y)] !px-[var(--cw-button-inline-padded-padding-x)]',
    '!leading-none rounded-md text-[0.8125rem] font-medium tabular-nums',
  ].join(' '),
  avatar: [
    '!p-0 rounded-full overflow-hidden shrink-0',
    'h-[var(--cw-button-icon-size)] w-[var(--cw-button-icon-size)]',
    'min-h-[var(--cw-button-icon-size)] min-w-[var(--cw-button-icon-size)]',
    'max-h-[var(--cw-button-icon-size)] max-w-[var(--cw-button-icon-size)]',
  ].join(' '),
  backdrop: [
    'absolute inset-0 !h-full !w-full !rounded-none cursor-default !pointer-events-auto',
    '!bg-transparent hover:!bg-transparent active:!bg-transparent',
    'data-[keyboard-active=true]:!bg-transparent',
  ].join(' '),
  tile: '!flex-col !h-auto !w-full gap-2.5 !py-2 !px-2 rounded-2xl',
  'grid-column': [
    'desktop-icon-btn',
    '!flex !flex-col !h-auto !min-h-0 !min-w-0 !w-full',
    '!items-center !justify-start !gap-0',
    '!overflow-visible !p-0 !m-0',
    '!rounded-none !border-0 !bg-transparent !shadow-none',
    '!font-normal !leading-none !select-none',
  ].join(' '),
  'bar-slot': [
    '!p-0 !leading-none shrink-0 rounded-[0.5rem]',
    'h-[var(--cw-button-bar-slot-height)]',
    'w-[var(--cw-button-bar-slot-width)]',
    'min-h-[var(--cw-button-bar-slot-height)]',
    'min-w-[var(--cw-button-bar-slot-width)]',
    'max-h-[var(--cw-button-bar-slot-height)]',
    'max-w-[var(--cw-button-bar-slot-width)]',
    '!bg-transparent hover:!bg-white/15 active:!bg-white/22',
    'data-[keyboard-active=true]:!bg-white/22',
  ].join(' '),
  'list-item':
    '!relative !w-full !h-auto !min-h-0 !justify-start gap-3 !px-3 !py-2 !rounded-md text-left text-sm',
  preset:
    '!flex-col !h-auto !w-full gap-1.5 !p-2 rounded-lg border transition-colors border-[color-mix(in_srgb,var(--border-color)_60%,transparent)]',
  'surface-light':
    '!bg-white/80 !text-neutral-900 hover:!bg-white',
  'text-on-image':
    '!inline-flex !items-center !justify-center !h-auto !min-h-0 !px-2 !py-1.5 !bg-transparent !text-white/75 hover:!text-white hover:!bg-transparent active:!bg-transparent data-[keyboard-active=true]:!bg-transparent',
  'overlay-icon': [
    '!bg-transparent hover:!bg-transparent active:!bg-transparent',
    'data-[keyboard-active=true]:!bg-transparent',
  ].join(' '),
}

export const appearanceContentClass: Record<CwButtonAppearance, string> = {
  default: '',
  icon: 'flex h-full w-full items-center justify-center leading-none gap-0',
  'inline-fixed':
    'flex h-full items-center justify-center leading-none gap-[var(--cw-button-inline-gap)]',
  'inline-padded':
    'flex items-center justify-center leading-none gap-[var(--cw-button-inline-gap)]',
  avatar: 'flex h-full w-full items-center justify-center overflow-hidden',
  backdrop: 'sr-only',
  tile: 'flex flex-col items-center gap-2.5',
  'grid-column': [
    'desktop-icon-btn__content',
    'flex w-full min-w-0 flex-col items-center justify-start gap-0 overflow-visible p-0 text-center select-none',
  ].join(' '),
  'bar-slot': 'flex h-full w-full items-center justify-center leading-none gap-0',
  'list-item': 'flex w-full items-center gap-3 min-w-0',
  preset: 'flex flex-col items-center gap-1.5 w-full',
  'surface-light': '',
  'text-on-image': 'flex items-center justify-center gap-1.5 text-xs leading-none',
  'overlay-icon': '',
}

export const appearanceSelectedRootClass: Partial<Record<CwButtonAppearance, string>> = {
  // 侧栏/列表：选中用品牌 tint（勿用 text-color-anti，浅色主题为白，叠白底几乎不可见）
  'list-item':
    'bg-[var(--button-brand-tint-active-bg)] text-[var(--brand-color-6)] font-semibold',
  preset: 'border-[var(--brand-color-6)] ring-1 ring-[var(--brand-color-6)]',
}

export const appearanceUnselectedRootClass: Partial<Record<CwButtonAppearance, string>> = {
  'list-item': 'hover:bg-[var(--bg-color-component-hover)]',
  preset: '',
}

/**
 * 壳层 / 工具栏类 appearance 的键盘焦点：用底色表达，不用品牌蓝 ring
 *（蓝环留给表单控件；桌面壳层蓝框易被当成选中态）。
 */
const CHROME_FOCUS_BG_CLASS = 'bg-[var(--bg-color-component-hover)]'

export const appearanceFocusRootClass: Partial<Record<CwButtonAppearance, string>> = {
  'list-item': CHROME_FOCUS_BG_CLASS,
  icon: CHROME_FOCUS_BG_CLASS,
  'inline-fixed': CHROME_FOCUS_BG_CLASS,
  'inline-padded': CHROME_FOCUS_BG_CLASS,
  avatar: CHROME_FOCUS_BG_CLASS,
  tile: CHROME_FOCUS_BG_CLASS,
  'overlay-icon': CHROME_FOCUS_BG_CLASS,
  /** Dock：与 hover 同浅白底 */
  'bar-slot': '!bg-white/15',
}

/** 这些 appearance 自带色/透明底，跳过 type/variant 色板 */
export const appearanceSkipsVariantColor = new Set<CwButtonAppearance>([
  'backdrop',
  'bar-slot',
  'grid-column',
  'surface-light',
  'text-on-image',
  'overlay-icon',
])

/** 这些 appearance 自带尺寸，跳过默认 size 映射 */
export const appearanceSkipsSize = new Set<CwButtonAppearance>([
  'icon',
  'inline-fixed',
  'inline-padded',
  'avatar',
  'backdrop',
  'tile',
  'grid-column',
  'bar-slot',
  'list-item',
  'preset',
  'text-on-image',
  'overlay-icon',
])

/** 这些 appearance 自带圆角，跳过 shape */
export const appearanceSkipsShape = new Set<CwButtonAppearance>([
  'icon',
  'inline-fixed',
  'inline-padded',
  'avatar',
  'backdrop',
  'tile',
  'grid-column',
  'bar-slot',
  'list-item',
  'preset',
  'overlay-icon',
])
