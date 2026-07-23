export type TpCherryMarkdownThemeName = 'default' | 'dark' | 'cloudDocs' | (string & {})

export interface TpCherryMarkdownThemeListItem {
  className: string
  label: string
}

export interface TpCherryMarkdownThemeSettings {
  /** 主题列表（用于工具栏切换） */
  themeList?: TpCherryMarkdownThemeListItem[]
  /** 主主题 className，控制工具栏/编辑区/预览区 */
  mainTheme?: string
  /** 代码块主题 */
  codeBlockTheme?: string
  /** 行内代码主题 */
  inlineCodeTheme?: 'red' | 'black'
}

export interface TpCherryMarkdownProps {
  /** Markdown 内容 */
  value?: string
  /** 编辑器模式：edit-编辑模式，preview-预览模式，editOnly-仅编辑，previewOnly-仅预览 */
  mode?: 'edit' | 'preview' | 'editOnly' | 'previewOnly'
  /**
   * 编辑器主题。
   * - `default` / `dark`：Cherry 内置
   * - `cloudDocs`：对齐 vue-ui design token（随 data-theme 自动明暗）
   * - 也可传自定义 className（需配合 themeSettings.themeList + CSS）
   */
  theme?: TpCherryMarkdownThemeName
  /** 透传 Cherry themeSettings；未传时按 theme 自动补齐 */
  themeSettings?: TpCherryMarkdownThemeSettings
  /** 编辑器高度 */
  height?: string | number
  /** 是否禁用 */
  disabled?: boolean
  /** 占位符文本 */
  placeholder?: string
  /** 是否显示工具栏 */
  toolbar?: boolean
  /** 自定义工具栏配置 */
  toolbarConfig?: Record<string, any>
  /** 编辑器配置 */
  editorConfig?: Record<string, any>
  /** 预览配置 */
  previewConfig?: Record<string, any>
  /** 是否自动聚焦 */
  autofocus?: boolean
  /** 文件上传处理函数 */
  fileUpload?: (file: File) => Promise<string>
}

export interface TpCherryMarkdownStyles {
  root: string
  toolbar: string
  toolbarLeft: string
  toolbarRight: string
  button: string
  buttonActive: string
  buttonGroup: string
  buttonGroupButton: string
  buttonGroupButtonActive: string
  content: string
  editor: string
  editorHeader: string
  editorTitle: string
  editorContent: string
  preview: string
  previewHeader: string
  previewTitle: string
  previewContent: string
  loading: string
  loadingSpinner: string
  loadingText: string
  error: string
  errorIcon: string
  errorText: string
  retryButton: string
}

export interface TpCherryMarkdownTexts {
  placeholder?: string
  title?: string
  editorTitle?: string
  previewTitle?: string
  bold?: string
  italic?: string
  underline?: string
  strikethrough?: string
  heading?: string
  quote?: string
  code?: string
  link?: string
  image?: string
  table?: string
  list?: string
  taskList?: string
  horizontalRule?: string
  undo?: string
  redo?: string
  save?: string
  export?: string
  import?: string
  clear?: string
  fullscreen?: string
  exitFullscreen?: string
  loading?: string
  error?: string
  retry?: string
  saveSuccess?: string
  exportSuccess?: string
  importSuccess?: string
  help?: string
  shortcuts?: string
  markdownGuide?: string
}

export interface TpCherryMarkdownEmits {
  /** 内容变化事件 */
  'update:value': [value: string]
  /** 内容变化事件（兼容v-model） */
  change: [value: string]
  /** 编辑器聚焦事件 */
  focus: [event: FocusEvent]
  /** 编辑器失焦事件 */
  blur: [event: FocusEvent]
  /** 编辑器准备就绪事件 */
  ready: []
  /** 文件上传事件 */
  'file-upload': [file: File]
}
