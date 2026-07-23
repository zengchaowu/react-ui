import type { CwTabbarAppearance, CwTabbarStyles } from './types'
import type {  CwIconEmbed  } from '../CwIcon/types'
import type { CwDivStyles } from '../CwDiv/types'
import { INTERACTIVE_FOCUS_CLASS } from '../../utils/focusStyles'

const defaultIconStyles: CwIconEmbed = {
  root: 'inline-flex items-center justify-center text-current transition-transform duration-200',
  size: 1.25
}

/** 壳层外沿顶部分割线（hairline：1px + scaleY(0.5)，与底/右同 token、同技法） */
export const tabbarOuterEdgeTopHairline = [
  "before:content-[''] before:absolute before:left-0 before:right-0 before:top-0",
  'before:h-px before:bg-[var(--component-border)] before:origin-top before:[transform:scaleY(0.5)]',
].join(' ')

/** 壳层外沿底部分割线（hairline；如 CwWindowTitleBar 底边） */
export const chromeOuterEdgeBottomHairline = [
  "after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0",
  'after:h-px after:bg-[var(--component-border)] after:origin-bottom after:[transform:scaleY(0.5)]',
].join(' ')

/** Tabbar 外沿右侧分割线（hairline） */
export const tabbarOuterEdgeRightHairline = [
  "after:content-[''] after:absolute after:top-0 after:bottom-0 after:right-0",
  'after:w-px after:bg-[var(--component-border)] after:origin-right after:[transform:scaleX(0.5)]',
].join(' ')

/** 横向根容器：无顶部分割线（与 `showTopDivider={false}` 对应） */
export const horizontalRootWithoutTopDivider =
  'cw-tabbar w-full relative bg-[var(--bg-color-container)]'

/** 横向根容器：顶部分割线（hairline） */
export const horizontalRootWithTopDivider = `${horizontalRootWithoutTopDivider} ${tabbarOuterEdgeTopHairline}`

export const defaultStyles: CwTabbarStyles = {
  root: horizontalRootWithTopDivider,
  rootNormal: '',
  rootDisabled: 'bg-[var(--bg-color-component-disabled)]',
  rootReadonly: '',
  items: 'flex items-center justify-around overflow-visible w-full px-2 py-1',
  itemsHorizontalScroll:
    'flex-nowrap justify-around w-max min-w-full shrink-0 touch-pan-x [&>*]:shrink-0',
  item: 'relative flex flex-col items-center justify-center gap-0.5 overflow-visible px-3 py-1 rounded-md outline-none focus:outline-none transition-colors duration-200',
  itemNormal: 'cursor-pointer text-[var(--text-color-secondary)] hover:text-[var(--text-color-primary)]',
  itemActive: 'cursor-pointer text-[var(--brand-color-6)]',
  itemDisabled: 'cursor-not-allowed text-[var(--text-color-disabled)]',
  itemReadonly: 'cursor-default text-[var(--text-color-secondary)]',
  itemFocused: INTERACTIVE_FOCUS_CLASS,
  itemContent: 'flex flex-col items-center justify-center gap-0.5 overflow-visible',
  itemIconWrapper: 'relative flex items-center justify-center overflow-visible',
  itemLabel: 'text-xs leading-none',
  itemLabelNormal: 'text-[var(--text-color-secondary)]',
  itemLabelActive: 'text-[var(--brand-color-6)] font-medium',
  itemLabelDisabled: 'text-[var(--text-color-disabled)]',
  itemLabelReadonly: 'text-[var(--text-color-secondary)]',
  badge: 'absolute -top-1 -right-2 min-w-[1rem] h-4 px-1 [font-size:var(--font-size-xs)] leading-4 text-center rounded-full',
  badgeNormal: 'bg-[var(--error-color-6)] text-[var(--text-color-anti)]',
  badgeDisabled: 'bg-[var(--component-border)] text-[var(--text-color-disabled)]',
  badgeReadonly: 'bg-[var(--error-color-hover)] text-[var(--text-color-anti)]',
  itemIconStyles: defaultIconStyles
}

/** 横向底栏项过多时 CwDiv 横向滚动容器（仅 overflow-x） */
export const tabbarHorizontalItemsScrollCwDivStyles: Partial<CwDivStyles> = {
  root: 'cw-tabbar-items-scroll w-full min-h-0 shrink-0',
  viewport:
    'cw-div__viewport relative min-h-0 w-full max-w-full flex-[1_1_0%] overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden',
  content: 'cw-div__content relative inline-flex min-w-full touch-pan-x',
}

