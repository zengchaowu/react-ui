import type { CwIconEmbed } from '../CwIcon/types'

export interface CwDataTreeNode {
  id: string | number
  label: string
  children?: CwDataTreeNode[]
  disabled?: boolean
  icon?: string
  [key: string]: unknown
}

export interface CwDataTreeProps {
  data: CwDataTreeNode[]
  defaultExpandAll?: boolean
  expandedKeys?: (string | number)[]
  nodeWidth?: number
  nodeHeight?: number
  levelGap?: number
  siblingGap?: number
  showConnector?: boolean
  connectorStyle?: 'straight' | 'bezier' | 'step'
  nodeClass?: string
  textClass?: string
  lineClass?: string
  buttonClass?: string
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwDataTreeTexts>
}

/** @internal */
export interface CwDataTreeStyles {
  root: string
  container: string
  svg: string
  node: string
  nodePosition: string
  nodeWrapper: string
  nodeContent: string
  nodeContentFocused: string
  nodeContentDisabled: string
  nodeInner: string
  nodeText: string
  line: string
  buttonWrapper: string
  button: string
  buttonFocused: string
  buttonDisabled: string
  iconCollapsed: string
  iconExpanded: string
  /** CwIcon 样式配置（展开/折叠图标） */
  iconStyles?: CwIconEmbed
}

export interface CwDataTreeTexts {
  addNode: string
  removeNode: string
  addChild: string
  removeChild: string
  status: string
  nodes: string
  operations: string
  expand: string
  collapse: string
}

export interface CwDataTreeEmits {
  onNodeClick?: (node: CwDataTreeNode, event: MouseEvent) => void
  onNodeExpand?: (node: CwDataTreeNode) => void
  onNodeCollapse?: (node: CwDataTreeNode) => void
  onUpdateExpandedKeys?: (keys: (string | number)[]) => void
}
