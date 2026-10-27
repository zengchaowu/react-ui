import type {
  HTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react'
import type { ChatMessage, ChatMessageKnowledgeSource } from '@zengchaowu/shared/types/im-chat'
import type { CwChatMessageBubbleAppearance } from './chatMessageBubbleSurface'
import type { CwChatMessageRedEnvelopeTexts } from '@zengchaowu/ui-shared/components/CwChatMessageCell/redEnvelopeTexts'
import type { CwChatMessageTransferTexts } from '@zengchaowu/ui-shared/components/CwChatMessageCell/transferTexts'
import type { CwChatMessageForwardBundleTexts } from '../CwChatMessageForwardBundle/types'
import type {
  CwImMentionProfileClickPayload,
  CwImMentionProfileResolver,
  CwMessageInputMentionItem,
} from './mentionProfile.types'
import type { CwChatMessageCellTexts, CwChatDownloadByUrlFn, CwChatFileDownloadProgressResolver, CwChatRevealLocalFileFn, CwChatMessageLayoutVariant, CwChatAssistantMessageFeedbackVote, CwChatAttachmentPreviewOpenPayload } from '@zengchaowu/ui-shared/components/CwChatMessageCell/types'

/** 具名插槽 `assistantShare` 的作用域插槽参数 */
export interface CwChatMessageCellAssistantShareSlotScope {
  message: ChatMessage
}

/** 具名插槽 `ownSideAction` 的作用域插槽参数 */
export interface CwChatMessageCellOwnSideActionSlotScope {
  message: ChatMessage
}

export interface CwChatMessageCellProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  message: ChatMessage
  /** 必传：`CwAvatar` 的 `fallback-src`（如应用内默认头像资源 URL） */
  peerAvatarFallbackSrc: string
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
  mentionProfileResolver?: CwImMentionProfileResolver
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
   * 气泡最大宽度改为占满消息列（去掉约 2/3 上限）。己方仍按内容收缩；对方可拉满整列。
   */
  bubblesFullWidth?: boolean
  /** 可执行/预览的围栏语言列表（如 ['html']）；命中时代码块展示执行按钮 */
  markdownCodeBlockPreviewLanguages?: string[]
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
   * `workspace`：Cursor 风格（己方透明描边、宽度 100%、不展示头像/昵称）。
   * 普通 IM 保持 `default`。
   */
  layoutVariant?: CwChatMessageLayoutVariant
  /** workspace 己方消息正在原地编辑 */
  ownMessageEditing?: boolean
  /**
   * workspace：该条己方消息为最近触发轮次且回复进行中时，
   * 悬停右上角展示停止按钮（替代编辑）。
   */
  showOwnMessageStop?: boolean
  /** 气泡内编辑器的 @ / 文件引用候选（与底部 composer 同源） */
  mentionItems?: CwMessageInputMentionItem[] | null
  /**
   * 为 true 或返回 true 时，在对方消息气泡下方展示助手操作栏（语音/复制/赞踩 + 分享 slot）。
   */
  showAssistantActions?: boolean | ((message: ChatMessage) => boolean)
  /** 操作栏禁用（如流式生成中） */
  assistantActionsDisabled?: boolean | ((message: ChatMessage) => boolean)
  /** 操作栏 hover 消息底部区域才显示（仅 fine pointer；触屏常显） */
  assistantActionsRevealOnHover?: boolean
  /** 当前消息的赞/踩状态 */
  assistantFeedbackVote?: (messageId: string) => CwChatAssistantMessageFeedbackVote | null
  /** 当前消息是否正在语音播放 */
  assistantSpeechPlaying?: (messageId: string) => boolean
  /** 红包气泡内图标 URL（由宿主应用提供） */
  walletRedEnvelopeIconSrc?: string
  /** 红包气泡文案（由宿主注入） */
  walletRedEnvelopeTexts?: Partial<CwChatMessageRedEnvelopeTexts>
  /** 转账气泡文案 */
  walletTransferTexts?: Partial<CwChatMessageTransferTexts>
  /** 合并转发卡片文案 */
  forwardBundleTexts?: Partial<CwChatMessageForwardBundleTexts>
  /** 当前查看者 userId */
  viewerUserId?: string
  /** 转账气泡收款方昵称解析 */
  walletTransferProfileResolver?: (userId: string) => { name: string } | undefined

  /** 气泡/消息被点击（等价 Vue `@click`） */
  onClick?: (message: ChatMessage) => void
  /** 点击气泡内引用条，滚动到被引用消息 */
  onQuoteNavigate?: (messageId: string) => void
  /** 多人会话对方头像被点击 */
  onPeerAvatarClick?: (message: ChatMessage) => void
  /** 点击正文 @人 hover tooltip，打开被 @ 用户资料 */
  onMentionProfileClick?: (payload: CwImMentionProfileClickPayload) => void
  /** 己方消息智能体代理失败，用户点击重试 */
  onRetryAgentProxy?: (message: ChatMessage) => void
  /** 己方消息出站发送失败，用户点击重发 */
  onRetryOutbound?: (message: ChatMessage) => void
  /** 点击图片或 Markdown 内联图：由父级展示全屏预览 */
  onAttachmentPreviewOpen?: (payload: CwChatAttachmentPreviewOpenPayload) => void
  /** 点击 apply_patch 短标签 / FileChange 卡片：打开工作区文件 */
  onOpenPath?: (path: string) => void
  /** 点击元数据区附件入口：由父级打开只读附件列表 */
  onInlineAttachmentsOpen?: (message: ChatMessage) => void
  /** 点击合并转发卡片：由父级打开转发消息列表弹窗 */
  onForwardBundleOpen?: (message: ChatMessage) => void
  /** 点击 RAG 引用来源：由父级打开知识库文档预览 */
  onKnowledgeSourceClick?: (source: ChatMessageKnowledgeSource) => void
  /** Markdown fenced 代码块工具栏复制 */
  onMarkdownCodeBlockCopy?: (payload: CwChatMessageMarkdownCodeBlockCopyPayload) => void
  /** Markdown fenced 代码块工具栏执行/预览 */
  onMarkdownCodeBlockPreview?: (
    payload: CwChatMessageMarkdownCodeBlockPreviewPayload,
  ) => void
  /** Markdown 内联图右键（未 preventDefault 时保留浏览器默认菜单） */
  onMarkdownImageContextMenu?: (payload: CwChatMessageMarkdownImageContextMenuPayload) => void
  /** 助手消息：语音播放 */
  onAssistantActionSpeech?: (message: ChatMessage) => void
  /** 助手消息：复制全文 */
  onAssistantActionCopy?: (message: ChatMessage) => void
  /** 助手消息：赞/踩（再次点击同一项则 vote 为 null） */
  onAssistantActionFeedback?: (
    message: ChatMessage,
    vote: CwChatAssistantMessageFeedbackVote | null,
  ) => void
  /** workspace：开始原地编辑己方消息 */
  onOwnMessageEditStart?: (message: ChatMessage) => void
  /** workspace：提交己方消息编辑 */
  onOwnMessageEditSubmit?: (payload: CwChatOwnMessageEditSubmitPayload) => void
  /** workspace：取消己方消息编辑 */
  onOwnMessageEditCancel?: (message: ChatMessage) => void
  /** workspace：停止进行中的智能体回复 */
  onStopAiReply?: (message: ChatMessage) => void

  /** 具名插槽 `assistantShare`（作用域插槽） */
  assistantShareSlot?: (scope: CwChatMessageCellAssistantShareSlotScope) => ReactNode
  /** 具名插槽 `ownSideAction`（作用域插槽） */
  ownSideActionSlot?: (scope: CwChatMessageCellOwnSideActionSlotScope) => ReactNode
}

