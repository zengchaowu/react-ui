import type { ComponentType, ReactNode, MutableRefObject, RefObject } from 'react'
export interface CwDesignToolRailItemConfig {
  key: string
  label: string
  /** CwIcon / iconfont 名（无 `icon-` 前缀）或 Vue 组件 */
  icon?: string | ComponentType<any>
  iconPrefix?: string
  shortcut?: string
  disabled?: boolean
  danger?: boolean
  /** 是否为切换型工具（跟随 activeKey 高亮） */
  toggle?: boolean
  /** 子菜单项；存在时渲染为下拉按钮 */
  menuItems?: CwDesignToolRailItemConfig[]
}

export interface CwDesignToolRailGroupConfig {
  id: string
  ariaLabel?: string
  /** 底部对齐（如文件/编辑操作） */
  align?: 'top' | 'bottom'
  items: CwDesignToolRailItemConfig[]
}

export interface CwDesignToolRailStyles {
  root: string
  leading: string
  /** top 顶栏：绝对居中的工具簇 */
  center: string
  scroll: string
  group: string
  divider: string
  item: string
  itemActive: string
  itemDanger: string
  footer: string
  menu: string
  menuItem: string
  menuItemLabel: string
  menuItemShortcut: string
  dropdownCaret: string
}

export interface CwDesignToolRailTexts {
  itemTooltipSuffix: string
}

export interface CwDesignToolRailProps {
  groups?: CwDesignToolRailGroupConfig[]
  activeKey?: string
  disabled?: boolean
  /** side：左侧竖条；top：顶部横条（类 Figma / Pixso） */
  placement?: 'side' | 'top'
  styles?: Partial<CwDesignToolRailStyles>
  texts?: Partial<CwDesignToolRailTexts>
}

export interface CwDesignToolRailEmits {
  'item-click': [item: CwDesignToolRailItemConfig]
}

export interface CwDesignToolRailItemSlotProps {
  item: CwDesignToolRailItemConfig
  active: boolean
  disabled: boolean
  onClick: () => void
}
