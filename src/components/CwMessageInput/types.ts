import type { Editor } from '@tiptap/core'
import type { GalleryPreviewContextMenuEvent } from '../../utils/useFullscreenGalleryPreviewOverlay'

export interface CwMessageInputMentionItem {
  id: string
  label: string
  /** 头像 URL；缺省或加载失败时由 `mentionAvatarFallbackSrc` 作为占位图（与 `CwAvatar` 一致） */
  avatar?: string
}

export interface CwMessageInputFileRef {
  /** 唯一标识，用于删除/去重 */
  id: string
  /** 绝对路径或相对路径 */
  path: string
  /** 可选的行号范围，如 "10-25" */
  lines?: string
  /** 显示名（默认取文件名） */
  label?: string
}

export interface CwMessageInputStyles {
  root: string
  /**
   * 包裹编辑器的外层：在 root 的 flex 列里占满剩余高度（flex-1 + min-h-0），
   * 避免附件栏随正文变高被顶下去。
   */
  fieldShell: string
  field: string
  fieldDisabled: string
  mentionPanel: string
  mentionOption: string
  mentionOptionActive: string
  mentionAvatarWrap: string
  mentionAvatarImg: string
  mentionAvatarFallback: string
  mentionEmpty: string
  /** 待传附件条（样式由 `CwChatMessageComposer` 使用，与历史布局一致） */
  pendingListAbove: string
  pendingListAboveInner: string
  pendingRasterFrame: string
  pendingRasterImg: string
  pendingFileCard: string
  pendingFileCardIconWrap: string
  pendingFileCardMeta: string
  pendingFileCardTitle: string
  pendingFileCardSize: string
  /** 文件引用块在编辑器中的样式 */
  fileRefInline: string
}

export interface CwMessageInputTexts {
  placeholder: string
  mentionNoMatch: string
  /** 仍供 `CwChatMessageComposer` 工具栏「添加附件」等文案覆盖 */
  addAttachmentAriaLabel: string
  fileRefDeleteTitle: string
}

export interface CwMessageInputProps {
  placeholder?: string
  maxLength?: number
  disabled?: boolean
  fixedTextareaRows?: number
  /** 自动增高：最少行数（与 `textareaMaxRows` 同用；优先于 `fixedTextareaRows`） */
  textareaMinRows?: number
  /** 自动增高：最多行数 */
  textareaMaxRows?: number
  /** 编辑区上下 padding 之和（rem），用于计算 min/max 高度 */
  textareaFieldPadYRem?: number
  /**
   * 为 true 时：编辑器内拖入/粘贴图片为内联图片 clip；非光栅文件为 file clip（不进待传附件队列）。
   */
  allowComposerAttachmentPipeline?: boolean
  /** 由 Composer 维护的待传附件数量，用于「无文字仅有附件」时允许发送 */
  pendingAttachmentCount?: number
  mentionItems?: CwMessageInputMentionItem[] | null
  /** 必传：`@` 候选行头像无 URL 或主图加载失败时的占位图 URL（应用侧默认头像，与消息列表等一致） */
  mentionAvatarFallbackSrc: string
  /**
   * 拖入非图片文件时写入 `local-file:[path]` 的路径解析（Electron 可传绝对路径；默认仅文件名）。
   */
  droppedFilePathResolver?: (file: File) => string
  styles?: Partial<CwMessageInputStyles>
  texts?: Partial<CwMessageInputTexts>
  /** 初始内容（HTML） */
  modelValue?: string
  /** 附件预览右键；由业务调用 showCwContextMenu */
  onAttachmentPreviewContextMenu?: (payload: GalleryPreviewContextMenuEvent) => void
  /** `@` 候选：`popup` 光标浮层（桌面）；`sheet` 底部 Sheet + 搜索（移动端） */
  mentionPanelVariant?: 'popup' | 'sheet'
  /**
   * 移动端表情面板等场景：聚焦时尽量不唤起系统输入法（依赖 virtualKeyboardPolicy，iOS 有只读降级）。
   */
  suppressVirtualKeyboard?: boolean
}

export interface CwMessageInputEmits {
  send: [html: string]
  input: [plainText: string]
  submit: [payload: {
    /** IM 富文本 HTML（wire format） */
    html: string
    /** 仅 Composer 待传附件栏；编辑器 clip 不在此列表 */
    files: File[]
  }]
  'update:modelValue': [value: string]
  'editor-focus': []
  'editor-blur': []
  /** 用户在编辑器内按下（非程序化 focus）；用于表情模式切回键盘输入 */
  'editor-pointerdown': []
}

export interface CwMessageInputExpose {
  /** 插入纯文本到光标处 */
  insertText: (text: string) => void
  /** 获取 Tiptap Editor 实例 */
  getEditor: () => Editor | null
  /** 获取当前编辑器 HTML 内容 */
  getHTML: () => string
  /** 获取当前纯文本内容（不含文件引用等非文本节点） */
  getPlainText: () => string
  /** 插入文件引用块到光标处 */
  insertFileRef: (path: string, label?: string, lines?: string) => void
  /** 拖入文件：光栅图 → 图片 clip，其它 → 文件 clip */
  ingestDroppedFiles: (files: File[]) => void
  /** 当前是否可发送（含纯文本 / 内联图片等） */
  canSubmit: () => boolean
  /** 触发发送（与表单 submit 一致） */
  submit: () => void
}
