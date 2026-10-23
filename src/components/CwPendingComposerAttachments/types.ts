export type CwPendingComposerAttachmentKind = 'image' | 'video' | 'file'

export interface CwPendingAttachmentPreviewItem {
  key: string
  file: File
  kind: CwPendingComposerAttachmentKind
  sizeBytes: number
  sourceIndex: number
  objectUrl?: string
}

export interface AttachmentPreviewContextMenuEvent {
  clientX: number
  clientY: number
  index: number
  item: CwPendingAttachmentPreviewItem | null
}

/**
 * 打开全屏预览的请求；由宿主接到命令式预览 API（对应 Vue `showCwAttachmentPreview`）。
 */
export interface CwPendingAttachmentPreviewRequest {
  items: CwPendingAttachmentPreviewItem[]
  startPosition: number
  onContextMenu?: (payload: AttachmentPreviewContextMenuEvent) => void
}

export interface CwPendingComposerAttachmentsProps {
  disabled?: boolean
  /** 默认 `default`（px-3）；窄屏输入条用 `compact`（px-1.5） */
  density?: 'default' | 'compact'
  closeLabel?: string
  /** 文件变更时回调，等价 Vue `@change` */
  onChange?: (files: File[]) => void
  /** 预览内右键菜单回调（等价 Vue 同名 prop） */
  onAttachmentPreviewContextMenu?: (
    payload: AttachmentPreviewContextMenuEvent,
  ) => void
  /** 点击缩略图/文件卡时打开预览；未提供时不做处理 */
  onPreviewOpen?: (request: CwPendingAttachmentPreviewRequest) => void
  className?: string
}

/** 等价 Vue `defineExpose` 暴露的实例 API */
export interface CwPendingComposerAttachmentsHandle {
  addFiles: (files: File[] | FileList) => void
  clear: () => void
  clearPendingFiles: () => void
  readonly pendingFiles: File[]
  readonly pendingCount: number
}
