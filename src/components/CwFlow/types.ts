import type { ComponentType } from 'react'
import type {
  CwFlowConnection,
  CwFlowEdge,
  CwFlowEdgeChange,
  CwFlowNode,
  CwFlowNodeChange,
  CwFlowNodeRendererProps,
  CwFlowTexts,
} from '@zengchaowu/ui-shared/components/CwFlow/types'

/** 自定义节点渲染器映射 */
export type CwFlowNodeTypes = Record<string, ComponentType<CwFlowNodeRendererProps>>

/** CwFlow 组件 props */
export interface CwFlowProps {
  nodes: CwFlowNode[]
  edges: CwFlowEdge[]
  nodeTypes?: CwFlowNodeTypes
  showMinimap?: boolean
  showControls?: boolean
  showBackground?: boolean
  disabled?: boolean
  fitViewOnInit?: boolean
  minZoom?: number
  maxZoom?: number
  texts?: CwFlowTexts
  className?: string
  onNodesChange?: (changes: CwFlowNodeChange[]) => void
  onEdgesChange?: (changes: CwFlowEdgeChange[]) => void
  onConnect?: (connection: CwFlowConnection) => void
  onNodeClick?: (node: CwFlowNode, event: MouseEvent) => void
}

/** 与 vue 侧同名的事件载荷类型（保证跨端导出对齐） */
export type CwFlowEmits = {
  nodesChange: [changes: CwFlowNodeChange[]]
  edgesChange: [changes: CwFlowEdgeChange[]]
  connect: [connection: CwFlowConnection]
  nodeClick: [node: CwFlowNode, event: MouseEvent]
}
