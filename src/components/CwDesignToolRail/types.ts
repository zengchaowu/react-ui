import type { ComponentType, ReactNode } from 'react'

export interface CwDesignToolRailItemConfig {
  key: string
  label: string
  /** CwIcon / iconfont 名（无 `icon-` 前缀）或 React 组件 */
  icon?: string | ComponentType
  iconPrefix?: string
  shortcut?: string
  disabled?: boolean
  danger?: boolean
  /** 是否为切换型工具（跟随 activeKey 高亮） */
  toggle?: boolean
  /** 菜单项后分隔线（下拉列表） */
  dividerAfter?: boolean
  /** 子菜单项；存在时渲染为下拉按钮，或作为嵌套子菜单 */
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
  dropdownCaret: string
}

export interface CwDesignToolRailTexts {
  itemTooltipSuffix: string
}

export interface CwDesignToolRailItemSlotProps {
  item: CwDesignToolRailItemConfig
  active: boolean
  disabled: boolean
  onClick: () => void
}

export interface CwDesignToolRailProps {
  groups?: CwDesignToolRailGroupConfig[]
  activeKey?: string
  disabled?: boolean
  /** side：左侧竖条；top：顶部横条（类 Figma / Pixso） */
  placement?: 'side' | 'top'
  /**
   * 下拉箭头尺寸（rem）。未传时约为图标尺寸的一半。
   */
  dropdownCaretSize?: number
  texts?: Partial<CwDesignToolRailTexts>
  /** 等价 Vue 具名插槽 `leading` */
  leadingSlot?: ReactNode
  /**
   * 等价 Vue 动态具名插槽 `item-{key}`（以 item.key 为 key）；
   * 返回节点即覆盖默认按钮渲染。
   */
  itemSlots?: Record<
    string,
    ReactNode | ((scope: CwDesignToolRailItemSlotProps) => ReactNode)
  >
  /** 额外 class，合并到根节点（Vue 为透传 attrs.class） */
  className?: string
  /** 等价 Vue `item-click` */
  onItemClick?: (item: CwDesignToolRailItemConfig) => void
}


/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwDesignToolRailEmits {
  'item-click': [item: CwDesignToolRailItemConfig]
}

