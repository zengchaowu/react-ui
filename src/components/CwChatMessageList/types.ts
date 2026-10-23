import type { HTMLAttributes, ReactNode } from 'react'
import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'
import type {
  CwChatAssistantMessageFeedbackVote,
  CwChatDownloadByUrlFn,
  CwChatFileDownloadProgressResolver,
  CwChatAttachmentPreviewOpenPayload,
  CwChatMessageCellTexts,
  CwChatMessageLayoutVariant,
  CwChatMessageMarkdownCodeBlockCopyPayload,
  CwChatMessageMarkdownImageContextMenuPayload,
  CwChatOwnMessageEditSubmitPayload,
  CwChatRevealLocalFileFn,
} from '../CwChatMessageCell/types'
import type { CwChatMessageBubbleAppearance } from '../CwChatMessageCell/chatMessageBubbleSurface'
import type { CwChatMessageRedEnvelopeTexts } from '../CwChatMessageCell/redEnvelopeTexts'
import type { CwChatMessageTransferTexts } from '../CwChatMessageCell/transferTexts'
import type {
  CwImMentionProfileClickPayload,
  CwImMentionProfileResolver,
  CwMessageInputMentionItem,
} from '../CwChatMessageCell/mentionProfile.types'
import type { CwChatMessageForwardBundleTexts } from '../CwChatMessageForwardBundle/texts'

export interface CwChatMessageListStyles {
  root: string
  scrollRoot: string
  content: string
  /** Cursor / workspace 列表：更大左右内边距（覆盖宿主 `px-*`） */
  contentWorkspace: string
  emptyState: string
  emptyHint: string
  messagesColumn: string
  /** 列表顶部（加载更早消息等） */
  prepend?: string
  /** 消息列末尾追加内容 */
  append?: string
  /** workspace：列表底部留白（与输入框拉开距离） */
  bottomSpacerWorkspace: string
  messageRow: string
  /** Cursor / workspace 列表：更大行距 */
  messageRowWorkspace: string
  /** workspace：一轮对话容器（己方 sticky 的边界） */
  messageTurnWorkspace: string
  /** workspace：己方消息吸顶 */
  messageRowStickyOwn: string
  /** 多选已开启：整行可点击（含 `messageRow` 顶部 pt 行距区） */
  messageRowSelectionClickable: string
  /** 多选已开启但该行不可选：禁用 pointer 手势 */
  messageRowSelectionDisabled: string
  /** 多选时整行作为定位层（仅承载 absolute 子节点，不改变消息区文档流） */
  messageRowSelectionHost: string
  /** 多选选中行：整行底色层（absolute + pointer-events-none，不占流、不挤压气泡） */
  messageRowSelectedScrim: string
  /** 多选：悬浮勾选框容器（绝对定位） */
  selectionCheckboxAbs: string
  /** 多选：消息区包裹层（`flex min-w-0 w-full justify-start` + 左侧 padding），为绝对定位勾选框让位且不改变气泡相对本层的百分比逻辑 */
  messageRowSelectionInner: string
  loadingOverlay: string
  /** 多选且该行被勾选时：整行背景（placeholder 色系） */
  messageRowSelectedBg: string
  /** 点击引用条定位到目标消息时的短暂高亮 */
  messageRowQuoteHighlight: string
  /** 拖选进入多选前的蓝色框（滚动内容坐标 absolute，视口 overflow 裁剪） */
  lassoBox: string
}

export interface CwChatMessageListTexts {
  /** 无消息时在列表区展示的提示 */
  empty: string
}

/** 长按消息气泡payload（等价 Vue `longpress` 事件参数） */
export interface CwChatMessageListLongPressPayload {
  message: ChatMessage
  clientX: number
  clientY: number
  bubbleEl: HTMLElement
}

