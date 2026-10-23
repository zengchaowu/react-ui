import type {
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react'

export interface CwTreeNode {
  key: string | number
  label: string
  children?: CwTreeNode[]
  /** 为 `false` 且未设 `children` 时表示懒加载分支，需配 `CwTree` 的 `loadData` */
  isLeaf?: boolean
  disabled?: boolean
  icon?: string
  checkable?: boolean
  selectable?: boolean
  /**
   * 标签加粗（字号随树 `size`，不放大）。用于工作区根等需强调的节点。
   */
  labelStrong?: boolean
  /** 拖拽排序时是否允许拖入该节点内部 */
  acceptDropInside?: boolean
  [key: string]: unknown
}

export type CwTreeSize = 'small' | 'medium' | 'large'

export interface CwTreeSelectInfo {
  node: CwTreeNode
  selected: boolean
  /** 多选时用于解析 Shift / Ctrl·Cmd */
  event?: CwTreeInteractionEvent
}

export interface CwTreeCheckInfo {
  node: CwTreeNode
  checked: boolean
}

export interface CwTreeExpandInfo {
  node: CwTreeNode
  expanded: boolean
}

export interface CwTreeReorderPayload {
  dragKey: string | number
  dropKey: string | number
  position: 'before' | 'after' | 'inside'
}

export type CwTreeInteractionEvent =
  | ReactMouseEvent<HTMLElement>
  | ReactKeyboardEvent<HTMLElement>

/** `icon` / `extra` / `label` 作用域插槽参数 */
export interface CwTreeNodeScope {
  node: CwTreeNode
}

export interface CwTreeProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    | 'children'
    | 'className'
    | 'onChange'
    | 'onClick'
    | 'onContextMenu'
    | 'onSelect'
    | 'draggable'
  > {
  /**
   * 树形数据
   */
  data?: CwTreeNode[]
  /**
   * 默认展开所有节点
   */
  defaultExpandAll?: boolean
  /**
   * 默认展开的节点 key 数组
   */
  defaultExpandedKeys?: (string | number)[]
  /**
   * 受控的展开节点 key 数组
   */
  expandedKeys?: (string | number)[]
  /**
   * 默认选中的节点 key 数组
   */
  defaultSelectedKeys?: (string | number)[]
  /**
   * 受控的选中节点 key 数组
   */
  selectedKeys?: (string | number)[]
  /**
   * 默认勾选的节点 key 数组
   */
  defaultCheckedKeys?: (string | number)[]
  /**
   * 受控的勾选节点 key 数组
   */
  checkedKeys?: (string | number)[]
  /**
   * 是否显示复选框
   */
  checkable?: boolean
  /**
   * 是否可选择
   */
  selectable?: boolean
  /**
   * 文件夹（有子节点的节点）是否可选中（默认 true）
   */
  folderSelectable?: boolean
  /**
   * 子元素选中时，父文件夹是否高亮（默认 false）
   */
  highlightParentOnChildSelected?: boolean
  /**
   * 是否允许多选（默认 true）
   */
  multiple?: boolean
  /**
   * 是否显示连接线
   */
  showLine?: boolean
  /**
   * 是否显示图标
   */
  showIcon?: boolean
  /**
   * 节点前是否显示展开/折叠图标
   */
  switcherIcon?: boolean
  /**
   * 叶子节点是否预留与展开箭头同宽的空白占位（默认 true）
   */
  reserveLeafSwitcherSpace?: boolean
  /**
   * 点击节点时是否展开/折叠（默认 false）
   */
  expandOnClickNode?: boolean
  /**
   * 手风琴模式，同级节点最多只能有一个展开（默认 false）
   */
  accordion?: boolean
  /**
   * 节点缩进距离（像素）
   */
  indentSize?: number
  /**
   * 是否允许将节点作为 HTML5 拖拽源（例如拖入输入框）
   */
  draggable?: boolean
  /**
   * 是否允许在树内拖拽调整同级顺序
   */
  reorderable?: boolean
  /**
   * 判断节点是否可拖拽；未传且 `draggable` 为 true 时默认可拖全部节点
   */
  nodeDraggable?: (node: CwTreeNode) => boolean
  /**
   * 树形组件尺寸
   */
  size?: CwTreeSize
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwTreeTexts>
  /**
   * 懒加载子节点
   */
  loadData?: (node: CwTreeNode) => Promise<CwTreeNode[]>
  /**
   * 递增后：清空懒加载缓存，并对当前已展开的懒加载分支重新 `loadData`
   */
  lazyReloadToken?: number
  /**
   * 虚拟滚动：仅渲染视口内可见行
   */
  virtualScroll?: boolean
  /**
   * 虚拟滚动上下缓冲行数（默认 5）
   */
  virtualBuffer?: number
  /** `icon` 作用域插槽 */
  iconSlot?: (scope: CwTreeNodeScope) => ReactNode
  /** `extra` 作用域插槽 */
  extraSlot?: (scope: CwTreeNodeScope) => ReactNode
  /** `label` 作用域插槽 */
  labelSlot?: (scope: CwTreeNodeScope) => ReactNode
  className?: string
  onNodeClick?: (node: CwTreeNode, event: CwTreeInteractionEvent) => void
  onNodeContextmenu?: (node: CwTreeNode, event: ReactMouseEvent<HTMLElement>) => void
  onNodeSelect?: (
    selectedKeys: (string | number)[],
    info: CwTreeSelectInfo,
  ) => void
  onNodeCheck?: (checkedKeys: (string | number)[], info: CwTreeCheckInfo) => void
  onNodeExpand?: (expandedKeys: (string | number)[], info: CwTreeExpandInfo) => void
  onUpdateExpandedKeys?: (keys: (string | number)[]) => void
  onUpdateSelectedKeys?: (keys: (string | number)[]) => void
  onUpdateCheckedKeys?: (keys: (string | number)[]) => void
  onNodeReorder?: (payload: CwTreeReorderPayload) => void
}

/** @internal */
export interface CwTreeStyles {
  root: string
  node: string
  nodeContent: string
  nodeContentSelected: string
  nodeContentHighlighted: string
  nodeContentDisabled: string
  nodeContentFocused: string
  nodeLabel: string
  /** 与 `CwTreeNode.labelStrong` 对应：稍小字号 + 大写加粗 */
  nodeLabelStrong: string
  nodeIcon: string
  nodeExtra: string
  nodeSwitcher: string
  /** 懒加载时 switcher 附加样式 */
  nodeSwitcherLazyLoading: string
  nodeSwitcherHighlighted: string
  nodeSwitcherIcon: string
  nodeSwitcherExpanded: string
  nodeSwitcherCollapsed: string
  nodeCheckbox: string
  nodeChildren: string
  nodeChildrenOpen: string
  nodeChildrenContent: string
  line: string
  lineHorizontal: string
  lineVertical: string
  nodeDropBefore: string
  nodeDropAfter: string
  /** 拖入节点内部（如容器） */
  nodeDropInside: string
  /** 尺寸样式：小 */
  sizeSmall: string
  /** 尺寸样式：中 */
  sizeMedium: string
  /** 尺寸样式：大 */
  sizeLarge: string
}

export interface CwTreeTexts {
  expand: string
  collapse: string
  select: string
  unselect: string
}

export interface CwTreeEmits {
  onNodeClick?: (node: CwTreeNode, event: CwTreeInteractionEvent) => void
  onNodeContextmenu?: (node: CwTreeNode, event: ReactMouseEvent<HTMLElement>) => void
  onNodeSelect?: (
    selectedKeys: (string | number)[],
    info: CwTreeSelectInfo,
  ) => void
  onNodeCheck?: (checkedKeys: (string | number)[], info: CwTreeCheckInfo) => void
  onNodeExpand?: (expandedKeys: (string | number)[], info: CwTreeExpandInfo) => void
  onUpdateExpandedKeys?: (keys: (string | number)[]) => void
  onUpdateSelectedKeys?: (keys: (string | number)[]) => void
  onUpdateCheckedKeys?: (keys: (string | number)[]) => void
  onNodeReorder?: (payload: CwTreeReorderPayload) => void
}
