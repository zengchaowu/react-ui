import type { TpCherryMarkdownThemeName, TpCherryMarkdownThemeSettings, TpCherryMarkdownTexts } from '@zengchaowu/ui-shared/components/TpCherryMarkdown/types'

export interface TpCherryMarkdownProps {
  /** Markdown 内容 */
  value?: string
  /** 编辑器模式：edit-编辑模式，preview-预览模式，editOnly-仅编辑，previewOnly-仅预览 */
  mode?: 'edit' | 'preview' | 'editOnly' | 'previewOnly'
  /**
   * 编辑器主题。
   * - `default` / `dark`：Cherry 内置
   * - `workDocs`：对齐 design token（随 data-theme 自动明暗）
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
  toolbarConfig?: Record<string, unknown>
  /** 编辑器配置 */
  editorConfig?: Record<string, unknown>
  /** 预览配置 */
  previewConfig?: Record<string, unknown>
  /** 是否自动聚焦 */
  autofocus?: boolean
  /** 文件上传处理函数 */
  fileUpload?: (file: File) => Promise<string>
  /** 自定义文本对象 */
  texts?: TpCherryMarkdownTexts
  /** 内容变化（对应 Vue `update:value`） */
  onValueChange?: (value: string) => void
  /** 内容变化（对应 Vue `change` 事件） */
  onChange?: (value: string) => void
  /** 编辑器聚焦（对应 Vue `focus` 事件） */
  onFocus?: (event: FocusEvent) => void
  /** 编辑器失焦（对应 Vue `blur` 事件） */
  onBlur?: (event: FocusEvent) => void
  /** 编辑器准备就绪（对应 Vue `ready` 事件） */
  onReady?: () => void
  /** 文件上传（对应 Vue `file-upload` 事件） */
  onFileUpload?: (file: File) => void
}

/** Cherry Markdown 实例的最小结构（cherry-markdown 未提供完整类型） */
export interface TpCherryMarkdownInstance {
  getValue?: () => string
  setValue?: (value: string, keepCursor?: boolean) => void
  setTheme?: (theme: string) => void
  switchModel?: (model: string, showToolbar?: boolean) => void
  destroy?: () => void
}

/** `defineExpose` 等价物：通过 ref 调用 */
export interface TpCherryMarkdownHandle {
  getValue: () => string
  setValue: (value: string, keepCursor?: boolean) => void
  setTheme: (theme: string) => void
  getInstance: () => TpCherryMarkdownInstance | null
}
