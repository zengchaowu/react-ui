import type {
  CwChatStickerPackItem,
  CwChatStickerPickPayload,
  CwChatToolbarActionPayload,
  CwChatToolbarItemConfig,
  CwChatToolbarStyles,
  CwChatToolbarTexts,
} from '../CwChatToolbar/types'
import type { VoiceRecordEndPayload } from '../CwAiChatComposer/voiceHoldTypes'
import type { ChatMessageQuotePreview } from '@zengchaowu/shared/types/im-chat'
import type {
  CwMessageInputMentionItem,
  CwMessageInputStyles,
  CwMessageInputTexts,
} from '../CwMessageInput/types'
import type { GalleryPreviewContextMenuEvent } from '../../utils/useFullscreenGalleryPreviewOverlay'

export interface CwChatMessageComposerStyles {
  root: string
  /** 工具栏隐藏 file input（屏幕外、不参与布局） */
  toolbarFileInput: string
  /** 引用预览条容器（与 `pendingListAbove` 纵向间距一致） */
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
  /** 追加到 `styles.root` 之后（会话页可传自定义容器类） */
  rootClass?: string
  /** 代码工作区：从 `CwTree` 拖入节点 key，插入为 `` `path` `` */
  acceptTreePathDrop?: boolean
  /** 本机项目根；与树拖拽相对路径拼接为绝对路径 */
  treeDropAbsoluteRoot?: string | null
  /** 正在引用某条消息时，输入框上方展示引用预览 */
  replyPreview?: ChatMessageQuotePreview | null
  styles?: Partial<CwChatMessageComposerStyles>
  texts?: Partial<CwChatMessageComposerTexts>
  /** `CwChatToolbar` 样式覆盖 */
  chatToolbarStyles?: Partial<CwChatToolbarStyles>
  /** `CwChatToolbar` 文案覆盖 */
  chatToolbarTexts?: Partial<CwChatToolbarTexts>
  /** `CwMessageInput` 样式覆盖 */
  messageInputStyles?: Partial<CwMessageInputStyles>
  /** `CwMessageInput` 文案覆盖 */
  messageInputTexts?: Partial<CwMessageInputTexts>
  /** 拖入文件 → `local-file:[path]` 路径（如 Electron 绝对路径） */
  droppedFilePathResolver?: (file: File) => string
  /** 待传附件 / 内联 clip 全屏预览右键；由业务调用 showCwContextMenu */
  onAttachmentPreviewContextMenu?: (payload: GalleryPreviewContextMenuEvent) => void
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
  /** workspace 变体：AI 流式回复中显示停止按钮 */
  stopReplyActive?: boolean
  /** 宿主公共资源 origin（emojione / material-icons 等静态资源 URL 拼接） */
  publicAssetBaseUrl?: string
}

export interface CwChatMessageComposerEmits {
  submit: [payload: {
    html: string
    files: File[]
  }]
  'toolbar-tap': [payload: CwChatToolbarActionPayload]
  'toolbar-files-picked': [toolKey: string, files: File[]]
  'cancel-reply': []
  'update:mobileAccessoryPanel': [panel: CwChatMessageComposerMobileAccessoryPanel]
  'sticker-pick': [payload: CwChatStickerPickPayload]
  /** 移动端左侧语音按钮进入/退出语音模式 */
  'voice-toggle': []
  'voice-mode-change': [active: boolean]
  'voice-record-start': []
  'voice-record-end': [payload: VoiceRecordEndPayload]
  'stop-ai-reply': []
}
