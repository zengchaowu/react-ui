import type { RefObject } from 'react'
import type {
  CwChatStickerPackItem,
  CwChatStickerPickPayload,
  CwChatToolbarActionPayload,
  CwChatToolbarItemConfig,
  CwChatToolbarTexts,
} from '../CwChatToolbar/types'
import type { VoiceRecordEndPayload } from '../CwAiChatComposer/voiceHoldTypes'
import type { ChatMessageQuotePreview } from '@zengchaowu/shared/types/im-chat'
import type {
  CwMessageInputExpose,
  CwMessageInputMentionItem,
  CwMessageInputTexts,
} from '../CwMessageInput/types'
import type { AttachmentPreviewContextMenuEvent } from '../CwAttachmentPreview/types'

export interface CwChatMessageComposerStyles {
  root: string
  /** 工具栏隐藏 file input（屏幕外、不参与布局） */
  toolbarFileInput: string
  /** 引用预览条容器（与待传附件条纵向间距一致） */
  replyPreviewWrap: string
  /** 移动端紧凑壳：外边框容器 */
  mobileShell?: string
  /** 移动端：左侧语音 / 右侧表情、加号按钮 */
  mobileSideBtn?: string
  /** 移动端：配件按钮激活态 */
  mobileSideBtnActive?: string
  /** 移动端：有草稿时右侧发送态（+ → 发送） */
  mobileSendBtn?: string
  /** 移动端：表情/加号底栏外层（高度动画） */
  mobileAccessoryDock?: string
  /** 移动端：底栏内容区固定高度 */
  mobileAccessoryDockInner?: string
  /** workspace 变体：圆角卡片容器 */
  workspaceShell?: string
  /** workspace 变体：底栏 */
  workspaceFooter?: string
  workspaceFooterLeft?: string
  workspaceFooterRight?: string
  workspaceMetaBtn?: string
  workspaceMetaBtnIcon?: string
  workspaceMetaBtnChevron?: string
  workspaceModeBtn?: string
  workspaceIconBtn?: string
  workspaceSendBtn?: string
  workspaceSendBtnDisabled?: string
  workspaceStopBtn?: string
}

export interface CwChatMessageComposerMobileShellTexts {
  voiceAriaLabel: string
  keyboardAriaLabel: string
  holdToSpeakLabel: string
  voiceRecordingHint: string
  voiceRecordingCancelHint: string
  voiceRecordingConvertHint: string
  voiceCancelLabel: string
  voiceConvertTextLabel: string
  emojiAriaLabel: string
  moreAriaLabel: string
  sendAriaLabel: string
  sendLabel: string
  stopAriaLabel: string
}

export type CwChatMessageComposerMobileAccessoryPanel = 'none' | 'emoji' | 'more'

export interface CwChatMessageComposerMobileMoreItem {
  key: string
  label: string
  icon: string
}

export type CwChatMessageComposerRootLayout =
  | 'default'
  | 'fillPane'
  | 'transparentShell'

export interface CwChatMessageComposerTexts {
  /** 根容器可选无障碍标签 */
  regionLabel?: string
}

