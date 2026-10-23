import type { ReactNode } from 'react'

export interface CwFileDropTargetProps {
  disabled?: boolean
  /** 为 false 时不显示拖入高亮层 */
  showOverlay?: boolean
  texts?: Partial<CwFileDropTargetTexts>
  /** Vue 默认插槽 */
  children?: ReactNode
  /** Vue `#overlay` 具名插槽；提供时替代默认图标 + 文案 */
  overlaySlot?: ReactNode
  /** Vue `@files-drop` */
  onFilesDrop?: (files: File[]) => void
}

/** @internal */
export interface CwFileDropTargetStyles {
  root: string
  /** 拖入时把根节点边框改成品牌色（需外层/class 自带 border） */
  rootDragActive: string
  /** 包裹默认 slot，撑满根容器以便空白区域也能响应拖放 */
  content: string
  /** 拖入高亮时隐藏默认 slot，避免与 overlay 文案叠字 */
  contentHiddenWhileDrag: string
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
  onFilesDrop?: (files: File[]) => void
}
