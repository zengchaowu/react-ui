import type { CwInputAppearance } from './types'
import { FORM_CONTROL_FOCUS_CLASS } from '../../utils/focusStyles'

/** 内部默认结构类（不可被业务 styles 覆盖） */
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
  inputMainPadStart: 'pl-2',
  inputWithDisplayPrefix: 'font-variant-numeric tabular-nums',

  inputWrapper: 'flex items-center rounded-md overflow-hidden outline-none border',
  inputWrapperNormal:
    'border-[var(--component-border)] cursor-text bg-[var(--bg-color-container)]',
  inputWrapperReadonly:
    'border-[var(--component-border)] cursor-default bg-[var(--bg-color-container)]',
  inputWrapperFocus: FORM_CONTROL_FOCUS_CLASS,
  inputWrapperDisabled:
    'border-[var(--component-border)] bg-[var(--bg-color-component-disabled)] cursor-not-allowed',

  input: 'px-2 py-2',
  inputNormal:
    'text-[var(--text-color-primary)] placeholder:text-[var(--text-color-placeholder)]',
  inputDisabled:
    'text-[var(--text-color-disabled)] cursor-not-allowed placeholder:text-[var(--text-color-disabled)]',
  inputReadonly:
    'text-[var(--text-color-primary)] cursor-default placeholder:text-[var(--text-color-placeholder)]',
  inputLeft: 'text-left',
  inputRight: 'text-right',

  suffix: 'flex items-center justify-center overflow-visible flex-shrink-0 self-stretch',
  clearButton:
    'flex items-center justify-center pr-2 text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] cursor-pointer flex-shrink-0 outline-none',
  sizeSmall: 'h-7 text-xs',
  sizeMedium: 'h-9 text-sm',
  sizeLarge: 'h-11 text-base',
  clearIconClass: 'inline-flex items-center justify-center text-current rounded-full',
} as const

/** @deprecated 兼容旧名；内部请用 inputBase */
export const defaultStyles = {
  ...inputBase,
  clearIconStyles: {
    class: inputBase.clearIconClass,
    size: 1.125,
  },
}

export const appearanceRootClass: Record<CwInputAppearance, string> = {
  default: '',
  pill: '',
  search: '',
  launchpad: 'max-w-md mx-auto mb-10',
  toolbar: 'min-w-0',
  'on-media': '',
  'on-media-dark': '',
  embedded: 'min-h-0 flex-1 self-stretch',
}

export const appearanceWrapperClass: Record<CwInputAppearance, string> = {
  default: '',
  pill: [
    'rounded-full',
    'bg-[var(--bg-color-container)]',
    'border border-[color-mix(in_srgb,var(--component-border)_70%,transparent)]',
    'shadow-[0_1px_2px_color-mix(in_srgb,var(--scrim-base)_8%,transparent)]',
    'min-h-[2.125rem]',
  ].join(' '),
  search: [
    'rounded-full overflow-hidden min-h-[2.5rem]',
    'bg-[color-mix(in_srgb,var(--bg-color-container)_88%,transparent)]',
    'border-[color-mix(in_srgb,var(--text-color-anti)_14%,transparent)]',
    'shadow-[0_1px_2px_color-mix(in_srgb,var(--scrim-base)_6%,transparent)]',
  ].join(' '),
  launchpad: [
    'rounded-xl',
    'bg-[color-mix(in_srgb,var(--bg-color-container)_72%,transparent)]',
    'backdrop-blur-md',
    'border border-[color-mix(in_srgb,var(--text-color-anti)_12%,transparent)]',
  ].join(' '),
  toolbar: [
    'h-8 min-h-8 rounded-full',
    'bg-[var(--bg-color-secondarycontainer)]',
    'border border-[color-mix(in_srgb,var(--component-border)_70%,transparent)]',
  ].join(' '),
  'on-media':
    'rounded-full !bg-white/80 border border-white/95 shadow-[0_1px_2px_rgba(0,0,0,0.08)] min-h-[2.375rem]',
  'on-media-dark':
    'rounded-[0.2rem] !bg-black/40 border border-white/20 shadow-none min-h-[2.5rem]',
  embedded:
    'rounded-none border-0 border-transparent bg-transparent min-h-0 min-w-0 overflow-hidden',
}

export const appearanceInputClass: Record<CwInputAppearance, string> = {
  default: '',
  pill: 'px-4 py-2 text-[0.8125rem]',
  search: 'px-2 py-2.5 pr-4 text-[0.875rem]',
  launchpad: 'px-4 py-2.5 text-[0.9375rem]',
  toolbar:
    'px-3 py-0 h-full text-[0.8125rem] font-normal leading-snug placeholder:font-normal',
  'on-media':
    'px-4 py-2 text-[0.875rem] text-center leading-normal !text-neutral-900 placeholder:!text-neutral-500',
  'on-media-dark':
    'px-3 py-2 text-[0.9375rem] text-left leading-normal !text-white placeholder:!text-white/55',
  embedded: 'bg-transparent',
}

export const appearanceIconClass: Record<CwInputAppearance, string> = {
  default: '',
  pill: '',
  search:
    'pl-3.5 pr-1 pointer-events-none flex-shrink-0 text-[var(--text-color-secondary)]',
  launchpad: '',
  toolbar: '',
  'on-media': '',
  'on-media-dark': '',
  embedded: '',
}

export const appearanceSkipsSize = new Set<CwInputAppearance>([
  'pill',
  'search',
  'launchpad',
  'toolbar',
  'on-media',
  'on-media-dark',
])

export const appearanceSkipsWrapperChrome = new Set<CwInputAppearance>([
  'pill',
  'search',
  'launchpad',
  'toolbar',
  'on-media',
  'on-media-dark',
  'embedded',
])
