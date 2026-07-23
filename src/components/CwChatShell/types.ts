import type { CwTabbarItem } from '../CwTabbar/types'

/** Chat 壳层 Tab 项（兼容 iconfont + CwTabbar） */
export interface CwChatShellTabItem extends CwTabbarItem {
  iconName?: string
  iconActiveName?: string
  useMineAvatar?: boolean
}

export interface CwChatShellNavProps {
  modelValue: string
  items: CwChatShellTabItem[]
  disabled?: boolean
  readonly?: boolean
  tabbarSize?: 'md' | 'lg'
  tooltipShowDelay?: number
  tooltipOffset?: number
  /** 触屏宽屏侧栏：Tab 长按显示 tooltip */
  tooltipTouchLongPress?: boolean
  styles?: Partial<CwChatShellNavStyles>
  texts?: Partial<CwChatShellNavTexts>
}

export interface CwChatShellNavEmits {
  (e: 'update:modelValue', key: string): void
  (e: 'change', key: string, item: CwChatShellTabItem): void
}

export interface CwChatShellMobileTabbarProps {
  modelValue: string
  items: CwChatShellTabItem[]
  disabled?: boolean
  readonly?: boolean
  tooltipShowDelay?: number
  tooltipOffset?: number
  styles?: Partial<CwChatShellMobileTabbarStyles>
  texts?: Partial<CwChatShellMobileTabbarTexts>
}

export interface CwChatShellMobileTabbarEmits {
  (e: 'update:modelValue', key: string): void
  (e: 'change', key: string, item: CwChatShellTabItem): void
}

export interface CwChatShellLayoutProps {
  modelValue: string
  navItems: CwChatShellTabItem[]
  mobileItems: CwChatShellTabItem[]
  showNav?: boolean
  navVisible?: boolean
  showMobileTabbar?: boolean
  /** 固定壳层高度（如 Admin 配置页 `900px`）；不传则占满视口 */
  frameHeight?: string
  navTooltipOffset?: number
  mobileTooltipOffset?: number
  /** 触屏宽屏侧栏：主导航与底栏「我的」长按显示 tooltip */
  navTooltipTouchLongPress?: boolean
}

export interface CwChatShellLayoutEmits {
  (e: 'update:modelValue', key: string): void
  (e: 'change', key: string, item: CwChatShellTabItem): void
}

export interface CwChatShellTabIconProps {
  item: CwChatShellTabItem
  active: boolean
  iconStyles: Record<string, unknown>
  mineAvatarSrc?: string
  mineAvatarText?: string
  mineAvatarFallbackSrc?: string
  mineAvatarStyles?: Record<string, unknown> | ((size: number) => Record<string, unknown>)
  /** 头像边长（rem）；默认 `CW_CHAT_SHELL_MINE_AVATAR_SIZE`（2 = 32px @16） */
  mineAvatarSize?: number
  minePlaceholderText?: string
  minePlaceholderClass?: string
}

export interface CwChatShellNavStyles {
  root: string
  tabbarWrap: string
  footer: string
}

export interface CwChatShellNavTexts {
  navAriaLabel: string
  tabbarLabel: string
}

export interface CwChatShellMobileTabbarStyles {
  root: string
}

export interface CwChatShellMobileTabbarTexts {
  tabbarLabel: string
}
