/** React 端占位：设计编辑器子组件当前仅在 Vue/Web 端提供。 */
export interface CwDesignPropertyPanelProps {
  /** 当前选中图层数量 */
  selectionCount?: number
  /** 只读模式 */
  readonly?: boolean
  className?: string
}

export interface CwDesignPropertyPanelEmits {
  onUpdate?: (patch: Record<string, unknown>) => void
  onAlign?: (mode: string) => void
  onDistribute?: (axis: string) => void
}
