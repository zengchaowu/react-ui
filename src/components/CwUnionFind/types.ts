import type { MouseEvent as ReactMouseEvent } from 'react'
import type { CwUnionFindTexts, CwUnionFindSet } from '@zengchaowu/ui-shared/components/CwUnionFind/types'

export interface CwUnionFindElement {
  id: string | number
  label: string
  parent?: string | number
  rank?: number
  size?: number
  [key: string]: unknown
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

/** Emits（Vue defineEmits 的 React 回调等价） */
export interface CwUnionFindEmits {
  onNodeClick?: (element: CwUnionFindElement, event: ReactMouseEvent<Element>) => void
  onSetClick?: (set: CwUnionFindSet, event: ReactMouseEvent<Element>) => void
}
