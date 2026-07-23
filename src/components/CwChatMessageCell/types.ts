import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'
import type { CwImageGalleryItem } from '../CwImageGallery/types'
import type { CwChatAssistantMessageFeedbackVote } from '../CwChatMessageAssistantActions/types'
import type { CwChatMessageBubbleAppearance } from './chatMessageBubbleSurface'
import type { CwChatMessageRedEnvelopeTexts } from './redEnvelopeTexts'
import type { CwChatMessageTransferTexts } from './transferTexts'
import type { CwChatMessageForwardBundleTexts } from '../CwChatMessageForwardBundle/texts'

/** 下载时关联的气泡（用于展示文件消息下载进度） */
export type CwChatDownloadByUrlContext = {
  chatMessageId?: string
}

/** 由宿主传入：按 URL 触发下载（实现由应用负责，如 Electron 另存为或浏览器新开窗口） */
export type CwChatDownloadByUrlFn = (
  url: string,
  suggestedFileName?: string,
  context?: CwChatDownloadByUrlContext,
) => void

/** 文件气泡下载进度（宿主解析，通常仅 Electron） */
export type CwChatFileDownloadProgress = {
  isDownloading?: boolean
  /** 0–100；总量未知时为 null */
  progress?: number | null
  /** 已落盘本地路径（存在则气泡展示「文件」操作，否则为下载） */
  localFilePath?: string | null
}

/** 点击已下载文件的「在文件夹中显示」 */
export type CwChatRevealLocalFileFn = (
  filePath: string,
  context?: CwChatDownloadByUrlContext,
) => void | Promise<void>

export type CwChatFileDownloadProgressResolver = (
  chatMessageId: string,
) => CwChatFileDownloadProgress | null | undefined

/** 聊天气泡内打开 CwImageGallery 时的数据（管理端等可监听 `imageGalleryOpen`） */
export interface CwChatImageGalleryOpenPayload {
  items: CwImageGalleryItem[]
  initialIndex?: number
  /** 关联消息 id，供预览内下载走 chatDownloadByUrl 进度与完成提示 */
  chatMessageId?: string
}

export interface CwChatMessageCellStyles {
  row: string
  /** 己方：发送态图标 + 气泡（同一 flex 行） */
  ownOutboundRow: string
  ownOutboundStatusSlot: string
  meta: string
  metaOwn: string
  metaPeer: string
  /** 元信息区「内联附件」图标与数量 */
  inlineAttachmentMetaBtn: string
}

export interface CwChatMessageCellTexts {
  clientTimeLocalPrefix: string
  clientTimeLocalSuffix: string
  /** 无障碍：发送中（延迟 loading 出现后） */
  sendingLabel: string
  /** 无障碍：发送失败图标 */
  sendFailedLabel: string
  /** 出站发送失败且无具体错误时的 Tooltip 说明 */
  outboundFailedHint: string
  /** 出站发送失败：点击重发 */
  retryOutboundLabel: string
  /** 智能体未回复时的简短说明（无服务端 error 时） */
  agentProxyFailedHint: string
  retryAgentProxyLabel: string
}

