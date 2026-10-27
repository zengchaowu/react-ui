
import type { CwDataTreeTexts } from '@zengchaowu/ui-shared/components/CwDataTree/types'

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

export interface CwDataTreeEmits {
  onNodeClick?: (node: CwDataTreeNode, event: MouseEvent) => void
  onNodeExpand?: (node: CwDataTreeNode) => void
  onNodeCollapse?: (node: CwDataTreeNode) => void
  onUpdateExpandedKeys?: (keys: (string | number)[]) => void
}
