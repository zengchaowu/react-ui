import type { ReactNode } from 'react'
import type {
  CwMarkdownCodeBlockCopyPayload,
  CwMarkdownImageContextMenuPayload,
} from '../CwMarkdown/types'
import type {
  CwImMentionProfileClickPayload,
  CwImMentionProfileResolver,
} from './mentionProfile.types'
import type { CwChatDownloadByUrlFn, CwChatRevealLocalFileFn } from './types'
import type { CwChatMessageBubbleAppearance } from './chatMessageBubbleSurface'

/** 与 `ChatMessage.mediaUploadPhase` 对齐 */
export type CwChatMessageMediaUploadPhase =
  | 'queued'
  | 'registering'
  | 'oss'
  | 'server_storage'

/** 气泡内打开图片预览的载荷（`attachmentPreviewOpen`） */
export interface CwChatMessageAttachmentPreviewPayload {
  items: Array<{ key: string | number; src: string; alt?: string }>
  initialIndex?: number
}

/** CwChatMessageCell 内部子气泡类型（不对外导出） */
export interface CwChatMessageTextProps {
  content: string
  chatMessageId?: string
  showOnRight?: boolean
  /**
   * 为 true 时对方气泡也占满可用宽（默认对方为 max-w 80%/66%）。
   * 与 `CwChatMessageCell` / `CwChatMessageList` 的窄栏全宽策略一致。
   */
  bubblesFullWidth?: boolean
  /** 将 wire HTML 中 @ 解析为展示昵称；不传则使用 data-label / uid 缩写 */
  mentionLabelResolver?: (userId: string) => string
  /** @人 hover tooltip：头像 + 昵称（优先于仅 `mentionLabelResolver`） */
  mentionProfileResolver?: CwImMentionProfileResolver
  /** 无头像 URL 时的占位图（与输入框 `mentionAvatarFallbackSrc` 一致） */
  mentionAvatarFallbackSrc?: string
  /** 为 false 时 @ tooltip 不可点击打开资料（如多选模式） */
  mentionProfileClickable?: boolean
  /** 气泡外观（边框/内边距等）；不传则使用默认 IM 样式 */
  bubbleAppearance?: CwChatMessageBubbleAppearance
  /** 具名插槽 `leading` */
  leadingSlot?: ReactNode
  /** 等价 Vue `@click`（无参数） */
  onClick?: () => void
  /** 等价 Vue `@attachment-preview-open` */
  onAttachmentPreviewOpen?: (payload: CwChatMessageAttachmentPreviewPayload) => void
  /** 等价 Vue `@mention-profile-click` */
  onMentionProfileClick?: (payload: CwImMentionProfileClickPayload) => void
}

export interface CwChatMessageMarkdownProps {
  content: string
  chatMessageId?: string
  showOnRight?: boolean
  /** 为 true 时对方 Markdown 气泡也占满可用宽（见 `CwChatMessageText` 同名 prop） */
  bubblesFullWidth?: boolean
  /** 流式 AI 等场景：在正文末尾展示小号 loading */
  tailLoading?: boolean
  /** Markdown 内 @ 与纯文本气泡一致 */
  mentionLabelResolver?: (userId: string) => string
  /** 气泡外观（边框/内边距等）；不传则使用默认 IM 样式 */
  bubbleAppearance?: CwChatMessageBubbleAppearance
  /** 等价 Vue `@click`（无参数） */
  onClick?: () => void
  /** 等价 Vue `@attachment-preview-open` */
  onAttachmentPreviewOpen?: (payload: CwChatMessageAttachmentPreviewPayload) => void
  /** 等价 Vue `@markdown-code-block-copy` */
  onMarkdownCodeBlockCopy?: (payload: CwMarkdownCodeBlockCopyPayload) => void
  /** 等价 Vue `@markdown-image-context-menu` */
  onMarkdownImageContextMenu?: (payload: CwMarkdownImageContextMenuPayload) => void
}

