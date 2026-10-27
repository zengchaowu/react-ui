import type { CSSProperties, ReactNode } from 'react'
import type { CwTabbarItem } from '../CwTabbar/types'
import type { CwIconEmbed } from '@zengchaowu/ui-shared/components/CwIcon/types'
import type { CwChatShellNavTexts, CwChatShellMobileTabbarTexts } from '@zengchaowu/ui-shared/components/CwChatShell/types'

/** Chat 壳层 Tab 项（兼容 iconfont + CwTabbar） */
export interface CwChatShellTabItem extends CwTabbarItem {
  iconName?: string
  iconActiveName?: string
  iconMode?: 'font' | 'symbol'
  useMineAvatar?: boolean
}

/** `item-icon` 作用域插槽参数 */
export interface CwChatShellItemIconSlotScope {
  item: CwChatShellTabItem
  active: boolean
  iconStyles: CwIconEmbed
}

export interface CwChatShellNavProps {
  /** 当前选中项（对应 Vue `modelValue`） */
  value: string
  items: CwChatShellTabItem[]
  disabled?: boolean
  readonly?: boolean
  tabbarSize?: 'md' | 'lg'
  tooltipShowDelay?: number
  tooltipOffset?: number
  /** 触屏宽屏侧栏：Tab 长按显示 tooltip */
  tooltipTouchLongPress?: boolean
  texts?: Partial<CwChatShellNavTexts>
  /** 追加到根节点的 class（对应 Vue `$attrs.class`） */
  className?: string
  /** 根节点内联样式（供 Layout 实现 `v-show` 的 display 切换） */
  style?: CSSProperties
  /** `item-icon` 作用域插槽 */
  itemIconSlot?: (scope: CwChatShellItemIconSlotScope) => ReactNode
  /** `footer` 具名插槽 */
  footerSlot?: ReactNode
  /** 对应 Vue `update:modelValue` */
  onUpdateModelValue?: (key: string) => void
  /** 对应 Vue `change` */
  onChange?: (key: string, item: CwChatShellTabItem) => void
}

export interface CwChatShellMobileTabbarProps {
  /** 当前选中项（对应 Vue `modelValue`） */
  value: string
  items: CwChatShellTabItem[]
  disabled?: boolean
  readonly?: boolean
  tooltipShowDelay?: number
  tooltipOffset?: number
  texts?: Partial<CwChatShellMobileTabbarTexts>
  /** 追加到根节点的 class（对应 Vue `$attrs.class`） */
  className?: string
  /** `item-icon` 作用域插槽 */
  itemIconSlot?: (scope: CwChatShellItemIconSlotScope) => ReactNode
  /** 对应 Vue `update:modelValue` */
  onUpdateModelValue?: (key: string) => void
  /** 对应 Vue `change` */
  onChange?: (key: string, item: CwChatShellTabItem) => void
}

export interface CwChatShellLayoutProps {
  /** 当前选中项（对应 Vue `modelValue`） */
  value: string
  navItems: CwChatShellTabItem[]
  mobileItems: CwChatShellTabItem[]
  showNav?: boolean
  navVisible?: boolean
  showMobileTabbar?: boolean
  /** 固定壳层高度（如 `900px`）；不传则占满视口 */
  frameHeight?: string
  navTooltipOffset?: number
  mobileTooltipOffset?: number
  /** 触屏宽屏侧栏：主导航与底栏「我的」长按显示 tooltip */
  navTooltipTouchLongPress?: boolean
  /** `item-icon` 作用域插槽 */
  itemIconSlot?: (scope: CwChatShellItemIconSlotScope) => ReactNode
  /** `footer` 具名插槽 */
  footerSlot?: ReactNode
  /** `main` 具名插槽 */
  mainSlot?: ReactNode
  /** 对应 Vue `update:modelValue` */
  onUpdateModelValue?: (key: string) => void
  /** 对应 Vue `change` */
  onChange?: (key: string, item: CwChatShellTabItem) => void
}

export interface CwChatShellTabIconProps {
  item: CwChatShellTabItem
  active: boolean
  iconStyles: CwIconEmbed
  mineAvatarSrc?: string
  mineAvatarText?: string
  mineAvatarFallbackSrc?: string
  /** 头像边长（rem）；默认 `CW_CHAT_SHELL_MINE_AVATAR_SIZE`（2 = 32px @16） */
  mineAvatarSize?: number
  minePlaceholderText?: string
  minePlaceholderClass?: string
  /** `avatar-badge` 具名插槽 */
  avatarBadgeSlot?: ReactNode
  /** `avatar-overlay` 具名插槽 */
  avatarOverlaySlot?: ReactNode
}

export interface CwChatShellTabbarIconProps {
  item: CwChatShellTabItem
  active: boolean
  iconStyles: CwIconEmbed
  mineAvatarSrc?: string
  mineAvatarText?: string
  mineAvatarFallbackSrc?: string
  mineAvatarSize?: number
  mineAvatarLoading?: boolean
  connDotState?: 'connected' | 'connecting' | 'disconnected' | 'muted'
  connDotTitle?: string
  showConnDot?: boolean
}

export interface CwChatShellNavMineFooterProps {
  active?: boolean
  avatarSrc?: string
  avatarText?: string
  avatarFallbackSrc?: string
  loading?: boolean
  connDotState?: 'connected' | 'connecting' | 'disconnected' | 'muted'
  connDotTitle?: string
  showConnDot?: boolean
  tooltipShowDelay?: number
  tooltipOffset?: number
  tooltipTouchLongPress?: boolean
  /** 对应 Vue `click` */
  onClick?: () => void
}

export interface CwChatShellConnDotProps {
  state?: 'connected' | 'connecting' | 'disconnected' | 'muted'
  tabbar?: boolean
  title?: string
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwChatShellLayoutEmits {
  (e: 'update:modelValue', key: string): void
  (e: 'change', key: string, item: CwChatShellTabItem): void
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwChatShellMobileTabbarEmits {
  (e: 'update:modelValue', key: string): void
  (e: 'change', key: string, item: CwChatShellTabItem): void
}

/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwChatShellNavEmits {
  (e: 'update:modelValue', key: string): void
  (e: 'change', key: string, item: CwChatShellTabItem): void
}
