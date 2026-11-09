/** React 端占位：设计编辑器子组件当前仅在 Vue/Web 端提供。 */
export interface CwDesignViewportToolbarProps {
  /** 当前缩放百分比（100 = 1:1） */
  zoomPercent?: number
  /** 是否可撤销 */
  canUndo?: boolean
  /** 是否可重做 */
  canRedo?: boolean
  /** 只读模式 */
  readonly?: boolean
  className?: string
}

export interface CwDesignViewportToolbarEmits {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onFit?: () => void
  onReset?: () => void
  onUndo?: () => void
  onRedo?: () => void
}
