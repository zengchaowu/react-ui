export interface CwFileDropTargetProps {
  disabled?: boolean
  /** 为 false 时不显示拖入高亮层 */
  showOverlay?: boolean
  styles?: Partial<CwFileDropTargetStyles>
  texts?: Partial<CwFileDropTargetTexts>
}

export interface CwFileDropTargetStyles {
  root: string
  /** 包裹默认 slot，撑满根容器以便空白区域也能响应拖放 */
  content: string
  overlay: string
  overlayActive: string
  overlayInner: string
  overlayIcon: string
  overlayText: string
}

export interface CwFileDropTargetTexts {
  hint: string
}

export interface CwFileDropTargetEmits {
  'files-drop': [files: File[]]
}
