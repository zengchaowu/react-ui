/** React 端占位：设计编辑器子组件当前仅在 Vue/Web 端提供。 */
export interface CwDesignPageLayersPanelProps {
  /** 当前活动页 id */
  activePageId?: string
  /** 当前选中图层数量 */
  selectionCount?: number
  /** 只读模式 */
  readonly?: boolean
  className?: string
}

export interface CwDesignPageItem {
  id: string
  name: string
}

export interface CwDesignPageLayersPanelEmits {
  onSelectPage?: (id: string) => void
  onAddPage?: () => void
  onRemovePage?: (id: string) => void
  onRenamePage?: (id: string, name: string) => void
  onSelectLayer?: (id: string, additive: boolean) => void
  onRenameLayer?: (id: string, name: string) => void
  onToggleVisible?: (id: string, visible: boolean) => void
  onToggleLocked?: (id: string, locked: boolean) => void
}
