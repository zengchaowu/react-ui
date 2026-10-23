import type { HTMLAttributes, ReactNode } from 'react'

/**
 * 二级 Tab：轻量标签样式，支持 activeTab 受控。
 */
export interface CwSecondaryTabItem {
  label: string
  value: string | number
  disabled?: boolean
  /** 可选的数值（用于 stats 变体中展示，如客户数量） */
  count?: number
}

export interface CwSecondaryTabsStyles {
  root: string
  rootEqualWidth: string
  rootStats: string
  tab: string
  tabEqualWidth: string
  tabStats: string
  tabActive: string
  tabDisabled: string
  tabText: string
  tabTextStats: string
}

export interface CwSecondaryTabsTexts {
  tablistLabel?: string
}

/** 自定义 Tab 内容（对应 Vue 作用域插槽 `tab`） */
export interface CwSecondaryTabsTabScope {
  tab: CwSecondaryTabItem
}

export interface CwSecondaryTabsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** 当前选中 tab（对应 `v-model:activeTab`） */
  activeTab: string | number
  /** tab 列表 */
  tabs: CwSecondaryTabItem[]
  /** 是否等分宽度，默认 false（自适应内容宽度） */
  equalWidth?: boolean
  /** 外观变体：default 默认灰色底；stats 白色底、小字号 */
  variant?: 'default' | 'stats'
  texts?: Partial<CwSecondaryTabsTexts>
  /** 具名作用域插槽 `tab` */
  tabSlot?: ReactNode | ((scope: CwSecondaryTabsTabScope) => ReactNode)
  /** 选中 tab 变化（对应 `update:activeTab`） */
  onActiveTabChange?: (value: string | number) => void
  /** 切换事件（对应 `change`） */
  onChange?: (value: string | number) => void
}

export interface CwSecondaryTabsEmits {
  onActiveTabChange?: (value: string | number) => void
  onChange?: (value: string | number) => void
}
