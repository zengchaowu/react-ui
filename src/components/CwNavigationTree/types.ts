import type { CwTreeNode } from '../CwTree/types'
import type { CwTreeStyles } from '../CwTree/types'
import type {  CwIconEmbed  } from '../CwIcon/types'

export type { CwTreeNode }

export interface CwNavigationTreeProps {
  /**
   * 树形导航数据
   */
  treeData: CwTreeNode[]
  /**
   * 受控的选中节点 key 数组
   */
  selectedKeys: (string | number)[]
  /**
   * 受控的展开节点 key 数组
   */
  expandedKeys: (string | number)[]
  /**
   * 点击节点行（除右侧箭头外）是否展开/折叠子级；默认 true。为 false 时仅能通过右侧箭头切换。
   */
  expandOnClickNode?: boolean
  /**
   * 子节点选中时是否高亮父节点（仅变色、无背景）；默认 true。
   */
  highlightParentOnChildSelected?: boolean
  /**
   * 自定义样式对象
   */
  styles?: Partial<CwNavigationTreeStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwNavigationTreeTexts>
}

export interface CwNavigationTreeStyles {
  /** 根容器样式 */
  root: string
  /** 展开时右侧箭头的旋转样式 */
  switcherIconExpanded: string
  /** CwTree 样式配置 */
  treeStyles?: Partial<CwTreeStyles>
  /** CwIcon 样式配置（节点图标） */
  iconStyles?: CwIconEmbed
  /** CwIcon 样式配置（右侧展开/折叠箭头） */
  switcherIconStyles?: CwIconEmbed
}

export interface CwNavigationTreeTexts {
  [key: string]: string | undefined
}

export interface CwNavigationTreeEmits {
  'update:selectedKeys': [keys: (string | number)[]]
  'update:expandedKeys': [keys: (string | number)[]]
  'node-select': [keys: (string | number)[], info: { node: CwTreeNode; selected: boolean }]
}