export interface CwChatMessageListProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'className' | 'onScroll'
  > {
  messages: ChatMessage[]
  loading?: boolean
  /** loading 为 true 后延迟多久才展示遮罩（ms）；快于该时长则不显示 loading */
  loadingDelayMs?: number
  showPeerSenderInMultiParty?: boolean
  mentionLabelResolver?: (userId: string) => string
  /** @人 hover tooltip：头像 + 昵称 */
  mentionProfileResolver?: CwImMentionProfileResolver
  /** 有值时正文 @ 可悬停展示头像 tooltip（可与 `peerAvatarFallbackSrc` 相同） */
  mentionAvatarFallbackSrc?: string
  /** 必传：对方头像 `src` 缺失或加载失败时的占位图 URL（应用侧默认头像资源） */
  peerAvatarFallbackSrc: string
  /** 必传：文件气泡下载（由宿主实现统一下载逻辑） */
  downloadByUrl: CwChatDownloadByUrlFn
  /** 文件消息下载进度（如 Electron 气泡背景条） */
  fileDownloadProgressResolver?: CwChatFileDownloadProgressResolver
  /** 已下载文件在文件夹中显示 */
  revealLocalFile?: CwChatRevealLocalFileFn
  mediaBubbleMaxSide?: number
  /** 追加到 `CwDiv` 滚动根节点 class */
  rootClass?: string
  /** 追加到内容容器 class */
  contentClass?: string
  texts?: Partial<CwChatMessageListTexts>
  /** `CwChatMessageCell` 文案覆盖 */
  messageCellTexts?: Partial<CwChatMessageCellTexts>
  /**
   * 列表滚动视口宽度 ≤ 该值（px）时：多人会话隐藏对方头像列，气泡与元数据占满可用宽度。
   * 传 `null` 或不传则关闭（保持桌面端默认排版）。
   */
  narrowLayoutBreakpointPx?: number | null
  /**
   * 为 true 时：气泡最大宽度放开到消息列 100%（去掉约 2/3 上限），不依赖视口断点。
   * 己方仍按内容收缩；与「窄屏断点」任一为真即生效。
   */
  alwaysFullWidthBubbles?: boolean
  /**
   * 为 true 时在每条消息左上角悬浮展示 `CwCheckbox`，用于多选（不占气泡横向宽度）。
   * 选中项通过 `selectedIds` + `onSelectedIdsChange` 与父级同步。
   */
  selectionEnabled?: boolean
  /** 已勾选的消息 id（顺序与列表顺序一致时由父级维护更佳，列表内仅做增删重排） */
  selectedIds?: string[]
  /** 返回 false 时对应消息勾选框禁用 */
  messageSelectable?: (message: ChatMessage) => boolean
  /**
   * 为 true 且未处于 `selectionEnabled` 时：在消息列表列上拖动可拉出蓝色框选矩形；
   * 超过位移阈值（约 32px）后显示选框，松手时触发 `onDragEnterSelection` 并 `onSelectedIdsChange`（按纯矩形与各行相交）；
   * 拖动中靠近列表上下边缘且内容可纵向滚动时自动上下滚动；单击不拖不进入多选。
   */
  dragToEnterSelectionEnabled?: boolean
  /** 追加到每条消息行根节点 class（如移动端长按菜单时 `select-none`） */
  messageRowExtraClass?: string
  /** 对方 Markdown/文本气泡外观（如 AI 助手去边框/去 padding） */
  peerBubbleAppearance?: CwChatMessageBubbleAppearance
  /**
   * `workspace`：Cursor 风格列表（己方透明描边全宽、不展示头像/昵称）。
   * 普通聊天保持 `default`。
   */
  layoutVariant?: CwChatMessageLayoutVariant
  /** 气泡内编辑己方消息时的 @ / 文件引用候选 */
  mentionItems?: CwMessageInputMentionItem[] | null
  /**
   * workspace：智能体回复进行中时，最近一条己方消息悬停显示停止按钮。
   */
  aiReplyActive?: boolean
  /**
   * 对方昵称点击语义：`profile` 打开资料；`collapse` 折叠/展开整条消息（触发 `onPeerAvatarClick`）。
   */
  peerSenderHeaderClickMode?: 'profile' | 'collapse'
  /** 返回 true 时该条对方消息折叠为仅展示昵称行 */
  messageCollapsed?: (messageId: string) => boolean
  /** 对方消息下方展示助手操作栏 */
  showAssistantActions?: boolean | ((message: ChatMessage) => boolean)
  assistantActionsDisabled?: boolean | ((message: ChatMessage) => boolean)
  /** 助手操作栏 hover 消息底部区域才显示（仅 fine pointer；触屏常显） */
  assistantActionsRevealOnHover?: boolean
  assistantFeedbackVote?: (messageId: string) => CwChatAssistantMessageFeedbackVote | null
  assistantSpeechPlaying?: (messageId: string) => boolean
  /** 红包气泡内图标 URL（由宿主应用提供） */
  walletRedEnvelopeIconSrc?: string
  /** 红包气泡文案（如品牌栏由宿主注入） */
  walletRedEnvelopeTexts?: Partial<CwChatMessageRedEnvelopeTexts>
  /** 转账气泡文案 */
  walletTransferTexts?: Partial<CwChatMessageTransferTexts>
  /** 合并转发卡片文案 */
  forwardBundleTexts?: Partial<CwChatMessageForwardBundleTexts>
  /** 可执行/预览的围栏语言列表（如 ['html']）；命中时代码块展示执行按钮 */
  markdownCodeBlockPreviewLanguages?: string[]
  /** 宿主公共资源 origin（emojione / file-icons 等静态资源 URL 拼接） */
  publicAssetBaseUrl?: string
  /** 当前查看者 userId */
  viewerUserId?: string
  /** 转账气泡收款方昵称解析 */
  walletTransferProfileResolver?: (userId: string) => { name: string } | undefined
  /** 是否还有更早消息（为 true 且提供 onLoadOlder 时启用顶部下拉加载） */
  hasOlder?: boolean
  /** 滚到顶部附近时无感加载更早（CwInfiniteScroll pullDown + scroll anchor 恢复） */
  onLoadOlder?: () => void | Promise<void>
  /** 触发顶部加载的 scrollTop 阈值（px），默认见 `CW_CHAT_MESSAGE_LIST_SCROLL_TOP_TRIGGER` */
  scrollTopTrigger?: number
  /** 移动端：长按消息气泡弹出工具条菜单（与多选互斥） */
  touchLongPressMenuEnabled?: boolean

  /** 等价 Vue `@scroll` */
  onScroll?: () => void
  /** 等价 Vue `@longpress` */
  onLongPress?: (payload: CwChatMessageListLongPressPayload) => void
  /** 等价 Vue `@peer-avatar-click` */
  onPeerAvatarClick?: (message: ChatMessage) => void
  /** 等价 Vue `@mention-profile-click` */
  onMentionProfileClick?: (payload: CwImMentionProfileClickPayload) => void
  /** 等价 Vue `@retry-agent-proxy` */
  onRetryAgentProxy?: (message: ChatMessage) => void
  /** 等价 Vue `@retry-outbound` */
  onRetryOutbound?: (message: ChatMessage) => void
  /** 等价 Vue `@attachment-preview-open` */
  onAttachmentPreviewOpen?: (payload: CwChatAttachmentPreviewOpenPayload) => void
  /** 等价 Vue `@open-path` */
  onOpenPath?: (path: string) => void
  /** 等价 Vue `@inline-attachments-open` */
  onInlineAttachmentsOpen?: (message: ChatMessage) => void
  /** 等价 Vue `@forward-bundle-open` */
  onForwardBundleOpen?: (message: ChatMessage) => void
  /** 等价 Vue `@knowledge-source-click` */
  onKnowledgeSourceClick?: (source: import('@zengchaowu/shared/types/im-chat').ChatMessageKnowledgeSource) => void
  /** 等价 Vue `@message-click` */
  onMessageClick?: (message: ChatMessage) => void
  /** 等价 Vue `@own-message-edit-submit` */
  onOwnMessageEditSubmit?: (payload: CwChatOwnMessageEditSubmitPayload) => void
  /** 等价 Vue `@stop-ai-reply` */
  onStopAiReply?: (message?: ChatMessage) => void
  /** 等价 Vue `@markdown-code-block-copy` */
  onMarkdownCodeBlockCopy?: (payload: CwChatMessageMarkdownCodeBlockCopyPayload) => void
  /** 等价 Vue `@markdown-code-block-preview` */
  onMarkdownCodeBlockPreview?: (
    payload: import('../CwChatMessageCell/types').CwChatMessageMarkdownCodeBlockPreviewPayload,
  ) => void
  /** 等价 Vue `@markdown-image-context-menu` */
  onMarkdownImageContextMenu?: (payload: CwChatMessageMarkdownImageContextMenuPayload) => void
  /** 等价 Vue `@assistant-action-speech` */
  onAssistantActionSpeech?: (message: ChatMessage) => void
  /** 等价 Vue `@assistant-action-copy` */
  onAssistantActionCopy?: (message: ChatMessage) => void
  /** 等价 Vue `@assistant-action-feedback` */
  onAssistantActionFeedback?: (
    message: ChatMessage,
    vote: CwChatAssistantMessageFeedbackVote | null,
  ) => void
  /** 等价 Vue `@update:selectedIds` */
  onSelectedIdsChange?: (ids: string[]) => void
  /** 等价 Vue `@drag-enter-selection` */
  onDragEnterSelection?: (message: ChatMessage) => void

  /** 等价 Vue 具名插槽 `prepend` */
  prependSlot?: ReactNode
  /** 等价 Vue 具名插槽 `append` */
  appendSlot?: ReactNode
  /** 等价 Vue 作用域插槽 `own-side-action` */
  ownSideActionSlot?: (scope: { message: ChatMessage }) => ReactNode
  /** 等价 Vue 具名插槽 `assistant-message-share`（作用域插槽） */
  assistantMessageShareSlot?: (scope: { message: ChatMessage }) => ReactNode

  className?: string
}

