import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import type { CwTreeNode, CwTreeReorderPayload } from '../CwTree/types'

export interface CwDesignLayersPanelTexts {
  title: string
  sizeColumnLabel: string
  /** 当前已全部展开时的按钮提示 */
  collapseAllGroups: string
  /** 当前未全部展开时的按钮提示 */
  expandAllGroups: string
  lockLayer: string
  unlockLayer: string
  hideLayer: string
  showLayer: string
  searchPlaceholder: string
  emptySearch: string
  emptyLayers: string
  renamePlaceholder: string
}

export interface CwDesignLayersPanelStyles {
  root: string
  header: string
  headerTitle: string
  headerActions: string
  headerMeta: string
  expandToggle: string
  search: string
  treeWrap: string
  empty: string
  labelText: string
  labelTextHidden: string
  labelInput: string
  rowActions: string
  rowAction: string
  rowActionActive: string
}

export interface CwDesignLayersPanelProps {
  data?: CwTreeNode[]
  selectedKeys?: (string | number)[]
  selectable?: boolean
  searchable?: boolean
  /** 双击图层名进入重命名 */
  renameable?: boolean
  /** 是否允许拖拽调整同级图层顺序 */
  reorderable?: boolean
  /** 是否显示锁定 / 显示隐藏操作（默认 true） */
  layerActions?: boolean
  searchPlaceholder?: string
  defaultExpandAll?: boolean
  /** `embedded`：嵌入左栏 tabs 内，无独立侧栏壳（搜索由外层提供） */
  layout?: 'default' | 'embedded'
  texts?: Partial<CwDesignLayersPanelTexts>
  /** 等价 Vue 作用域插槽 `extra`（返回节点即覆盖默认行尾操作） */
  extraSlot?: (scope: { node: CwTreeNode }) => ReactNode
  /** 额外 class，合并到根节点（Vue 为透传 attrs.class） */
  className?: string
  /** 等价 Vue `update:selectedKeys` */
  onSelectedKeysChange?: (keys: (string | number)[]) => void
  /** 等价 Vue `update:search` */
  onSearchChange?: (query: string) => void
  /** 等价 Vue `rename` */
  onRename?: (key: string | number, name: string) => void
  /** 等价 Vue `toggle-visible` */
  onToggleVisible?: (key: string | number) => void
  /** 等价 Vue `toggle-locked` */
  onToggleLocked?: (key: string | number) => void
  /** 等价 Vue `reorder` */
  onReorder?: (payload: CwTreeReorderPayload) => void
  /** 等价 Vue `node-contextmenu` */
  onNodeContextmenu?: (
    node: CwTreeNode,
    event: ReactMouseEvent<HTMLElement>,
  ) => void
}


/** Vue 事件签名兼容导出（React 侧以同名 onXxx 回调使用） */
export interface CwDesignLayersPanelEmits {
  'update:selectedKeys': [keys: (string | number)[]]
  'update:search': [query: string]
  rename: [key: string | number, name: string]
  'toggle-visible': [key: string | number]
  'toggle-locked': [key: string | number]
  reorder: [
    payload: {
      dragKey: string | number
      dropKey: string | number
      position: 'before' | 'after' | 'inside'
    },
  ]
  'node-contextmenu': [node: CwTreeNode, event: MouseEvent]
}

