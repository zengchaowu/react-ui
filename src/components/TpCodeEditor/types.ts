export interface TpCodeEditorProps {
  /** 编辑器内容 */
  modelValue?: string
  /** 编程语言 */
  language?: string
  /** 编辑器主题；auto 跟随 document 上 data-theme */
  theme?: 'light' | 'dark' | 'auto'
  /** 是否只读 */
  readOnly?: boolean
  /** 是否显示行号 */
  lineNumbers?: boolean
  /** 是否自动换行 */
  lineWrapping?: boolean
  /** 是否显示折叠按钮（已包含在 basicSetup 中） */
  // foldGutter?: boolean
  /** 是否显示搜索面板 */
  searchKeymap?: boolean
  /** 是否显示自动补全 */
  autocompletion?: boolean
  /** 编辑器高度 */
  height?: string | number
  /** 编辑器宽度 */
  width?: string | number
  /** 占位符文本 */
  placeholder?: string
  /** 是否禁用编辑器 */
  disabled?: boolean
  /** 自定义配置选项 */
  options?: Record<string, any>
  /**
   * 自定义样式对象
   */
  styles?: TpCodeEditorStyles
  /**
   * 自定义文本对象
   */
  texts?: TpCodeEditorTexts
}

export interface TpCodeEditorStyles {
  root: string
  rootDisabled: string
}

export interface TpCodeEditorTexts {
  // TpCodeEditor组件本身没有硬编码文本
}

export interface TpCodeEditorEmits {
  /** 内容变化事件 */
  'update:modelValue': [value: string]
  /** 编辑器准备就绪事件 */
  ready: [editor: any]
  /** 内容变化事件 */
  change: [value: string, editor: any]
  /** 焦点事件 */
  focus: [event: FocusEvent, editor: any]
  /** 失焦事件 */
  blur: [event: FocusEvent, editor: any]
  /** 选择变化事件 */
  selectionChange: [editor: any]
}
