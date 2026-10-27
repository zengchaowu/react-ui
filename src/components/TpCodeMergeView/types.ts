import type { HTMLAttributes } from 'react'
import type { MergeView } from '@codemirror/merge'

export interface TpCodeMergeViewProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** 左侧（原内容 / before） */
  original?: string
  /** 右侧（新内容 / after） */
  modified?: string
  /** 编程语言（两侧共用） */
  language?: string
  /** 主题；auto 跟随 document 上 data-theme */
  theme?: 'light' | 'dark' | 'auto'
  /** 是否显示行号 */
  lineNumbers?: boolean
  /** 折叠大段未变更内容 */
  collapseUnchanged?: boolean | { margin?: number; minSize?: number }
  /** 是否高亮变更片段内的字符差 */
  highlightChanges?: boolean
  /** 高度 */
  height?: string | number
  /** 宽度 */
  width?: string | number
}

/** defineExpose 等价物：通过 ref 取到当前 MergeView 实例 */
export interface TpCodeMergeViewHandle {
  getMergeView: () => MergeView | null
}
