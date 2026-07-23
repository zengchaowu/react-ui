import type { Extension } from '@tiptap/core'

export interface TpTipTapEditorProps {
  /** 编辑器内容（HTML 字符串），支持 v-model */
  modelValue?: string
  /** 占位符文本 */
  placeholder?: string
  /** 是否禁用编辑（置灰工具栏与编辑区） */
  disabled?: boolean
  /** 是否只读（不可编辑、工具栏置灰不可点，与 disabled 视觉一致但不语义为禁用） */
  readonly?: boolean
  /** 编辑器最小高度 */
  height?: string | number
  /** 是否显示工具栏 */
  toolbar?: boolean
  /** 是否自动聚焦 */
  autofocus?: boolean
  /** 图片上传：选择/粘贴图片后调用，返回图片 URL 后插入编辑器 */
  imageUpload?: (file: File) => Promise<string>
  /** 视频上传：选择视频文件后调用，返回视频 URL 后插入编辑器 */
  videoUpload?: (file: File) => Promise<string>
  /** 工具栏按钮的 iconfont 图标名（与 CwIcon name 一致，如 `common--media--tupian`），未配置的项沿用文案/符号 */
  toolbarIcons?: Partial<TpTipTapEditorToolbarIcons>
  /** 自定义扩展（在 StarterKit 之外追加） */
  extensions?: Extension[]
  /** 自定义样式 */
  styles?: Partial<TpTipTapEditorStyles>
  /** 自定义文案（国际化） */
  texts?: Partial<TpTipTapEditorTexts>
}

export type TpTipTapEditorToolbarIcons = {
  bold?: string
  italic?: string
  strike?: string
  code?: string
  bulletList?: string
  orderedList?: string
  blockquote?: string
  codeBlock?: string
  image?: string
  video?: string
  undo?: string
  redo?: string
  [key: string]: string | undefined
}

export interface TpTipTapEditorStyles {
  root: string
  toolbar: string
  toolbarDisabled: string
  toolbarGroup: string
  toolbarButton: string
  toolbarButtonActive: string
  editorWrap: string
  editorContent: string
}

export interface TpTipTapEditorTexts {
  placeholder?: string
  bold?: string
  italic?: string
  strike?: string
  code?: string
  bulletList?: string
  orderedList?: string
  blockquote?: string
  codeBlock?: string
  image?: string
  video?: string
  undo?: string
  redo?: string
}

export interface TpTipTapEditorEmits {
  'update:modelValue': [value: string]
  change: [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  ready: [editor: unknown]
  /** 选择图片后未提供 imageUpload 时抛出，由调用方上传并调用 setImage 插入 */
  'image-upload': [file: File]
  /** 选择视频后未提供 videoUpload 时抛出，由调用方上传并调用 setVideo 插入 */
  'video-upload': [file: File]
}