export interface CwChatMessageCellProps {
  message: ChatMessage
  /** 必传：`CwAvatar` 的 `fallback-src`（如应用内默认头像资源 URL） */
  peerAvatarFallbackSrc: string
  styles?: Partial<CwChatMessageCellStyles>
  texts?: Partial<CwChatMessageCellTexts>
  /**
   * 图片/视频气泡缩放时的单边上限（px）；与文本 max-w-2/3 同宽时由父组件传入 `floor(消息区宽 * 2/3)`。
   * 未传时组件内仍用 300。
   */
  mediaBubbleMaxSide?: number
  /**
   * 多人会话中在对方消息左侧展示 `message.sender` 的头像与昵称（双人会话、己方消息不受影响）。
   */
  showPeerSenderInMultiParty?: boolean
  /** 正文里 @ 的展示昵称解析（如成员缓存） */
  mentionLabelResolver?: (userId: string) => string
  /** @人 hover tooltip：头像 + 昵称 */
  mentionProfileResolver?: import('../CwMessageInput/chips/mentionProfile.types').CwImMentionProfileResolver
  /** 无头像时的占位图（与 `peerAvatarFallbackSrc` 可同源） */
  mentionAvatarFallbackSrc?: string
  /**
   * 己方纯文本 `status === 'sending'` 时，延迟多久（ms）再在气泡旁显示 `CwLoading`；
   * 媒体出站与 `message.inlineUploading` 不受此延迟影响。默认 1000。
   */
  outboundSendingIndicatorDelayMs?: number
  /**
   * 多人会话对方消息：隐藏左侧头像列（昵称与气泡保留）。常用于列表区宽度接近手机屏时。
   */
  hidePeerAvatarColumn?: boolean
  /**
   * `hidePeerAvatarColumn` 时昵称是否可点击打开资料（触发 `peerAvatarClick`）。
   * 合并转发详情等快照场景应设为 false，避免仅有 hover 却无跳转。
   */
  peerSenderProfileNavigable?: boolean
  /**
   * 对方昵称/头像区点击语义：`profile` 打开资料；`collapse` 折叠/展开整条消息（仍触发 `peerAvatarClick`）。
   */
  peerSenderHeaderClickMode?: 'profile' | 'collapse'
  /** 为 true 时隐藏对方消息气泡与底栏，仅保留头像与昵称行 */
  collapsed?: boolean
  /**
   * 己方与对方气泡列占满可用宽度（约 100%），不再限制为 80% / 2/3。常与窄列表区配合使用。
   */
  bubblesFullWidth?: boolean
  /**
   * 为 true 时禁止气泡内点击/悬停/头像等指针交互（根节点与子节点均 `pointer-events: none`）；
   * 多选模式下列表会传入，避免误触图库、链接 hover 等。
   */
  interactionsDisabled?: boolean
  /** 必传：文件气泡下载（由宿主实现统一下载逻辑） */
  downloadByUrl: CwChatDownloadByUrlFn
  /** 按消息 id 解析文件下载进度（Electron 等） */
  fileDownloadProgressResolver?: CwChatFileDownloadProgressResolver
  /** 已下载文件：在文件夹中显示 */
  revealLocalFile?: CwChatRevealLocalFileFn
  /**
   * 对方 Markdown/文本气泡外观（如 AI 助手去边框/去 padding）。
   * 仅作用于 `!message.isOwn` 的文本与 Markdown 气泡。
   */
  peerBubbleAppearance?: CwChatMessageBubbleAppearance
  /**
   * 为 true 或返回 true 时，在对方消息气泡下方展示助手操作栏（语音/复制/赞踩 + 分享 slot）。
   */
  showAssistantActions?: boolean | ((message: ChatMessage) => boolean)
  /** 操作栏禁用（如流式生成中） */
  assistantActionsDisabled?: boolean | ((message: ChatMessage) => boolean)
  /** 当前消息的赞/踩状态 */
  assistantFeedbackVote?: (messageId: string) => CwChatAssistantMessageFeedbackVote | null
  /** 当前消息是否正在语音播放 */
  assistantSpeechPlaying?: (messageId: string) => boolean
  /** 红包气泡内图标 URL（由宿主应用提供，如 chat 本地 png） */
  walletRedEnvelopeIconSrc?: string
  /** 红包气泡文案（如品牌栏「微信红包」由宿主注入） */
  walletRedEnvelopeTexts?: Partial<CwChatMessageRedEnvelopeTexts>
  /** 转账气泡文案 */
  walletTransferTexts?: Partial<CwChatMessageTransferTexts>
  /** 合并转发卡片文案 */
  forwardBundleTexts?: Partial<CwChatMessageForwardBundleTexts>
  /** 当前查看者 userId */
  viewerUserId?: string
  /** 转账气泡收款方昵称解析 */
  walletTransferProfileResolver?: (userId: string) => { name: string } | undefined
}

/** Markdown 代码块点击「复制」：剪贴板写入由业务在 `markdownCodeBlockCopy` 中处理 */
export interface CwChatMessageMarkdownCodeBlockCopyPayload {
  message: ChatMessage
  code: string
  event: MouseEvent
}

/** Markdown 内联图右键：复制链接等由业务在 `markdownImageContextMenu` 中处理 */
export interface CwChatMessageMarkdownImageContextMenuPayload {
  message: ChatMessage
  src: string
  alt?: string
  title?: string
  documentImageIndex: number
  event: MouseEvent
}

export interface CwChatMessageCellEmits {
  click: [message: ChatMessage]
  /** 点击气泡内引用条，滚动到被引用消息 */
  quoteNavigate: [messageId: string]
  /** 多人会话对方头像被点击（仅 `showPeerSenderInMultiParty` 且非己方消息时触发） */
  peerAvatarClick: [message: ChatMessage]
  /** 点击正文 @人 hover tooltip，打开被 @ 用户资料 */
  mentionProfileClick: [
    payload: import('../CwMessageInput/chips/mentionProfile.types').CwImMentionProfileClickPayload,
  ]
  /** 己方消息智能体代理失败，用户点击重试 */
  retryAgentProxy: [message: ChatMessage]
  /** 己方消息出站发送失败，用户点击重发 */
  retryOutbound: [message: ChatMessage]
  /** 点击图片或 Markdown 内联图：由父级展示 CwImageGallery */
  imageGalleryOpen: [payload: CwChatImageGalleryOpenPayload]
  /** 点击元数据区附件入口：由父级打开只读附件列表 */
  inlineAttachmentsOpen: [message: ChatMessage]
  /** 点击合并转发卡片：由父级打开转发消息列表弹窗 */
  forwardBundleOpen: [message: ChatMessage]
  /** Markdown  fenced 代码块工具栏复制 */
  markdownCodeBlockCopy: [payload: CwChatMessageMarkdownCodeBlockCopyPayload]
  /** Markdown 内联图右键（未 preventDefault 时保留浏览器默认菜单） */
  markdownImageContextMenu: [payload: CwChatMessageMarkdownImageContextMenuPayload]
  /** 助手消息：语音播放 */
  'assistant-action-speech': [message: ChatMessage]
  /** 助手消息：复制全文 */
  'assistant-action-copy': [message: ChatMessage]
  /** 助手消息：赞/踩（再次点击同一项则 vote 为 null） */
  'assistant-action-feedback': [
    message: ChatMessage,
    vote: CwChatAssistantMessageFeedbackVote | null,
  ]
}
