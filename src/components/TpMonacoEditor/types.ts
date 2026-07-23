export interface TpMonacoEditorProps {
  /** 编辑器内容 */
  modelValue?: string
  /** 编程语言 */
  language?: string
  /** 编辑器主题 */
  theme?: 'vs' | 'vs-dark' | 'hc-black'
  /** 是否只读 */
  readOnly?: boolean
  /** 是否显示行号 */
  lineNumbers?: 'on' | 'off' | 'relative' | 'interval'
  /** 是否自动换行 */
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded'
  /** 自动换行列数 */
  wordWrapColumn?: number
  /** 是否显示小地图 */
  minimap?: boolean
  /** 是否显示折叠按钮 */
  folding?: boolean
  /** 是否显示选择高亮 */
  selectOnLineNumbers?: boolean
  /** 是否显示行高亮 */
  renderLineHighlight?: 'all' | 'line' | 'none' | 'gutter'
  /** 是否显示空白字符 */
  renderWhitespace?: 'none' | 'boundary' | 'selection' | 'all'
  /** 是否显示缩进参考线 */
  renderIndentGuides?: boolean
  /** 是否显示括号高亮 */
  matchBrackets?: 'always' | 'near'
  /** 是否自动闭合括号 */
  autoClosingBrackets?: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never'
  /** 是否自动闭合引号 */
  autoClosingQuotes?: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never'
  /** 是否自动缩进 */
  autoIndent?: 'none' | 'keep' | 'brackets' | 'advanced' | 'full'
  /** 是否启用代码折叠 */
  foldingStrategy?: 'auto' | 'indentation'
  /** 是否显示行尾空白 */
  showFoldingControls?: 'always' | 'mouseover'
  /** 是否启用链接检测 */
  links?: boolean
  /** 是否启用颜色装饰器 */
  colorDecorators?: boolean
  /** 是否启用代码镜头 */
  codeLens?: boolean
  /** 是否启用参数提示 */
  parameterHints?: boolean
  /** 是否启用悬停提示 */
  hover?: boolean
  /** 是否启用上下文菜单 */
  contextmenu?: boolean
  /** 是否启用多光标修改 */
  multiCursorModifier?: 'ctrlCmd' | 'alt'
  /** 是否启用滚动条 */
  scrollbar?: boolean
  /** 是否启用平滑滚动 */
  smoothScrolling?: boolean
  /** 是否启用鼠标滚轮缩放 */
  mouseWheelZoom?: boolean
  /** 是否启用快速建议 */
  quickSuggestions?: boolean | {
    other: boolean
    comments: boolean
    strings: boolean
  }
  /** 建议延迟时间 */
  suggestOnTriggerCharacters?: boolean
  /** 是否接受建议输入 */
  acceptSuggestionOnEnter?: 'on' | 'smart' | 'off'
  /** 是否接受建议输入Tab */
  acceptSuggestionOnCommitCharacter?: boolean
  /** 编辑器高度 */
  height?: string | number
  /** 编辑器宽度 */
  width?: string | number
  /** 是否禁用编辑器 */
  disabled?: boolean
  /** 自定义配置选项 */
  options?: Record<string, any>
  /** 是否启用自动保存 */
  autoSave?: boolean
  /** 自动保存延迟时间（毫秒） */
  autoSaveDelay?: number
  /**
   * 自定义样式对象
   */
  styles?: TpMonacoEditorStyles
  /**
   * 自定义文本对象
   */
  texts?: TpMonacoEditorTexts
}

export interface TpMonacoEditorStyles {
  root: string
  disabled: string
}

export interface TpMonacoEditorTexts {
  // TpMonacoEditor组件本身没有硬编码文本
}

export interface TpMonacoEditorEmits {
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
  /** 光标位置变化事件 */
  cursorPositionChange: [editor: any]
  /** 保存事件 */
  save: [editor: any]
  /** 语言变化事件 */
  languageChange: [language: string, editor: any]
  /** 主题变化事件 */
  themeChange: [theme: string, editor: any]
}
