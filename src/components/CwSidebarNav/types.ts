import type { HTMLAttributes, ReactNode } from 'react'
import type { CwSidebarNavItemKey, CwSidebarNavAppearance, CwSidebarNavTexts } from '@zengchaowu/ui-shared/components/CwSidebarNav/types'

export interface CwSidebarNavItem {
  key: CwSidebarNavItemKey
  label: string
  /** CwIcon name; custom icon via `iconSlot` */
  icon?: string
  iconMode?: 'font' | 'symbol'
  /** Show pin dot when `trailingSlot` is unused */
  pinned?: boolean
  disabled?: boolean
  /** Extra HTML attributes on the row button (e.g. data-* for context menus) */
  dataAttrs?: Record<string, string>
}

export interface CwSidebarNavSection {
  key?: string
  /** Section title; also used as collapse toggle label */
  label?: string
  collapsible?: boolean
  /** Default expanded for collapsible sections (default true) */
  defaultExpanded?: boolean
  items: CwSidebarNavItem[]
  /** Placeholder when items is empty */
  emptyText?: string
}

/** `section-label` 作用域插槽参数 */
export interface CwSidebarNavSectionLabelScope {
  section: CwSidebarNavSection
  expanded: boolean
}

/** `item` / `trailing` 作用域插槽参数 */
export interface CwSidebarNavItemScope {
  item: CwSidebarNavItem
  selected: boolean
  section: CwSidebarNavSection
}

/** `icon` 作用域插槽参数 */
export interface CwSidebarNavIconScope {
  item: CwSidebarNavItem
  section: CwSidebarNavSection
}

export interface CwSidebarNavProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'className' | 'children' | 'onChange' | 'onSelect'
  > {
  /** Active item key */
  value?: CwSidebarNavItemKey | null
  /** Multi-section; preferred over `items` when both set */
  sections?: CwSidebarNavSection[]
  /** Flat list without section headers */
  items?: CwSidebarNavItem[]
  iconSize?: number
  iconPrefix?: string
  ariaLabel?: string
  appearance?: CwSidebarNavAppearance
  texts?: Partial<CwSidebarNavTexts>
  /** `header` 插槽 */
  headerSlot?: ReactNode
  /** `footer` 插槽 */
  footerSlot?: ReactNode
  /** `section-label` 作用域插槽 */
  sectionLabelSlot?: (scope: CwSidebarNavSectionLabelScope) => ReactNode
  /** `item` 作用域插槽 */
  itemSlot?: (scope: CwSidebarNavItemScope) => ReactNode
  /** `icon` 作用域插槽 */
  iconSlot?: (scope: CwSidebarNavIconScope) => ReactNode
  /** `trailing` 作用域插槽 */
  trailingSlot?: (scope: CwSidebarNavIconScope) => ReactNode
  className?: string
  /** 对应 `update:modelValue` */
  onChange?: (value: CwSidebarNavItemKey) => void
  /** 对应 `select` */
  onSelect?: (item: CwSidebarNavItem, section: CwSidebarNavSection | null) => void
}

export interface CwSidebarNavEmits {
  onChange?: (value: CwSidebarNavItemKey) => void
  onSelect?: (item: CwSidebarNavItem, section: CwSidebarNavSection | null) => void
}
