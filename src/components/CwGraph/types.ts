export interface CwGraphNode {
  id: string | number
  label: string
  x?: number
  y?: number
  disabled?: boolean
  icon?: string
  [key: string]: any
}

export interface CwGraphEdge {
  id?: string | number
  source: string | number
  target: string | number
  label?: string
  weight?: number
  directed?: boolean
  [key: string]: any
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
   * 自定义样式对象
   */
  styles?: Partial<CwGraphStyles>
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwGraphTexts>
}

export interface CwGraphStyles {
  root: string
  container: string
  svg: string
  node: string
  nodeActive: string
  nodeLabel: string
  edge: string
  edgeActive: string
  arrow: string
  controls: string
  button: string
  buttonPrimary: string
  buttonSecondary: string
  buttonDanger: string
  input: string
  status: string
}

export interface CwGraphTexts {
  addNode: string
  removeNode: string
  addEdge: string
  removeEdge: string
  clear: string
  status: string
  nodes: string
  edges: string
  operations: string
}

export interface CwGraphEmits {
  'node-click': [node: CwGraphNode, event: MouseEvent]
  'edge-click': [edge: CwGraphEdge, event: MouseEvent]
  'node-drag': [node: CwGraphNode, x: number, y: number]
  'node-drag-end': [node: CwGraphNode, x: number, y: number]
}