export interface CwChatMessageImageProps {
  chatMessageId?: string
  /** 资源尚未就绪（先上传 OSS） */
  isUploading?: boolean
  /** 上传失败 */
  uploadFailed?: boolean
  /** 上传进度 0–100；未传时用不确定进度条（勿用假百分比） */
  uploadProgress?: number
  /** registering：媒体登记接口阶段，尚无 OSS 字节进度 */
  uploadPhase?: CwChatMessageMediaUploadPhase
  thumbnailUrl?: string
  /** 原始像素宽；无效时在布局里按 100 参与计算 */
  width?: number
  /** 原始像素高；无效时按 100 */
  height?: number
  showOnRight?: boolean
  /** 展示宽度上限，默认 300 */
  maxWidth?: number
  /** 展示高度上限，默认 300 */
  maxHeight?: number
  /** Electron 等：正在下载（气泡自下而上进度） */
  isDownloading?: boolean
  /** 下载进度 0–100；未传且 isDownloading 时为不定进度 */
  downloadProgress?: number
  /** 等价 Vue `@click` */
  onClick?: () => void
}

export interface CwChatMessageVideoProps {
  chatMessageId?: string
  isUploading?: boolean
  uploadFailed?: boolean
  uploadProgress?: number
  uploadPhase?: CwChatMessageMediaUploadPhase
  thumbnailUrl?: string
  videoUrl?: string
  width?: number
  height?: number
  showOnRight?: boolean
  maxWidth?: number
  maxHeight?: number
  /** Electron 等：正在下载（气泡自下而上进度） */
  isDownloading?: boolean
  /** 下载进度 0–100；未传且 isDownloading 时为不定进度 */
  downloadProgress?: number
  /** 等价 Vue `@play` */
  onPlay?: () => void
  /** 等价 Vue `@click` */
  onClick?: () => void
}

export interface CwChatMessageFileProps {
  chatMessageId?: string
  isUploading?: boolean
  uploadFailed?: boolean
  uploadProgress?: number
  uploadPhase?: CwChatMessageMediaUploadPhase
  /** 出站发送中（排队/登记），展示发送中菊花；与气泡内 OSS 进度条并存 */
  outboundSending?: boolean
  fileName?: string
  fileSize?: string
  /** 文件大小（字节）；优先于 fileSize 文案 */
  fileSizeBytes?: number
  /** 可下载地址（https/blob）；上传中或失败时不展示操作按钮 */
  downloadUrl?: string
  /** Electron 等：正在下载（气泡背景进度） */
  isDownloading?: boolean
  /** 下载进度 0–100；未传且 isDownloading 时为不定进度 */
  downloadProgress?: number
  /** 已下载到本地的绝对路径；有值时主操作展示为「文件」图标 */
  localFilePath?: string
  /** 可选：自定义图标图片 URL（http(s)/data/blob）；不设则使用 Material 文件图标 */
  fileIcon?: string
  /** 卡片宽（设计稿 px）；未传时使用 token `--size-message-file-width` */
  width?: number
  /** 卡片最小高（设计稿 px）；未传时由内容撑开 */
  height?: number
  showOnRight?: boolean
  /** 必传：由宿主实现下载 */
  downloadByUrl: CwChatDownloadByUrlFn
  /** 点击已下载文件：在文件夹中显示；文件不存在时由宿主清除 localFilePath */
  revealLocalFile?: CwChatRevealLocalFileFn
  /** 等价 Vue `@click` */
  onClick?: () => void
}

export interface CwChatMessageStickerProps {
  chatMessageId: string
  imageUrl: string
  stickerName?: string
  width?: number
  height?: number
  maxWidth?: number
  maxHeight?: number
  showOnRight?: boolean
  onClick?: () => void
}

export interface CwChatMessageVoiceProps {
  chatMessageId: string
  audioUrl: string
  durationSec?: number
  showOnRight?: boolean
  isUploading?: boolean
  uploadFailed?: boolean
  /** 识别文字；有值时在语音条下常显（如 AI Chat） */
  transcript?: string
  /** 具名插槽 `leading` */
  leadingSlot?: ReactNode
  /** 等价 Vue `@click` */
  onClick?: () => void
}
