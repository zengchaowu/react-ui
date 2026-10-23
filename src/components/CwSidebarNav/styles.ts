import type { CwSidebarNavAppearance, CwSidebarNavStyles } from './types'

export const sidebarNavBase: CwSidebarNavStyles = {
  root: 'cw-sidebar-nav flex w-full min-w-0 min-h-0 flex-1 flex-col gap-0',
  section: 'flex flex-col',
  sectionLabel:
    'flex items-center h-6 mt-1.5 mb-0.5 px-3 text-[0.6875rem] font-semibold leading-none text-[var(--text-color-secondary)]',
  sectionLabelButton:
    'flex w-full cursor-pointer items-center justify-between gap-1 border-0 bg-transparent p-0 text-left',
  sectionChevron: 'shrink-0 text-[var(--text-color-placeholder)]',
  itemLabel:
    'min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left leading-tight',
  // Icon wrap only — never w-full/h-full (that squeezes the label away)
  itemIcon:
    'inline-flex shrink-0 items-center justify-center leading-none overflow-hidden',
  pin: 'h-1.5 w-1.5 shrink-0 rounded-full bg-[color-mix(in_srgb,var(--brand-color-6)_55%,transparent)] opacity-70',
  empty: 'px-3 py-2 text-xs text-[var(--text-color-placeholder)]',
}

const explorerAppearance: Partial<CwSidebarNavStyles> = {
  sectionLabel: [
    'flex items-center h-6 mt-1.5 mb-0.5',
    'px-3 pl-3.5 text-[0.6875rem] font-semibold leading-none',
    'text-[var(--text-color-secondary)]',
  ].join(' '),
}

export function resolveSidebarNavStyles(
  appearance: CwSidebarNavAppearance = 'default',
): CwSidebarNavStyles {
  if (appearance === 'explorer') {
    return { ...sidebarNavBase, ...explorerAppearance }
  }
  return sidebarNavBase
}
