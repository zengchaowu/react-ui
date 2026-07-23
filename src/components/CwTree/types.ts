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
  [key: string]: any
}

export interface CwTreeProps {
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
   * - true: 文件夹可选中
   * - false: 文件夹不可选中，只能展开/折叠
   */
  folderSelectable?: boolean
  /**
   * 子元素选中时，父文件夹是否高亮（默认 false）
   * - true: 当子节点被选中时，父文件夹会高亮显示（文字和图标变色，但不添加背景）
   * - false: 不启用此功能
   */
  highlightParentOnChildSelected?: boolean
  /**
   * 是否允许多选（默认 true）
   * - true: 可多选（单击替换；Ctrl/Cmd 切换；Shift 范围选）
   * - false: 单选模式（整棵树最多只会有一个选中）
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
  size?: 'small' | 'medium' | 'large'
  /**
   * 自定义样式对象
   */
  styles?: Partial<CwTreeStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwTreeTexts>
  /**
   * 懒加载子节点。分支节点请显式设 `isLeaf: false` 且初始不传 `children`（或等首次展开时由本函数补全）；
   * 未配置 `loadData` 时行为与原先一致。加载期间在展开箭头列显示小号 loading，成功后展开。
   */
  loadData?: (node: CwTreeNode) => Promise<CwTreeNode[]>
}

export interface CwTreeStyles {
  root: string
  node: string
  nodeContent: string
  nodeContentSelected: string
  nodeContentHighlighted: string
  nodeContentDisabled: string
  nodeContentFocused: string
  nodeLabel: string
  nodeIcon: string
  nodeExtra: string
  nodeSwitcher: string
  /** 懒加载时 switcher 附加样式（宽度与 `nodeSwitcher` 一致，如 w-3） */
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
  'node-click': [node: CwTreeNode, event: MouseEvent]
  'node-select': [
    selectedKeys: (string | number)[],
    info: {
      node: CwTreeNode
      selected: boolean
      /** 多选时用于解析 Shift / Ctrl·Cmd */
      event?: MouseEvent | KeyboardEvent
    },
  ]
  'node-check': [checkedKeys: (string | number)[], info: { node: CwTreeNode; checked: boolean }]
  'node-expand': [expandedKeys: (string | number)[], info: { node: CwTreeNode; expanded: boolean }]
  'update:expandedKeys': [keys: (string | number)[]]
  'update:selectedKeys': [keys: (string | number)[]]
  'update:checkedKeys': [keys: (string | number)[]]
  'node-reorder': [
    payload: {
      dragKey: string | number
      dropKey: string | number
      position: 'before' | 'after' | 'inside'
    },
  ]
}
