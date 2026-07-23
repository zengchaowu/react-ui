import type { CwImageGalleryProps } from '../CwImageGallery/types'
import type { CwAttachmentGalleryItem } from '../CwAttachmentGallery/types'
import type { GalleryPreviewContextMenuEvent } from '../../utils/useFullscreenGalleryPreviewOverlay'

export interface CwAttachmentPreviewStyles {
  indexLabel: string
  galleryWrap: string
}

export interface CwAttachmentPreviewTexts {
  closeLabel: string
  downloadLabel: string
  dialogAriaLabel: string
}

export interface CwAttachmentPreviewProps {
  visible?: boolean
  items?: CwAttachmentGalleryItem[]
  initialIndex?: number
  galleryKey?: string | number
  showIndex?: boolean
  closeable?: boolean
  closeOnClickOverlay?: boolean
  imagePreviewConfig?: CwImageGalleryProps['imagePreviewConfig']
  onContextMenu?: (payload: GalleryPreviewContextMenuEvent) => void
  styles?: Partial<CwAttachmentPreviewStyles>
  texts?: Partial<CwAttachmentPreviewTexts>
}

export interface CwAttachmentPreviewEmits {
  (e: 'close'): void
  (e: 'update:visible', value: boolean): void
  (e: 'change', index: number): void
}

export interface ShowCwAttachmentPreviewOptions {
  files?: File[]
  items?: CwAttachmentGalleryItem[]
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

export interface ShowCwAttachmentPreviewReturn {
  close: () => void
}
