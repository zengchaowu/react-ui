import type { CwBreadcrumbAppearance } from './types'

export const breadcrumbBase = {
  root: 'cw-breadcrumb text-[var(--text-color-secondary)]',
  list: 'flex flex-wrap items-center gap-1',
  item: 'inline-flex items-center gap-1',
  link: 'hover:text-[var(--text-color-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  current: 'text-[var(--text-color-primary)] font-medium',
  separator: 'select-none text-[var(--text-color-tertiary)]',
} as const

/** @deprecated */
export const defaultStyles = breadcrumbBase

export const appearanceRootClass: Record<CwBreadcrumbAppearance, string> = {
  default: '',
  toolbar: 'min-w-0 flex-1 h-full flex items-center text-[0.8125rem] leading-none',
}

export const appearanceListClass: Record<CwBreadcrumbAppearance, string> = {
  default: '',
  toolbar:
    'flex h-full flex-nowrap items-center gap-0.5 overflow-x-auto [scrollbar-width:none]',
}

export const appearanceItemClass: Record<CwBreadcrumbAppearance, string> = {
  default: '',
  toolbar: 'inline-flex h-full shrink-0 items-center gap-0.5 max-w-[12rem] leading-none',
}

export const appearanceLinkClass: Record<CwBreadcrumbAppearance, string> = {
  default: '',
  toolbar:
    'inline-flex items-center truncate leading-none text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)] transition-colors',
}

export const appearanceCurrentClass: Record<CwBreadcrumbAppearance, string> = {
  default: '',
  toolbar: 'inline-flex items-center truncate leading-none text-[var(--text-color-primary)]',
}

export const appearanceSeparatorClass: Record<CwBreadcrumbAppearance, string> = {
  default: '',
  toolbar:
    'inline-flex items-center shrink-0 select-none leading-none text-[var(--text-color-placeholder)]',
}
