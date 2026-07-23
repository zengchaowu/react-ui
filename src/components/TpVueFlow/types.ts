import type { Node as FlowNode, Edge as FlowEdge, Connection, NodeChange, EdgeChange, NodeTypesObject } from '@vue-flow/core'

export interface TpVueFlowProps {
  /** 节点数据 */
  nodes: FlowNode[]
  /** 边数据 */
  edges: FlowEdge[]
  /** 自定义节点类型 */
  nodeTypes?: NodeTypesObject
  /** 是否显示小地图 */
  showMinimap?: boolean
  /** 是否显示控制面板 */
  showControls?: boolean
  /** 是否显示背景 */
  showBackground?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /**
   * 自定义样式对象
   */
  styles?: TpVueFlowStyles
  /**
   * 自定义文本对象
   */
  texts?: TpVueFlowTexts
}

export interface TpVueFlowStyles {
  root: string
  rootDisabled: string
}

export interface TpVueFlowTexts {
  // TpVueFlow组件本身没有硬编码文本
}

export type TpVueFlowEmits = {
  /** 节点变化事件 */
  'nodesChange': [payload: NodeChange[]]
  /** 边变化事件 */
  'edgesChange': [payload: EdgeChange[]]
  /** 连接事件 */
  'connect': [connection: Connection]
}