/** 纵向根容器（无右侧描边）；与主内容区的分隔由 `showTopDivider` 控制（为 true 时加 `border-r`） */
export const verticalTabbarRootWithoutSideDivider =
  'cw-tabbar w-full min-h-0 flex flex-col flex-shrink-0 overflow-visible relative bg-[var(--bg-color-container)]'

/** 纵向根容器 + 右侧描边（与横向顶部分割线同属外沿 hairline） */
export const verticalTabbarRootWithSideDivider = `${verticalTabbarRootWithoutSideDivider} ${tabbarOuterEdgeRightHairline}`

/**
 * 纵向侧栏：条目纵向排列；`root` 由 CwTabbar 按 `showTopDivider` 在 with/without 侧线之间切换
 */
export const verticalOrientationStyleOverrides: Partial<CwTabbarStyles> = {
  rootDisabled: 'bg-[var(--bg-color-component-disabled)]',
  items:
    'flex flex-col items-center justify-start gap-1 overflow-x-visible w-full py-2 px-0.5',
  item: 'relative flex flex-col items-center justify-center gap-0.5 overflow-visible px-2 py-1.5 rounded-md outline-none focus:outline-none transition-colors duration-200 w-full max-w-full',
  itemFocused: INTERACTIVE_FOCUS_CLASS
}

/** `size=\"lg\"`：更大图标与最小点击高度 */
export function tabbarSizeLgStyles(vertical: boolean): Partial<CwTabbarStyles> {
  return {
    itemIconStyles: {
      root: 'inline-flex items-center justify-center text-current transition-transform duration-200',
      size: 1.5
    },
    itemLabel: 'text-sm leading-none',
    item: vertical
      ? 'relative flex flex-col items-center justify-center gap-0.5 overflow-visible px-2 py-2.5 rounded-md outline-none focus:outline-none transition-colors duration-200 w-full max-w-full min-h-[3.25rem]'
      : 'relative flex flex-col items-center justify-center gap-1 overflow-visible px-3 py-2 rounded-md outline-none focus:outline-none transition-colors duration-200 min-h-[2.75rem] min-w-[2.75rem]'
  }
}

const chatShellTabbarItemIconStyles: CwIconEmbed = {
  class: [
    'inline-flex items-center justify-center text-current',
    'size-[var(--size-tabbar-icon)] [font-size:var(--size-tabbar-icon)]',
  ].join(' '),
  size: 0,
}

const chatShellTabItemShape = [
  'relative flex flex-col items-center justify-center gap-0.5 overflow-visible',
  'rounded-md outline-none focus:outline-none transition-none',
].join(' ')

export const tabbarChatShellAppearanceOverrides: Partial<CwTabbarStyles> = {
  item: [chatShellTabItemShape, 'px-2 py-2.5 w-full max-w-full min-h-[var(--size-tabbar-item)]'].join(' '),
  itemNormal: [
    'cursor-pointer text-[var(--cw-chat-shell-tab-fg)]',
    'hover:text-[var(--cw-chat-shell-tab-fg-hover)]',
    'hover:bg-[var(--cw-chat-shell-tab-bg-hover)]',
  ].join(' '),
  itemActive: 'cursor-pointer text-[var(--brand-color-6)]',
  itemLabelNormal: 'text-inherit',
  itemLabelActive: 'text-[var(--brand-color-6)] font-medium',
  itemFocused: INTERACTIVE_FOCUS_CLASS,
  itemIconStyles: chatShellTabbarItemIconStyles,
}

export const tabbarChatShellMobileAppearanceOverrides: Partial<CwTabbarStyles> = {
  ...tabbarChatShellAppearanceOverrides,
  items: 'flex items-center justify-around overflow-visible w-full px-2 py-1',
  item: [chatShellTabItemShape, 'px-2 py-1 min-h-[var(--size-touch-target)] min-w-[var(--size-touch-target)]'].join(' '),
  itemContent: 'flex flex-col items-center justify-center gap-0.5 overflow-visible',
  itemLabel: 'text-xs leading-none',
  itemIconStyles: chatShellTabbarItemIconStyles,
}

export const defaultChatShellTabbarStyles = tabbarChatShellAppearanceOverrides

export const tabbarAppearanceOverrides: Record<
  CwTabbarAppearance,
  Partial<CwTabbarStyles>
> = {
  default: {},
  chatShell: tabbarChatShellAppearanceOverrides,
  chatShellMobile: tabbarChatShellMobileAppearanceOverrides,
}
