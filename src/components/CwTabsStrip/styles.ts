import type { CwTabsStripStyles, CwTabsStripAppearance } from './types'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

export const tabsStripBase: CwTabsStripStyles = {
  root: 'cw-tabs-strip relative flex-shrink-0 min-w-0 outline-none gap-0',
  rootHorizontal: 'flex flex-row',
  rootVertical: 'inline-flex flex-col items-stretch',
  rootEqualWidth: 'flex-nowrap',
  rootScroll:
    'overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
  rootScrollVertical:
    'max-h-[min(24rem,70vh)] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5',
  rootDisabled: 'opacity-60',
  rootReadonly: '',
  tab: 'border-none bg-transparent flex items-center justify-center box-border outline-none focus:outline-none transition-colors duration-200 select-none',
  tabHorizontal: 'h-11 px-4',
  tabVertical: 'w-full min-h-[2.5rem] px-3 py-2 justify-start text-left',
  tabEqualWidth: 'flex-1 min-w-0 flex-[1_0_0]',
  tabAdaptive: 'flex-[0_0_auto]',
  tabActive: '',
  tabDisabled: 'cursor-not-allowed opacity-60',
  tabReadonly: 'cursor-default',
  tabFocused: INTERACTIVE_FOCUS_CLASS,
  tabContent: 'relative inline-flex items-center pr-2.5',
  /** 字号由 size* 控制并继承到文案，避免子级 text-sm 盖住 small */
  tabText: 'font-[inherit] text-[length:inherit] leading-none tracking-normal whitespace-nowrap transition-colors duration-200',
  tabTextInactive: 'font-normal text-[var(--text-color-placeholder)]',
  tabTextActive: 'font-bold text-[var(--brand-color-6)]',
  indicator: 'absolute rounded-full pointer-events-none bg-[var(--brand-color-6)]',
  indicatorHorizontalEnd: 'bottom-0 left-0 h-[0.1875rem]',
  indicatorHorizontalStart: 'top-0 left-0 h-[0.1875rem]',
  indicatorVerticalEnd: 'right-0 top-0 w-[0.1875rem]',
  indicatorVerticalStart: 'left-0 top-0 w-[0.1875rem]',
  indicatorDisabled: '!bg-[var(--border-color)]',
  indicatorReadonly: '!bg-[var(--text-color-secondary)]',
  indicatorReady: '',
  indicatorMotion: 'transition-[left,width,transform,height] duration-200 ease-out',
  indicatorNoMotion: 'transition-none',
  sizeSmall: '!text-[0.6875rem] !px-1.5 !py-0.5 !h-auto min-h-[1.625rem]',
  sizeMedium: 'text-sm',
  sizeLarge: '!text-base !px-3 !py-1.5 !h-auto min-h-[2.75rem]',
}

export const tabsStripUnderlineAppearance: Partial<CwTabsStripStyles> = {
  root: 'cw-tabs-strip relative flex-shrink-0 min-w-0 outline-none gap-0 border-b-0',
  tabHorizontal: 'h-9 px-1 mr-5 pb-2',
  tabTextInactive: 'font-normal text-[var(--text-color-secondary)]',
  tabTextActive: 'font-medium text-[var(--text-color-primary)]',
  indicator: 'absolute rounded-full pointer-events-none bg-[var(--text-color-primary)] h-0.5',
}

export function resolveTabsStripStyles(
  appearance: CwTabsStripAppearance = 'default',
): CwTabsStripStyles {
  if (appearance === 'underline') {
    return { ...tabsStripBase, ...tabsStripUnderlineAppearance }
  }
  return tabsStripBase
}