export interface CwChatMessageListEmits {
  scroll: []
  contextmenu: [e: MouseEvent]
  longpress: [payload: CwChatMessageListLongPressPayload]
  'peer-avatar-click': [m: ChatMessage]
  'mention-profile-click': [payload: CwImMentionProfileClickPayload]
  'retry-agent-proxy': [m: ChatMessage]
  'retry-outbound': [m: ChatMessage]
  'attachment-preview-open': [p: CwChatAttachmentPreviewOpenPayload]
  'open-path': [path: string]
  'inline-attachments-open': [m: ChatMessage]
  'forward-bundle-open': [m: ChatMessage]
  'knowledge-source-click': [
    source: import('@zengchaowu/shared/types/im-chat').ChatMessageKnowledgeSource,
  ]
  'message-click': [m: ChatMessage]
  'own-message-edit-submit': [p: CwChatOwnMessageEditSubmitPayload]
  'stop-ai-reply': [m?: ChatMessage]
  'markdown-code-block-copy': [p: CwChatMessageMarkdownCodeBlockCopyPayload]
  'markdown-image-context-menu': [p: CwChatMessageMarkdownImageContextMenuPayload]
  'assistant-action-speech': [m: ChatMessage]
  'assistant-action-copy': [m: ChatMessage]
  'assistant-action-feedback': [m: ChatMessage, vote: CwChatAssistantMessageFeedbackVote | null]
  'update:selectedIds': [ids: string[]]
  'drag-enter-selection': [m: ChatMessage]
}