export interface CwChatMessageComposerProps {
  disabled?: boolean
  /** 必传：提及面板等 `CwMessageInput` 内头像占位 URL */
  mentionAvatarFallbackSrc: string
  mentionItems?: CwMessageInputMentionItem[] | null
  enableAttachments?: boolean
  /**
   * 拖入/粘贴文件回调；传入则覆盖默认内联 clip。
   * 不传：与 IM chat 一致，插入编辑器内联 clip。
   * AI-chat 可传 `(files) => composerRef.addFiles(files)`。
   */
  onDroppedFiles?: (files: File[]) => void
  attachmentMultiple?: boolean
  attachmentAccept?: string
  fixedTextareaRows?: number
  /** 自动增高：最少行数（与 `textareaMaxRows` 同用） */
  textareaMinRows?: number
  /** 自动增高：最多行数 */
  textareaMaxRows?: number
  textareaFieldPadYRem?: number
  externalAttachmentUi?: boolean
  placeholder?: string
  maxLength?: number
  showToolbar?: boolean
  toolbarItems?: CwChatToolbarItemConfig[]
  /**
   * 根容器布局：`fillPane` 纵向分栏下格占满高度；`transparentShell` 供 workspace 外层透明壳。
   * 业务 IM 类名请用 `rootClass` 追加。
   */
  rootLayout?: CwChatMessageComposerRootLayout
  /** 追加到解析后的根 class 之后 */
  rootClass?: string
  /** 代码工作区：从 `CwTree` 拖入节点 key，插入为 `` `path` `` */
  acceptTreePathDrop?: boolean
  /** 本机项目根；与树拖拽相对路径拼接为绝对路径 */
  treeDropAbsoluteRoot?: string | null
  /** 正在引用某条消息时，输入框上方展示引用预览 */
  replyPreview?: ChatMessageQuotePreview | null
  texts?: Partial<CwChatMessageComposerTexts>
  /** `CwChatToolbar` 文案覆盖 */
  chatToolbarTexts?: Partial<CwChatToolbarTexts>
  /** `CwMessageInput` 文案覆盖 */
  messageInputTexts?: Partial<CwMessageInputTexts>
  /** 拖入文件 → `local-file:[path]` 路径（如 Electron 绝对路径） */
  droppedFilePathResolver?: (file: File) => string
  /** 待传附件 / 内联 clip 全屏预览右键；由业务调用 showCwContextMenu */
  onAttachmentPreviewContextMenu?: (
    payload: AttachmentPreviewContextMenuEvent,
  ) => void
  /**
   * 移动端：单行底栏（左语音、右表情与加号）+ 上方可增高编辑区；
   * 不随聚焦在单行/多行间切换，高度由 `mobileMinRows`～`mobileMaxRows` 约束。
   */
  mobileCompactLayout?: boolean
  /** 与 `mobileCompactLayout` 同用：保留桌面顶栏工具栏（宽屏仅补语音按钮时） */
  mobileCompactKeepToolbar?: boolean
  mobileMinRows?: number
  mobileMaxRows?: number
  mobileShellTexts?: Partial<CwChatMessageComposerMobileShellTexts>
  /** 移动端底栏左侧语音按钮（微信式布局；监听 voice-record-* 接入识别） */
  mobileShowVoice?: boolean
  /** 移动端底栏右侧表情按钮；宽屏 `mobileCompactKeepToolbar` 时可关 */
  mobileShowEmoji?: boolean
  /** 移动端底栏右侧加号按钮；宽屏 `mobileCompactKeepToolbar` 时可关 */
  mobileShowMore?: boolean
  /** 自定义表情包（移动端底栏 + 桌面工具栏表情弹层） */
  stickerPacks?: CwChatStickerPackItem[]
  /** 录音中麦克风频谱柱高（0~1），驱动浮层声波 */
  voiceWaveformLevels?: number[]
  /** 移动端加号面板项（由宿主注入，如文件、图片） */
  mobileMorePanelItems?: CwChatMessageComposerMobileMoreItem[]
  /** 移动端加号面板附加项（如红包、转账；追加在 `mobileMorePanelItems` 之后） */
  mobileMorePanelExtraItems?: CwChatMessageComposerMobileMoreItem[]
  /**
   * 布局变体：`workspace` 为 Agent 式圆角卡片 + 底栏（Agent/Auto + 刷新/附件/发送）；
   * 桌面 Code Workspace 等场景使用，不影响默认 IM 顶栏工具栏布局。
   */
  layoutVariant?: 'default' | 'workspace'
  /** workspace / 移动端：AI 流式回复中显示停止 */
  stopReplyActive?: boolean
  /** AI 流式中是否将主操作换成停止（出站 hold）；为 false 时可发送，停止另显 */
  outboundHoldActive?: boolean
  /** workspace 变体：底栏是否显示「添加附件」 */
  workspaceShowAttachButton?: boolean
  /** 宿主公共资源 origin（emojione / file-icons 等静态资源 URL 拼接） */
  publicAssetBaseUrl?: string
  /** v-model:mobileAccessoryPanel */
  mobileAccessoryPanel?: CwChatMessageComposerMobileAccessoryPanel
  /** 等价 Vue 具名插槽 `toolbar-append` */
  toolbarAppendSlot?: import('react').ReactNode
  /** 等价 Vue 具名插槽 `attachments-above` */
  attachmentsAboveSlot?: import('react').ReactNode
  /** 等价 Vue 具名插槽 `above-workspace-shell` */
  aboveWorkspaceShellSlot?: import('react').ReactNode
  /** 等价 Vue 具名插槽 `workspace-footer-left` */
  workspaceFooterLeftSlot?: import('react').ReactNode
}

