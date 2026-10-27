import type { CwDropdownStyles } from './types'
import type { CwDropdownAppearance } from '@zengchaowu/ui-shared/components/CwDropdown/types'
import { FOCUS_VISIBLE_INTERACTIVE_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

/**
 * 毛玻璃浮层视觉。与 vue-ui `CwContextMenu/styles.ts` 完全一致；
 * React 侧 CwContextMenu 尚未提供 styles，故此处内联同一份 class。
 */
const CW_GLASS_FROSTED_MENU_CHROME_CLASS = [
  'overflow-hidden outline-none',
  'rounded-xl border border-[color-mix(in_srgb,var(--border-color)_55%,transparent)]',
  'bg-[color-mix(in_srgb,var(--bg-color-container)_92%,transparent)]',
  'shadow-[0_2px_8px_color-mix(in_srgb,var(--scrim-base)_10%,transparent)]',
  'backdrop-blur-xl',
].join(' ')

const CW_GLASS_FROSTED_SHELL_LAYOUT = 'pointer-events-auto w-max min-w-0'

export const CW_GLASS_FROSTED_SHELL_PAD_CLASS = 'flex flex-col gap-1 p-1'

export const CW_GLASS_FROSTED_LIST_POPUP_SHELL_CLASS = [
  CW_GLASS_FROSTED_SHELL_LAYOUT,
  CW_GLASS_FROSTED_MENU_CHROME_CLASS,
].join(' ')

const CW_GLASS_FROSTED_ITEM_TINT_HOVER =
  'bg-[color-mix(in_srgb,var(--brand-color-6)_6%,transparent)]'
const CW_GLASS_FROSTED_ITEM_TINT_SELECTED =
  'bg-[color-mix(in_srgb,var(--brand-color-6)_12%,transparent)]'
const CW_GLASS_FROSTED_ITEM_TINT_SELECTED_EMPHASIS =
  'bg-[color-mix(in_srgb,var(--brand-color-6)_16%,transparent)]'

const CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS =
  'hover:bg-[color-mix(in_srgb,var(--brand-color-6)_6%,transparent)]'

const CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_CLASS =
  CW_GLASS_FROSTED_ITEM_TINT_HOVER

const CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_ON_SELECTED_CLASS =
  CW_GLASS_FROSTED_ITEM_TINT_SELECTED_EMPHASIS

const CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS = [
  CW_GLASS_FROSTED_ITEM_TINT_SELECTED,
  'hover:bg-[color-mix(in_srgb,var(--brand-color-6)_16%,transparent)]',
].join(' ')

const CW_GLASS_FROSTED_ITEM_PRESS_CLASS = `active:${CW_GLASS_FROSTED_ITEM_TINT_SELECTED}`

const CW_GLASS_FROSTED_ITEM_BODY_CLASS = [
  'scroll-my-1 box-border min-h-8 min-w-0 w-full rounded-md',
  'px-2.5 py-1.5 text-[0.8125rem] leading-snug',
  'text-[var(--text-color-primary)]',
].join(' ')

const CW_GLASS_FROSTED_MENU_ITEM_CLASS = [
  'flex items-center gap-2 whitespace-nowrap text-left',
  CW_GLASS_FROSTED_ITEM_BODY_CLASS,
  CW_GLASS_FROSTED_ITEM_PRESS_CLASS,
  'data-[cw-context-submenu-open]:bg-[color-mix(in_srgb,var(--brand-color-6)_6%,transparent)]',
].join(' ')

export const CW_DROPDOWN_MENU_CONTENT_CLASS = CW_GLASS_FROSTED_SHELL_PAD_CLASS

/** 与 Select 列表同壳（无壳 padding，留白在 CwDiv content，滚动条贴边） */
export const CW_DROPDOWN_POPUP_SHELL_CLASS = CW_GLASS_FROSTED_LIST_POPUP_SHELL_CLASS

export const CW_DROPDOWN_POPUP_TRIGGER_CLASS = 'inline-block min-w-0'

export const CW_DROPDOWN_SIDEBAR_POPUP_TRIGGER_CLASS = 'block w-full min-w-0'

const defaultRoot = 'cw-dropdown inline-flex min-w-0'
const defaultTriggerWrap = 'inline-flex min-w-0'
const defaultTriggerInner = 'inline-flex min-w-0 items-center justify-center gap-1.5'

export const cwDropdownAppearanceLayout: Record<
  CwDropdownAppearance,
  Pick<CwDropdownStyles, 'root' | 'triggerWrap' | 'triggerInner'>
> = {
  default: {
    root: defaultRoot,
    triggerWrap: defaultTriggerWrap,
    triggerInner: defaultTriggerInner,
  },
  toolbar: {
    root: 'flex shrink-0',
    triggerWrap: 'flex shrink-0',
    triggerInner: 'inline-flex items-center justify-center gap-1.5',
  },
  'toolbar-emphasis': {
    root: 'flex shrink-0',
    triggerWrap: 'flex shrink-0',
    triggerInner: 'inline-flex items-center justify-center gap-1.5 px-3',
  },
  'sidebar-full': {
    root: 'flex w-full min-w-0',
    triggerWrap: 'flex w-full min-w-0',
    triggerInner: 'inline-flex w-full min-w-0 items-center justify-center gap-2',
  },
  'glass-frosted': {
    root: 'flex shrink-0',
    triggerWrap: 'flex shrink-0',
    triggerInner: 'inline-flex items-center justify-center gap-1.5',
  },
}

/** 默认即毛玻璃菜单项；layout 仅覆盖触发器尺寸 */
export const dropdownBase: CwDropdownStyles = {
  root: defaultRoot,
  triggerWrap: defaultTriggerWrap,
  triggerInner: defaultTriggerInner,
  menu: 'min-w-0 py-0',
  menuContent: CW_DROPDOWN_MENU_CONTENT_CLASS,
  menuItem: [
    CW_GLASS_FROSTED_MENU_ITEM_CLASS,
    `cursor-pointer outline-none ${FOCUS_VISIBLE_INTERACTIVE_CLASS}`,
  ].join(' '),
  menuItemNormal: 'text-[var(--text-color-primary)]',
  menuItemDisabled:
    'cursor-not-allowed text-[var(--text-color-disabled)] pointer-events-none',
  menuItemHover: CW_GLASS_FROSTED_MENU_ITEM_HOVER_CLASS,
  menuItemKeyboard: CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_CLASS,
  menuItemKeyboardOnSelected: CW_GLASS_FROSTED_MENU_ITEM_KEYBOARD_ON_SELECTED_CLASS,
  menuItemSelected: CW_GLASS_FROSTED_MENU_ITEM_SELECTED_CLASS,
  menuItemCheck:
    'inline-flex h-4 w-4 shrink-0 items-center justify-center text-current',
  /** 固定 1rem 槽，有无图标时行高一致 */
  menuItemIcon:
    'inline-flex h-4 w-4 shrink-0 items-center justify-center text-current',
  menuItemLabel: 'min-w-0 flex-1',
  /** 行高由 menuItem 基类定；size 只调字号 */
  sizeSmall: 'text-xs',
  sizeMedium: '',
  sizeLarge: 'text-sm',
  arrowOpen: 'rotate-180',
  arrowIconStyles: {
    class: 'inline-flex items-center justify-center text-current text-[var(--text-color-placeholder)] transition-transform duration-200',
    size: 0.75,
  },
  leadingIconStyles: {
    class: 'inline-flex shrink-0 items-center justify-center text-current',
    size: 1.125,
  },
  checkIconStyles: {
    class: 'inline-flex items-center justify-center',
    size: 0.75,
  },
  itemIconStyles: {
    class: 'inline-flex items-center justify-center',
    size: 1,
  },
}
