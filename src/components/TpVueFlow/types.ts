import type {
  Node as FlowNode,
  Edge as FlowEdge,
  Connection,
  NodeChange,
  EdgeChange,
  NodeTypes,
} from '@xyflow/react'
import type { TpVueFlowTexts } from '@zengchaowu/ui-shared/components/TpVueFlow/types'

export type {
  Node as TpVueFlowNode,
  Edge as TpVueFlowEdge,
  Connection as TpVueFlowConnection,
  NodeChange as TpVueFlowNodeChange,
  EdgeChange as TpVueFlowEdgeChange,
  NodeTypes as TpVueFlowNodeTypes,
} from '@xyflow/react'

export interface TpVueFlowProps {
  /** 节点数据 */
  nodes: FlowNode[]
  /** 边数据 */
  edges: FlowEdge[]
  /** 自定义节点类型 */
  nodeTypes?: NodeTypes
  /** 是否显示小地图 */
  showMinimap?: boolean
  /** 是否显示控制面板 */
  showControls?: boolean
  /** 是否显示背景 */
  showBackground?: boolean
  /** 是否禁用（React Flow 无整体 disabled，映射为 nodesDraggable/nodesConnectable/elementsSelectable=false） */
  disabled?: boolean
  /** 容器自定义类名（对应 Vue attrs.class） */
  className?: string
  /**
   * 自定义文本对象
   */
  texts?: TpVueFlowTexts
  /** 节点变化事件（对应 Vue `nodesChange`） */
  onNodesChange?: (changes: NodeChange[]) => void
  /** 边变化事件（对应 Vue `edgesChange`） */
  onEdgesChange?: (changes: EdgeChange[]) => void
  /** 连接事件（对应 Vue `connect`） */
  onConnect?: (connection: Connection) => void
}
