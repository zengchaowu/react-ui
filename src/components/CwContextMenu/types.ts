import type { Placement } from '@zengchaowu/shared/types/placement'

export type CwContextMenuLayout = 'list' | 'toolbar'

/**
 * 外观变体（替代原 styles 预设）：
 * - `default`：通用列表菜单
 * - `attach`：附件 / IM 会话右键
 * - `toolbar`：移动端消息工具条（通常配合 `layout: 'toolbar'`）
 * - `launcher`：桌面启动器毛玻璃菜单
 */
export type CwContextMenuAppearance = 'default' | 'attach' | 'toolbar' | 'launcher'

export interface CwContextMenuItem {
  /** `select` 事件载荷，需唯一 */
  key: string
  label: string
  /**
   * 可选：iconfont 图标名（与 `CwIcon` 的 `name` 一致，如 `common--action--fuzhi`）
   */
  icon?: string
  /** 与 `CwIcon.prefix` 一致，默认 `icon` */
  iconPrefix?: string
  disabled?: boolean
  /** 警示样式（如删除） */
  danger?: boolean
  /** 在该项之后渲染细分隔线 */
  dividerAfter?: boolean
}

/** 内部结构类（不对外暴露 styles 覆盖） */
export interface CwContextMenuStyles {
  root: string
  panel: string
  item: string
  itemDanger: string
  itemDisabled: string
  divider: string
}

export interface CwContextMenuTexts {
  /** 无 `items` 且未提供 `#menu` 插槽时的空状态（开发提示，正常不应可见） */
  emptyMenu: string
}

export interface CwContextMenuProps {
  /**
   * 为 true 时不渲染包裹插槽的根节点，仅保留 Teleport 面板；由父级在 `contextmenu` 等事件中调用 `openAt`。
   * 用于列表委托、整表共享一个菜单实例，避免每条目挂载一套菜单。
   */
  detachTrigger?: boolean
  /**
   * 菜单项；与 `#menu` 插槽二选一（插槽优先于空列表）
   */
  items?: CwContextMenuItem[]
  /**
   * 菜单相对指针出现的方位（仅影响初次坐标，仍会经视口夹紧修正）
   * @default 'bottom-start'
   */
  placement?: Placement
  /** 距离视口边缘的最小留白（px） */
  viewportPadding?: number
  /**
   * 是否显示菜单面板阴影
   * @default true
   */
  shadow?: boolean
  /** 外观变体；禁止 styles */
  appearance?: CwContextMenuAppearance
  texts?: Partial<CwContextMenuTexts>
}

export interface CwContextMenuEmits {
  (e: 'select', key: string, item: CwContextMenuItem): void
  (e: 'open', payload: { clientX: number; clientY: number }): void
  (e: 'close'): void
  (e: 'update:visible', visible: boolean): void
}
