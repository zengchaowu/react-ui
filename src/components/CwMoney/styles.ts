import type { CwMoneyStyles } from './types'

export const moneyBase: CwMoneyStyles = {
  root: 'cw-money inline-flex items-start gap-0.5 text-[var(--text-color-primary)]',
  currency: 'font-medium text-base leading-5 pt-1',
  text: 'font-medium text-2xl leading-7',
  value: 'font-medium text-2xl leading-7 tracking-tight',
  decimal: 'text-base tracking-normal',
}

const sizeOverrides: Record<string, Partial<CwMoneyStyles>> = {
  sm: {
    root: 'inline-flex items-end gap-0.5 text-[var(--text-color-primary)]',
    currency: 'font-medium text-sm leading-[1.125rem] pb-px',
    text: 'font-bold text-base leading-[1.125rem] tracking-tight',
    value: 'font-bold text-base leading-[1.125rem] tracking-tight',
    decimal: 'text-sm font-medium tracking-normal',
  },
  xs: {
    root: 'inline-flex items-center gap-0.5 text-[var(--text-color-primary)]',
    currency: 'font-medium text-xs leading-3',
    text: 'font-medium text-xs leading-3 tracking-tight',
    value: 'font-medium text-xs leading-3 tracking-tight',
    decimal: 'text-xs font-medium tracking-tight',
  },
}

export function resolveMoneyStyles(size: string): CwMoneyStyles {
  const over = sizeOverrides[size]
  return over ? { ...moneyBase, ...over } : { ...moneyBase }
}
