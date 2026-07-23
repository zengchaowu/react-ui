import type { CwTooltipAppearance, CwTooltipStyles } from './types'

export const tooltipBase: CwTooltipStyles = {
  root: 'cw-tooltip inline-flex w-full min-w-0 max-w-full items-center',
  fallbackTrigger:
    'px-2 py-1 rounded-md bg-[var(--bg-color-component)] text-[var(--text-color-secondary)] text-sm cursor-default select-none',
  popup:
    'max-w-[min(100vw-2rem,24rem)] min-w-0 bg-[var(--inverse-surface-bg)] text-[var(--inverse-surface-fg)] rounded-md px-3 py-2 text-left shadow-[var(--shadow-2)] break-words [overflow-wrap:anywhere]',
  content:
    'min-w-0 text-left text-[var(--inverse-surface-fg)] text-sm leading-5 whitespace-normal break-words [overflow-wrap:anywhere]',
  arrow:
    'w-2.5 h-2.5 bg-[var(--inverse-surface-bg)] border-[var(--inverse-surface-bg)]',
}

/** @deprecated 使用 tooltipBase */
export const defaultStyles = tooltipBase

export const appearanceStyles: Record<
  CwTooltipAppearance,
  Partial<CwTooltipStyles>
> = {
  default: {},
  inline: {
    root: 'cw-tooltip inline-flex w-auto max-w-none shrink-0 items-center',
  },
  mention: {
    root: 'cw-tooltip inline-flex !w-auto !max-w-none min-w-0 shrink-0 align-middle',
    popup:
      'max-w-[min(100vw-2rem,14rem)] min-w-0 bg-[var(--inverse-surface-bg)] text-[var(--inverse-surface-fg)] rounded-md px-2.5 py-2 shadow-[var(--shadow-2)]',
    content: 'min-w-0 p-0',
  },
}
