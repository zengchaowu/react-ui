import type { HTMLAttributes, ReactNode } from 'react'

/**
 * Chrome 风格标签页组件类型定义
 */
export interface CwChromeTabItem {
  /** 标签唯一标识 */
  id: string | number
  /** 标签显示文案 */
  label: string
  /** 图标 SVG 字符串（可选，如网站 favicon） */
  icon?: string
  /** 是否可关闭，默认根据组件 closable prop */
  closable?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 预览态（斜体弱化，如编辑器临时打开的文件） */
  preview?: boolean
}

/** 内部结构 class 槽位 */
export interface CwChromeTabStyleSlots {
  root: string
  bar: string
  addButton: string
  addIcon: string
  tab: string
  tabGap: string
  tabActive: string
  tabInactive: string
  tabDisabled: string
  tabLabel: string
  tabIcon: string
  tabIconSlot: string
  closeButton: string
  closeButtonFocus: string
  closeIcon: string
}

export type CwChromeTabStyles = CwChromeTabStyleSlots

export type CwChromeTabAppearance = 'default' | 'tab-strip'

export interface CwChromeTabTexts {
  /** 关闭按钮无障碍标签 */
  closeButtonLabel: string
  /** 添加标签按钮无障碍标签 */
  addButtonLabel: string
  /** 标签列表无障碍名称 */
  tablistLabel: string
  /** 右键：关闭当前标签 */
  closeTabMenuLabel: string
  /** 右键：关闭其他标签 */
  closeOtherTabsMenuLabel: string
  /** 右键：关闭右侧标签 */
  closeTabsToTheRightMenuLabel: string
  /** 右键：关闭全部标签 */
  closeAllTabsMenuLabel: string
}

/** `tab-icon` 作用域插槽参数 */
export interface CwChromeTabIconScope {
  tab: CwChromeTabItem
  index: number
}

export interface CwChromeTabProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'className' | 'children' | 'contextMenu' | 'onChange' | 'onClose' | 'onSelect'
  > {
  /** 标签列表 */
  tabs: CwChromeTabItem[]
  /** 当前激活的标签 id（对应 `v-model:activeId`） */
  activeId?: string | number | null
  /** 是否可关闭标签 */
  closable?: boolean
  /** 是否显示添加标签按钮 */
  addable?: boolean
  /**
   * 外观变体：
   * - `default`：通用 Chrome 标签栏
   * - `tab-strip`：IDE 编辑区 / 对话标签条
   */
  appearance?: CwChromeTabAppearance
  /** 自定义文案 */
  texts?: Partial<CwChromeTabTexts>
  /** 是否启用标签右键菜单（关闭 / 关闭其他 / 关闭右侧 / 关闭全部），默认开启 */
  contextMenu?: boolean
  /** 标签顶部是否圆角，可传入圆角大小，如 'md' 'lg' 'xl' '2xl'，默认 ''（无圆角） */
  topRounded?: string
  /** `tab-icon` 作用域插槽 */
  tabIconSlot?: (scope: CwChromeTabIconScope) => ReactNode
  className?: string
  /** 对应 `update:activeId` */
  onActiveIdChange?: (id: string | number | null) => void
  /** 对应 `close` */
  onClose?: (id: string | number, index: number) => void
  /** 对应 `close-others` */
  onCloseOthers?: (keepId: string | number, ids: Array<string | number>) => void
  /** 对应 `close-to-the-right` */
  onCloseToTheRight?: (id: string | number, ids: Array<string | number>) => void
  /** 对应 `close-all` */
  onCloseAll?: (ids: Array<string | number>) => void
  /** 对应 `add` */
  onAdd?: () => void
  /** 对应 `change` */
  onChange?: (
    id: string | number | null,
    index: number,
    tab: CwChromeTabItem | null,
  ) => void
  /** 对应 `reorder` */
  onReorder?: (
    tabs: CwChromeTabItem[],
    draggedId: string | number,
    fromIndex: number,
    toIndex: number,
  ) => void
}

export interface CwChromeTabEmits {
  onActiveIdChange?: (id: string | number | null) => void
  onClose?: (id: string | number, index: number) => void
  onCloseOthers?: (keepId: string | number, ids: Array<string | number>) => void
  onCloseToTheRight?: (id: string | number, ids: Array<string | number>) => void
  onCloseAll?: (ids: Array<string | number>) => void
  onAdd?: () => void
  onChange?: (
    id: string | number | null,
    index: number,
    tab: CwChromeTabItem | null,
  ) => void
  onReorder?: (
    tabs: CwChromeTabItem[],
    draggedId: string | number,
    fromIndex: number,
    toIndex: number,
  ) => void
}
