export interface CwMessageInputMentionItem {
  id: string
  label: string
  /** 头像 URL；缺省或加载失败时由 `mentionAvatarFallbackSrc` 作为占位图（与 `CwAvatar` 一致） */
  avatar?: string
  /**
   * 候选类型。缺省 / `user`：插入 @ 提及；
   * `file` / `folder`：插入文件引用 chip（须带 `path`）。
   */
  kind?: 'user' | 'file' | 'folder'
  /** `file` / `folder` 时的路径（建议绝对路径或项目内相对路径） */
  path?: string
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

export type CwMessageInputFieldLayout =
  | 'default'
  | 'mobileCompact'
  | 'workspace'
  | 'workspaceInline'

export interface CwMessageInputTexts {
  placeholder: string
  mentionNoMatch: string
  /** 仍供 `CwChatMessageComposer` 工具栏「添加附件」等文案覆盖 */
  addAttachmentAriaLabel: string
  fileRefDeleteTitle: string
}

/** 内联图片预览项（对应 Vue `CwAttachmentGalleryItem` 的图片子集） */
export interface CwMessageInputAttachmentPreviewItem {
  key: string
  file: File
  kind: 'image'
  objectUrl?: string
}

/** 附件预览右键（对应 Vue `AttachmentPreviewContextMenuEvent`） */
export interface CwMessageInputAttachmentPreviewContextMenuEvent {
  clientX: number
  clientY: number
  index: number
  item: CwMessageInputAttachmentPreviewItem | null
}

export interface CwMessageInputInlineImagePreviewPayload {
  items: CwMessageInputAttachmentPreviewItem[]
  startPosition: number
  onContextMenu?: (
    payload: CwMessageInputAttachmentPreviewContextMenuEvent,
  ) => void
}

/**
 * 编辑器句柄。
 * Vue 侧为 Tiptap `Editor`；React 侧未引入 Tiptap，这里暴露等价的最小能力集，
 * 仅覆盖宿主实际使用的 `commands.focus/blur/clearContent` 与读取接口。
 */
export interface CwMessageInputEditorCommands {
  focus: () => void
  blur: () => void
  clearContent: () => void
}

export interface CwMessageInputEditorHandle {
  /** 可编辑根节点（`.ProseMirror`） */
  readonly dom: HTMLElement
  readonly commands: CwMessageInputEditorCommands
  getHTML: () => string
  getText: () => string
  isEmpty: () => boolean
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
   * 为 true 时启用编辑器拖入/粘贴文件处理；默认插入内联 clip。
   * 若同时传入 `onDroppedFiles`，则交给回调（不插 clip）。
   */
  allowComposerAttachmentPipeline?: boolean
  /**
   * 拖入/粘贴文件回调；传入则覆盖默认内联 clip（如 AI 进待传附件栏）。
   * 仅在 `allowComposerAttachmentPipeline` 开启时生效。
   */
  onDroppedFiles?: (files: File[]) => void
  /** 由 Composer 维护的待传附件数量，用于「无文字仅有附件」时允许发送 */
  pendingAttachmentCount?: number
  mentionItems?: CwMessageInputMentionItem[] | null
  /** 必传：`@` 候选行头像无 URL 或主图加载失败时的占位图 URL */
  mentionAvatarFallbackSrc: string
  /**
   * 拖入非图片文件时写入 `local-file:[path]` 的路径解析（Electron 可传绝对路径；默认仅文件名）。
   */
  droppedFilePathResolver?: (file: File) => string
  /** 编辑区布局：`mobileCompact` / `workspace` 由 `CwChatMessageComposer` 传入 */
  fieldLayout?: CwMessageInputFieldLayout
  /** 发送后是否清空编辑器；气泡内编辑应设为 false */
  clearOnSubmit?: boolean
  /** 为 true 时回车与发送都不提交，编辑器内容保留（例如对方仍在回复） */
  suspendSubmit?: boolean
  texts?: Partial<CwMessageInputTexts>
  /** 初始内容（wire format HTML） */
  value?: string
  /** 附件预览右键；由业务调用 showCwContextMenu */
  onAttachmentPreviewContextMenu?: (
    payload: CwMessageInputAttachmentPreviewContextMenuEvent,
  ) => void
  /**
   * React 侧替代 Vue `showCwAttachmentPreview` 的逃生通道：
   * 内联图片点击时回调，宿主可接 `CwAttachmentPreview`。
   */
  onInlineImagePreview?: (payload: CwMessageInputInlineImagePreviewPayload) => void
  /** `@` 候选：`popup` 光标浮层（桌面）；`sheet` 底部 Sheet + 搜索（移动端） */
  mentionPanelVariant?: 'popup' | 'sheet'
  /**
   * 移动端表情面板等场景：聚焦时尽量不唤起系统输入法。
   */
  suppressVirtualKeyboard?: boolean
}

export interface CwMessageInputEmits {
  /** 等价 Vue `@send` */
  onSend?: (html: string) => void
  /** 等价 Vue `@input`（纯文本） */
  onInput?: (plainText: string) => void
  /** 等价 Vue `@submit` */
  onSubmit?: (payload: {
    /** IM 富文本 HTML（wire format） */
    html: string
    /** 仅 Composer 待传附件栏；编辑器 clip 不在此列表 */
    files: File[]
  }) => void
  /** 等价 Vue `update:modelValue` */
  onChange?: (value: string) => void
  onEditorFocus?: () => void
  onEditorBlur?: () => void
  /** 用户在编辑器内按下（非程序化 focus）；用于表情模式切回键盘输入 */
  onEditorPointerDown?: () => void
}

export interface CwMessageInputExpose {
  /** 插入纯文本到光标处 */
  insertText: (text: string) => void
  /** 获取编辑器句柄 */
  getEditor: () => CwMessageInputEditorHandle | null
  /** 获取当前编辑器 HTML 内容 */
  getHTML: () => string
  /** 获取当前纯文本内容（不含文件引用等非文本节点） */
  getPlainText: () => string
  /** 插入文件引用块到光标处 */
  insertFileRef: (path: string, label?: string, lines?: string) => void
  /** 拖入/程序化：光栅图 → 图片 clip，其它 → 文件 clip */
  ingestDroppedFiles: (files: File[]) => void
  /** 当前是否可发送（含纯文本 / 待传附件 / 内联图片等） */
  canSubmit: () => boolean
  /** 触发发送（与表单 submit 一致） */
  submit: () => void
  /** 聚焦 / 失焦 / 清空（Vue `defineExpose` 之外的常用补充） */
  focus: () => void
  blur: () => void
  clear: () => void
}
