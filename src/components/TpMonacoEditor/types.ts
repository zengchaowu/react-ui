import type { HTMLAttributes } from 'react'
import type * as Monaco from 'monaco-editor'

export interface TpMonacoEditorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onFocus' | 'onBlur' | 'autoSave'> {
  /** 编辑器内容 */
  value?: string
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
  options?: Record<string, unknown>
  /** 是否启用自动保存 */
  autoSave?: boolean
  /** 自动保存延迟时间（毫秒） */
  autoSaveDelay?: number
  /**
   * 自定义文本对象
   */
  texts?: TpMonacoEditorTexts
  /** 内容变化（对应 Vue `update:modelValue`） */
  onValueChange?: (value: string) => void
  /** 编辑器准备就绪（对应 Vue `ready` 事件） */
  onReady?: (editor: Monaco.editor.IStandaloneCodeEditor) => void
  /** 内容变化（对应 Vue `change` 事件） */
  onChange?: (value: string, editor: Monaco.editor.IStandaloneCodeEditor) => void
  /** 焦点（对应 Vue `focus` 事件） */
  onFocus?: (event: FocusEvent, editor: Monaco.editor.IStandaloneCodeEditor) => void
  /** 失焦（对应 Vue `blur` 事件） */
  onBlur?: (event: FocusEvent, editor: Monaco.editor.IStandaloneCodeEditor) => void
  /** 选择变化（对应 Vue `selectionChange` 事件） */
  onSelectionChange?: (editor: Monaco.editor.IStandaloneCodeEditor) => void
  /** 光标位置变化（对应 Vue `cursorPositionChange` 事件） */
  onCursorPositionChange?: (editor: Monaco.editor.IStandaloneCodeEditor) => void
  /** 保存（对应 Vue `save` 事件） */
  onSave?: (editor: Monaco.editor.IStandaloneCodeEditor) => void
  /** 语言变化（对应 Vue `languageChange` 事件） */
  onLanguageChange?: (language: string, editor: Monaco.editor.IStandaloneCodeEditor) => void
  /** 主题变化（对应 Vue `themeChange` 事件） */
  onThemeChange?: (theme: string, editor: Monaco.editor.IStandaloneCodeEditor) => void
}

export interface TpMonacoEditorStyles {
  root: string
  disabled: string
}

export interface TpMonacoEditorTexts {
  // TpMonacoEditor组件本身没有硬编码文本
}

/** `defineExpose` 等价物：通过 ref 调用 */
export interface TpMonacoEditorHandle {
  readonly editor: Monaco.editor.IStandaloneCodeEditor | null
  getValue: () => string
  setValue: (value: string) => void
  getLanguage: () => string
  setLanguage: (language: string) => void
  focus: () => void
  getSelection: () => Monaco.Selection | null
  setSelection: (selection: Monaco.IRange) => void
  getPosition: () => Monaco.Position | null
  setPosition: (position: Monaco.IPosition) => void
  revealLine: (lineNumber: number) => void
  revealLineInCenter: (lineNumber: number) => void
  revealRange: (range: Monaco.IRange) => void
  getModel: () => Monaco.editor.ITextModel | null
  setModel: (model: Monaco.editor.ITextModel) => void
  updateOptions: (options: Monaco.editor.IEditorOptions) => void
  dispose: () => void
  /** 格式化代码 */
  format: () => void
  /** 查找和替换 */
  find: (text: string) => void
  /** 替换 */
  replace: (text: string, replaceText: string) => void
  /** 全选 */
  selectAll: () => void
  /** 撤销 */
  undo: () => void
  /** 重做 */
  redo: () => void
}
