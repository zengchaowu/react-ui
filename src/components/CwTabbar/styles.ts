import type { CwTabbarAppearance, CwTabbarStyles } from './types'
import type { CwIconEmbed } from '../CwIcon/types'
import { INTERACTIVE_FOCUS_CLASS } from '@zengchaowu/ui-shared/functions/ui/focusStyles'

const defaultIconStyles: CwIconEmbed = {
  class: 'inline-flex items-center justify-center text-current transition-transform duration-200',
  size: 1.25,
}

/** 壳层外沿发丝线：与 hairline.css 同 0.5px，勿用 1px+scale（观感会和顶栏 / 分栏线不一致） */
export const tabbarOuterEdgeTopHairline = 'hairline-border-t'

/** 壳层外沿底部分割线（如 CwWindowTitleBar 底边） */
export const chromeOuterEdgeBottomHairline = 'hairline-border-b'

/** Tabbar / PC 侧栏外沿右侧分割线 */
export const tabbarOuterEdgeRightHairline = 'hairline-border-r'

/** 横向根容器：无顶部分割线（与 `showTopDivider={false}` 对应） */
export const horizontalRootWithoutTopDivider =
  'cw-tabbar w-full relative bg-[var(--bg-color-container)]'

/** 横向根容器：顶部分割线（hairline） */
export const horizontalRootWithTopDivider = `${horizontalRootWithoutTopDivider} ${tabbarOuterEdgeTopHairline}`

export const tabbarBase: CwTabbarStyles = {
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
  badgeDisabled: 'bg-[var(--border-color)] text-[var(--text-color-disabled)]',
  badgeReadonly: 'bg-[var(--error-color-hover)] text-[var(--text-color-anti)]',
  itemIconStyles: defaultIconStyles,
}

/** 横向底栏项过多时 CwDiv 横向滚动：追加 class（与 divBase 合并） */
export const tabbarHorizontalItemsScrollCwDivClasses = {
  root: 'cw-tabbar-items-scroll w-full min-h-0 shrink-0',
  viewport: '!overflow-x-auto !overflow-y-hidden max-w-full',
  content: 'relative inline-flex min-w-full touch-pan-x !min-h-0',
} as const

/** 纵向根容器（无右侧描边）；与主内容区的分隔由 `showTopDivider` 控制（为 true 时加右侧 hairline） */
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
  itemFocused: INTERACTIVE_FOCUS_CLASS,
}

/** `size="lg"`：更大图标与最小点击高度 */
export function tabbarSizeLgStyles(vertical: boolean): Partial<CwTabbarStyles> {
  return {
    itemIconStyles: {
      class: 'inline-flex items-center justify-center text-current transition-transform duration-200',
      size: 1.5,
    },
    itemLabel: 'text-sm leading-none',
    item: vertical
      ? 'relative flex flex-col items-center justify-center gap-0.5 overflow-visible px-2 py-2.5 rounded-md outline-none focus:outline-none transition-colors duration-200 w-full max-w-full min-h-[3.25rem]'
      : 'relative flex flex-col items-center justify-center gap-1 overflow-visible px-3 py-2 rounded-md outline-none focus:outline-none transition-colors duration-200 min-h-[2.75rem] min-w-[2.75rem]',
  }
}

/** Tab 图标：尺寸走 --size-tabbar-icon token，CwIcon size: 0 由 CSS 承担 */
const chatShellTabbarItemIconStyles: CwIconEmbed = {
  class: [
    'inline-flex items-center justify-center text-current',
    'size-[var(--size-tabbar-icon)] [font-size:var(--size-tabbar-icon)]',
  ].join(' '),
  size: 0,
}

/** 壳层 Tab 项共用外形（横/纵一致圆角，选中无底色） */
const chatShellTabItemShape = [
  'relative flex flex-col items-center justify-center gap-0.5 overflow-visible',
  'rounded-md outline-none focus:outline-none transition-none',
].join(' ')

/** Chat 壳层 PC 侧栏 / 移动底栏共用 Tab 项样式 */
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

/** Chat 壳层移动底栏布局（叠加于 `chatShell` 项样式） */
export const tabbarChatShellMobileAppearanceOverrides: Partial<CwTabbarStyles> = {
  ...tabbarChatShellAppearanceOverrides,
  items: 'flex items-center justify-around overflow-visible w-full px-2 py-1',
  item: [chatShellTabItemShape, 'px-2 py-1 min-h-[var(--size-touch-target)] min-w-[var(--size-touch-target)]'].join(' '),
  itemContent: 'flex flex-col items-center justify-center gap-0.5 overflow-visible',
  itemLabel: 'text-xs leading-none',
  itemIconStyles: chatShellTabbarItemIconStyles,
}

export const tabbarAppearanceOverrides: Record<
  CwTabbarAppearance,
  Partial<CwTabbarStyles>
> = {
  default: {},
  sidebar: tabbarChatShellAppearanceOverrides,
  'bottom-bar': tabbarChatShellMobileAppearanceOverrides,
}
