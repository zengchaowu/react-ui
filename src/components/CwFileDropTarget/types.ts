import type { ReactNode } from 'react'
import type { CwFileDropTargetTexts } from '@zengchaowu/ui-shared/components/CwFileDropTarget/types'

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

export interface CwFileDropTargetEmits {
  onFilesDrop?: (files: File[]) => void
}
