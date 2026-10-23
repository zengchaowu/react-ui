import type {
  CwAttachmentGalleryImagePreviewConfig,
  CwAttachmentGalleryItem,
} from '../CwAttachmentGallery/types'

export interface AttachmentPreviewContextMenuEvent {
  clientX: number
  clientY: number
  index: number
  item: CwAttachmentGalleryItem | null
}

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
  /** 顶部「当前 / 总数」文案；多页默认 true */
  showIndex?: boolean
  /**
   * 底部画廊指示器。全屏预览默认 false（与顶部 index 二选一，避免重复）。
   */
  showIndicator?: boolean
  /** 右上角下载按钮；有可下载源时默认 true */
  showDownload?: boolean
  closeable?: boolean
  closeOnClickOverlay?: boolean
  imagePreviewConfig?: CwAttachmentGalleryImagePreviewConfig
  texts?: Partial<CwAttachmentPreviewTexts>
  /** 关闭事件（对应 Vue `@close`） */
  onClose?: () => void
  /** 可见性变化（对应 Vue `@update:visible`） */
  onVisibleChange?: (value: boolean) => void
  /** 当前页变化（对应 Vue `@change`） */
  onChange?: (index: number) => void
  onContextMenu?: (payload: AttachmentPreviewContextMenuEvent) => void
}

export interface CwAttachmentPreviewEmits {
  (e: 'close'): void
  (e: 'update:visible', value: boolean): void
  (e: 'change', index: number): void
}

export interface ShowCwAttachmentPreviewOptions {
  files?: File[]
  /** 纯 URL 图片列表（与 files/items 三选一，优先 items） */
  images?: string[]
  items?: CwAttachmentGalleryItem[]
  initialIndex?: number
  startPosition?: number
  showIndex?: boolean
  showIndicator?: boolean
  showDownload?: boolean
  closeable?: boolean
  closeOnClickOverlay?: boolean
  imagePreviewConfig?: CwAttachmentGalleryImagePreviewConfig
  onContextMenu?: (payload: AttachmentPreviewContextMenuEvent) => void
  onClose?: () => void
  onChange?: (index: number) => void
  /**
   * 宿主公共资源根（file-icons 等）。命令式 createRoot 不会继承页面 Context，
   * 微前端场景下需显式传入，否则非预览文件图标会 404。
   */
  publicAssetBaseUrl?: string
}

export interface ShowCwAttachmentPreviewReturn {
  close: () => void
}
