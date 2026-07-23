/**
 * 二级 Tab：轻量标签样式，支持 activeTab 双向绑定。
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

export interface CwSecondaryTabsProps {
  /** 当前选中 tab（v-model:activeTab） */
  activeTab: string | number
  /** tab 列表 */
  tabs: CwSecondaryTabItem[]
  /** 是否等分宽度，默认 false（自适应内容宽度） */
  equalWidth?: boolean
  /** 外观变体：default 默认灰色底；stats 白色底、小字号 */
  variant?: 'default' | 'stats'
  styles?: Partial<CwSecondaryTabsStyles>
  texts?: Partial<CwSecondaryTabsTexts>
}

export interface CwSecondaryTabsEmits {
  (e: 'update:activeTab', value: string | number): void
  (e: 'change', value: string | number): void
}
