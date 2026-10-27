import type { MouseEvent as ReactMouseEvent } from 'react'
import type { CwGraphTexts } from '@zengchaowu/ui-shared/components/CwGraph/types'

export interface CwGraphNode {
  id: string | number
  label: string
  x?: number
  y?: number
  disabled?: boolean
  icon?: string
  [key: string]: unknown
}

export interface CwGraphEdge {
  id?: string | number
  source: string | number
  target: string | number
  label?: string
  weight?: number
  directed?: boolean
  [key: string]: unknown
}

export interface CwGraphProps {
  nodes: CwGraphNode[]
  edges: CwGraphEdge[]
  nodeWidth?: number
  nodeHeight?: number
  directed?: boolean
  showEdgeLabel?: boolean
  showEdgeWeight?: boolean
  nodeClass?: string
  textClass?: string
  edgeClass?: string
  edgeLabelClass?: string
  arrowClass?: string
  autoLayout?: boolean
  layoutIterations?: number
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwGraphTexts>
}

/** Emits（Vue defineEmits 的 React 回调等价） */
export interface CwGraphEmits {
  onNodeClick?: (node: CwGraphNode, event: ReactMouseEvent<Element>) => void
  onEdgeClick?: (edge: CwGraphEdge, event: ReactMouseEvent<Element>) => void
  onNodeDrag?: (node: CwGraphNode, x: number, y: number) => void
  onNodeDragEnd?: (node: CwGraphNode, x: number, y: number) => void
}