/** Markdown 代码块点击「复制」：剪贴板写入由业务在 `markdownCodeBlockCopy` 中处理 */
export interface CwChatMessageMarkdownCodeBlockCopyPayload {
  message: ChatMessage
  code: string
  event: ReactMouseEvent<HTMLElement>
}

/** Markdown 代码块点击「执行/预览」：预览渲染由业务在 `markdownCodeBlockPreview` 中处理 */
export interface CwChatMessageMarkdownCodeBlockPreviewPayload {
  message: ChatMessage
  code: string
  language?: string
  event: ReactMouseEvent<HTMLElement>
}

/** Markdown 内联图右键：复制链接等由业务在 `markdownImageContextMenu` 中处理 */
export interface CwChatMessageMarkdownImageContextMenuPayload {
  message: ChatMessage
  src: string
  alt?: string
  title?: string
  documentImageIndex: number
  event: ReactMouseEvent<HTMLElement>
}

export interface CwChatOwnMessageEditSubmitPayload {
  message: ChatMessage
  html: string
  files: File[]
}

/** Vue `defineEmits` 的等价事件签名（React 侧对应 `onXxx` 回调 props） */
export interface CwChatMessageCellEmits {
  (e: 'click', message: ChatMessage): void
  (e: 'quoteNavigate', messageId: string): void
  (e: 'peerAvatarClick', message: ChatMessage): void
  (e: 'mentionProfileClick', payload: CwImMentionProfileClickPayload): void
  (e: 'retryAgentProxy', message: ChatMessage): void
  (e: 'retryOutbound', message: ChatMessage): void
  (e: 'attachmentPreviewOpen', payload: CwChatAttachmentPreviewOpenPayload): void
  (e: 'openPath', path: string): void
  (e: 'inlineAttachmentsOpen', message: ChatMessage): void
  (e: 'forwardBundleOpen', message: ChatMessage): void
  (e: 'knowledgeSourceClick', source: ChatMessageKnowledgeSource): void
  (e: 'markdownCodeBlockCopy', payload: CwChatMessageMarkdownCodeBlockCopyPayload): void
  (e: 'markdownCodeBlockPreview', payload: CwChatMessageMarkdownCodeBlockPreviewPayload): void
  (e: 'markdownImageContextMenu', payload: CwChatMessageMarkdownImageContextMenuPayload): void
  (e: 'assistant-action-speech', message: ChatMessage): void
  (e: 'assistant-action-copy', message: ChatMessage): void
  (
    e: 'assistant-action-feedback',
    message: ChatMessage,
    vote: CwChatAssistantMessageFeedbackVote | null,
  ): void
  (e: 'ownMessageEditStart', message: ChatMessage): void
  (e: 'ownMessageEditSubmit', payload: CwChatOwnMessageEditSubmitPayload): void
  (e: 'ownMessageEditCancel', message: ChatMessage): void
  (e: 'stopAiReply', message: ChatMessage): void
}
