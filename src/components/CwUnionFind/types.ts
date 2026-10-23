import type { MouseEvent as ReactMouseEvent } from 'react'

export interface CwUnionFindElement {
  id: string | number
  label: string
  parent?: string | number
  rank?: number
  size?: number
  [key: string]: unknown
}

export interface CwUnionFindSet {
  root: string | number
  members: (string | number)[]
  color?: string
}

export interface CwUnionFindProps {
  elements: CwUnionFindElement[]
  nodeWidth?: number
  nodeHeight?: number
  levelGap?: number
  siblingGap?: number
  nodeClass?: string
  rootNodeClass?: string
  textClass?: string
  edgeClass?: string
  showRank?: boolean
  showSize?: boolean
  autoColorSets?: boolean
  /**
   * 自定义文本对象
   */
  texts?: Partial<CwUnionFindTexts>
}

export interface CwUnionFindStyles {
  root: string
  container: string
  svg: string
  setLabel: string
  node: string
  nodeActive: string
  nodeRoot: string
  controls: string
  button: string
  buttonPrimary: string
  buttonSecondary: string
  buttonDanger: string
  input: string
  status: string
  edge: string
}

export interface CwUnionFindTexts {
  find: string
  union: string
  reset: string
  addNode: string
  removeNode: string
  findRoot: string
  unionSets: string
  status: string
  nodes: string
  sets: string
  operations: string
}

/** Emits（Vue defineEmits 的 React 回调等价） */
export interface CwUnionFindEmits {
  onNodeClick?: (element: CwUnionFindElement, event: ReactMouseEvent<Element>) => void
  onSetClick?: (set: CwUnionFindSet, event: ReactMouseEvent<Element>) => void
}