export interface CwChatMessageComposerEmits {
  /** 等价 Vue `@submit` */
  onSubmit?: (payload: { html: string; files: File[] }) => void
  /** 等价 Vue `@toolbar-tap` */
  onToolbarTap?: (payload: CwChatToolbarActionPayload) => void
  /** 等价 Vue `@toolbar-files-picked` */
  onToolbarFilesPicked?: (toolKey: string, files: File[]) => void
  /** 等价 Vue `@cancel-reply` */
  onCancelReply?: () => void
  /** 等价 Vue `@update:mobileAccessoryPanel` */
  onMobileAccessoryPanelChange?: (panel: CwChatMessageComposerMobileAccessoryPanel) => void
  /** 等价 Vue `@sticker-pick` */
  onStickerPick?: (payload: CwChatStickerPickPayload) => void
  /** 用户首次打开表情/贴纸面板（桌面弹层或移动端底栏） */
  onExpressionPanelOpen?: () => void
  /** 移动端左侧语音按钮进入/退出语音模式 */
  onVoiceToggle?: () => void
  /** 等价 Vue `@voice-mode-change` */
  onVoiceModeChange?: (active: boolean) => void
  /** 等价 Vue `@voice-record-start` */
  onVoiceRecordStart?: () => void
  /** 等价 Vue `@voice-record-end` */
  onVoiceRecordEnd?: (payload: VoiceRecordEndPayload) => void
  /** 等价 Vue `@stop-ai-reply` */
  onStopAiReply?: () => void
}

export interface CwChatMessageComposerHandle {
  insertText: (text: string) => void
  addFiles: (files: File[] | FileList) => void
  clearPendingFiles: () => void
  getPendingFiles: () => File[]
  ingestDroppedFiles: (files: File[]) => void
  insertFileRef: (path: string, label?: string, lines?: string) => void
  openAttachmentPicker: () => void
  openToolbarFilePicker: (toolKey: string) => void
  getMessageInputRef: () => CwMessageInputExpose | null
  closeMobileAccessoryPanel: () => void
  exitMobileVoiceMode: () => void
  readonly mobileAccessoryPanel: CwChatMessageComposerMobileAccessoryPanel
}

export interface CwChatMessageComposerMobileShellProps {
  disabled?: boolean
  minRows?: number
  maxRows?: number
  messageInputRef?: RefObject<CwMessageInputExpose | null> | null
  showVoice?: boolean
  showEmoji?: boolean
  showMore?: boolean
  /** AI 流式回复中：可显示停止 */
  stopReplyActive?: boolean
  /** 为 true 时右侧主操作变为停止（出站 hold）；为 false 时主操作可发送，停止另显 */
  outboundHoldActive?: boolean
  emojiActive?: boolean
  moreActive?: boolean
  /** 无表情/更多底栏时追加页面安全区（由 Composer 传入） */
  insetSafeAreaBottom?: boolean
  texts?: Partial<CwChatMessageComposerMobileShellTexts>
  /** 录音中麦克风频谱柱高（0~1），驱动浮层声波 */
  voiceWaveformLevels?: number[]
  /** React：编辑器纯文本（等价 Vue tiptap 即时读取），用于行高与发送态 */
  editorPlainText?: string
  /** React：待传附件数变化时触发重算发送态 */
  pendingAttachmentCount?: number
  /** 等价 Vue 默认插槽 */
  children?: import('react').ReactNode
}

export interface CwChatMessageComposerMobileShellEmits {
  onVoiceToggle?: () => void
  onVoiceModeChange?: (active: boolean) => void
  onVoiceRecordStart?: () => void
  onVoiceRecordEnd?: (payload: VoiceRecordEndPayload) => void
  onEmojiToggle?: () => void
  onMoreToggle?: () => void
  onSend?: () => void
  onStopAiReply?: () => void
}

export interface CwChatMessageComposerMobileShellHandle {
  exitVoiceMode: () => void
  isVoiceMode: () => boolean
}
