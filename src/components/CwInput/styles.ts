import type { CwInputAppearance } from './types'
import { FORM_CONTROL_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

/** 内部默认结构 class */
export const inputBase = {
  root: 'cw-input w-full',
  rootNormal: '',
  rootDisabled: 'cursor-not-allowed',
  rootReadonly: 'cursor-default',

  icon: 'flex items-center justify-center pl-3 pointer-events-none flex-shrink-0',
  iconNormal: 'text-[var(--text-color-secondary)]',
  iconDisabled: 'text-[var(--text-color-disabled)]',

  label: 'text-sm whitespace-nowrap flex-shrink-0 pl-2 font-normal',
  labelNormal: 'text-[var(--text-color-secondary)]',
  labelDisabled: 'text-[var(--text-color-disabled)]',

  inputMain: 'flex flex-1 min-w-0 items-center',
  inputMainAlignLeft: 'justify-start',
  inputMainAlignRight: 'justify-end',
  inputMainAlignCenter: 'justify-center',
  inputMainPadStart: 'pl-2',
  inputWithDisplayPrefix: 'font-variant-numeric tabular-nums',

  inputWrapper: 'flex items-center overflow-hidden outline-none',
  /** 默认外观的边框与圆角；skipChrome 外观不叠加 */
  inputWrapperChrome: 'rounded-md border',
  inputWrapperNormal:
    'border-[var(--border-color)] cursor-text bg-[var(--bg-color-container)]',
  inputWrapperReadonly:
    'border-[var(--border-color)] cursor-default bg-[var(--bg-color-container)]',
  inputWrapperFocus: FORM_CONTROL_FOCUS_CLASS,
  inputWrapperDisabled:
    'border-[var(--border-color)] bg-[var(--bg-color-component-disabled)] cursor-not-allowed',

  input: 'px-2 py-2',
  inputNormal:
    'text-[var(--text-color-primary)] placeholder:text-[var(--text-color-placeholder)]',
  inputDisabled:
    'text-[var(--text-color-disabled)] cursor-not-allowed placeholder:text-[var(--text-color-disabled)]',
  inputReadonly:
    'text-[var(--text-color-primary)] cursor-default placeholder:text-[var(--text-color-placeholder)]',
  inputLeft: '!text-left',
  inputRight: '!text-right',
  inputCenter: '!text-center',

  /** pr-2：与 clear 右侧留白一致，避免 suffix 贴边框（勿依赖 slot 内容自己加 padding） */
  suffix:
    'flex shrink-0 items-center justify-center self-stretch overflow-visible pr-2',
  clearButton:
    'flex items-center justify-center pr-2 text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] cursor-pointer flex-shrink-0 outline-none',
  sizeSmall: 'h-7 text-xs',
  sizeMedium: 'h-9 text-sm',
  sizeLarge: 'h-11 text-base',
  clearIconClass: 'inline-flex items-center justify-center text-current rounded-full',
} as const

export const appearanceRootClass: Record<CwInputAppearance, string> = {
  default: '',
  pill: '',
  search: '',
  'glass-rounded': 'max-w-md mx-auto mb-10',
  'pill-compact': 'min-w-0',
  'surface-light': '',
  'surface-dark': '',
  embedded: 'min-h-0 min-w-0 w-full flex-1 self-stretch',
  plain: 'min-w-0 w-auto max-w-full inline-block',
  /** 宽度由外层 class 控制（勿加 w-auto，避免盖住 w-10 等） */
  compact: 'min-w-0 max-w-full inline-block',
}

export const appearanceWrapperClass: Record<CwInputAppearance, string> = {
  default: '',
  pill: [
    'rounded-full',
    'bg-[var(--bg-color-container)]',
    'border border-[color-mix(in_srgb,var(--border-color)_70%,transparent)]',
    'min-h-[2.125rem]',
  ].join(' '),
  search: [
    'rounded-full overflow-hidden min-h-[2.5rem]',
    'bg-[color-mix(in_srgb,var(--bg-color-container)_88%,transparent)]',
    'border-[color-mix(in_srgb,var(--text-color-anti)_14%,transparent)]',
  ].join(' '),
  'glass-rounded': [
    'rounded-xl',
    'bg-[color-mix(in_srgb,var(--bg-color-container)_72%,transparent)]',
    'border border-[color-mix(in_srgb,var(--text-color-anti)_12%,transparent)]',
  ].join(' '),
  'pill-compact': [
    'h-8 min-h-8 rounded-full',
    'bg-[var(--bg-color-secondarycontainer)]',
    'border border-[color-mix(in_srgb,var(--border-color)_70%,transparent)]',
  ].join(' '),
  'surface-light':
    'rounded-full !bg-white/80 border border-white/95 min-h-[2.375rem]',
  'surface-dark':
    'rounded-[0.2rem] !bg-black/40 border border-white/20 shadow-none min-h-[2.5rem]',
  embedded:
    'rounded-none border-0 border-transparent bg-transparent min-h-0 min-w-0 overflow-hidden',
  plain:
    'inline-flex h-auto w-auto max-w-full items-center rounded-none !border-0 border-transparent bg-transparent shadow-none min-h-0 min-w-0 overflow-hidden outline-none focus-within:outline-none focus-within:shadow-none',
  compact: 'h-6 min-h-6 w-full min-w-0',
}

/** 与 CwCell form label 同档字号（embedded/plain 跳过 size） */
const CELL_INLINE_INPUT_TYPO = 'text-sm font-normal leading-snug font-[inherit]'
/** plain：跟周围文案一致（CwEditableText 预览/编辑切换不跳字号） */
const PLAIN_INPUT_TYPO = 'font-inherit text-[length:inherit] leading-[inherit]'

export const appearanceInputClass: Record<CwInputAppearance, string> = {
  default: '',
  pill: 'px-4 py-2 text-[0.8125rem]',
  search: 'px-2 py-2.5 pr-4 text-[0.875rem]',
  'glass-rounded': 'px-4 py-2.5 text-[0.9375rem]',
  'pill-compact':
    'px-3 py-0 h-full text-[0.8125rem] font-normal leading-snug placeholder:font-normal',
  'surface-light':
    'px-4 py-2 text-[0.875rem] leading-normal !text-neutral-900 placeholder:!text-neutral-500',
  'surface-dark':
    'px-3 py-2 text-[0.9375rem] leading-normal !text-white placeholder:!text-white/55',
  embedded: `bg-transparent !p-0 !px-0 !py-0 ${CELL_INLINE_INPUT_TYPO}`,
  plain: `box-border block h-auto min-h-0 w-auto min-w-[2ch] max-w-full p-0 bg-transparent ${PLAIN_INPUT_TYPO} shadow-none outline-none focus:outline-none focus:ring-0 [field-sizing:content]`,
  compact:
    'box-border h-full min-h-0 w-full px-1 py-0 text-xs font-variant-numeric tabular-nums leading-none',
}

export const appearanceIconClass: Record<CwInputAppearance, string> = {
  default: '',
  pill: '',
  search:
    'pl-3.5 pr-1 pointer-events-none flex-shrink-0 text-[var(--text-color-secondary)]',
  'glass-rounded': '',
  'pill-compact': '',
  'surface-light': '',
  'surface-dark': '',
  embedded: '',
  plain: '',
  compact: '',
}

/** 后缀区：墙纸登录等 pill/深色表面贴右 */
export const appearanceSuffixClass: Record<CwInputAppearance, string> = {
  default: '',
  pill: 'pr-2 justify-end',
  search: 'pr-2 justify-end',
  'glass-rounded': 'pr-2 justify-end',
  'pill-compact': 'pr-1.5 justify-end',
  'surface-light': 'pr-2 justify-end',
  'surface-dark': 'pr-2 justify-end',
  /** 去掉 inputBase.suffix 的 pr-2，Cell 行贴右时才与文案右缘对齐 */
  embedded: '!pr-0 justify-end',
  plain: '!pr-0',
  compact: 'pr-0.5 justify-end',
}

export const appearanceSkipsSize = new Set<CwInputAppearance>([
  'pill',
  'search',
  'glass-rounded',
  'pill-compact',
  'surface-light',
  'surface-dark',
  'embedded',
  'plain',
  'compact',
])

export const appearanceSkipsWrapperChrome = new Set<CwInputAppearance>([
  'pill',
  'search',
  'glass-rounded',
  'pill-compact',
  'surface-light',
  'surface-dark',
  'embedded',
  'plain',
])

export const appearanceSkipsWrapperFocus = new Set<CwInputAppearance>([
  'embedded',
  'plain',
])
