import type { CwImageGalleryItem, CwImageGalleryProps } from '../CwImageGallery/types'
import type { GalleryPreviewContextMenuEvent } from '../../utils/useFullscreenGalleryPreviewOverlay'

export type { GalleryPreviewContextMenuEvent }

export interface CwImageGalleryPreviewStyles {
  indexLabel: string
  galleryWrap: string
}

export interface CwImageGalleryPreviewTexts {
  closeLabel: string
  dialogAriaLabel: string
}

export interface CwImageGalleryPreviewProps {
  visible?: boolean
  items?: CwImageGalleryItem[]
  initialIndex?: number
  galleryKey?: string | number
  showIndex?: boolean
  closeable?: boolean
  closeOnClickOverlay?: boolean
  imagePreviewConfig?: CwImageGalleryProps['imagePreviewConfig']
  /** 右键回调；由业务调用 showCwContextMenu，预览组件不内置菜单 */
  onContextMenu?: (payload: GalleryPreviewContextMenuEvent) => void
  styles?: Partial<CwImageGalleryPreviewStyles>
  texts?: Partial<CwImageGalleryPreviewTexts>
}

export interface CwImageGalleryPreviewEmits {
  (e: 'close'): void
  (e: 'update:visible', value: boolean): void
  (e: 'change', index: number): void
}

export interface ShowCwImageGalleryPreviewOptions {
  items?: CwImageGalleryItem[]
  images?: string[]
  initialIndex?: number
  startPosition?: number
  showIndex?: boolean
  closeable?: boolean
  closeOnClickOverlay?: boolean
  imagePreviewConfig?: CwImageGalleryProps['imagePreviewConfig']
  onContextMenu?: (payload: GalleryPreviewContextMenuEvent) => void
  onClose?: () => void
  onChange?: (index: number) => void
}

export interface ShowCwImageGalleryPreviewReturn {
  close: () => void
}
