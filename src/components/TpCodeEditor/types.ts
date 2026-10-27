import type { HTMLAttributes } from 'react'
import type { Extension } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import type { TpCodeEditorTexts } from '@zengchaowu/ui-shared/components/TpCodeEditor/types'

export interface TpCodeEditorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'onFocus' | 'onBlur'> {
  /** 编辑器内容（受控） */
  value?: string
  /** 非受控初始内容（未传 `value` 时生效） */
  defaultValue?: string
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
  /** 编辑器字号（px），默认 14 */
  fontSize?: number
  /** 是否显示折叠箭头（iconfont；默认展开箭头仅 hover/当前行可见） */
  foldGutter?: boolean
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
  options?: Record<string, Extension>
  /**
   * 自定义文本对象
   */
  texts?: TpCodeEditorTexts
  /** 内容变化（对应 Vue `update:modelValue`） */
  onChange?: (value: string) => void
  /** 编辑器准备就绪（对应 Vue `ready` 事件） */
  onReady?: (editor: EditorView) => void
  /** 焦点（对应 Vue `focus` 事件） */
  onFocus?: (event: FocusEvent, editor: EditorView) => void
  /** 失焦（对应 Vue `blur` 事件） */
  onBlur?: (event: FocusEvent, editor: EditorView) => void
  /** 选择变化（对应 Vue `selectionChange` 事件） */
  onSelectionChange?: (editor: EditorView) => void
}

/** 当前选区（无选区或折叠时返回 null） */
export interface TpCodeEditorSelection {
  text: string
  /** 1-based，闭区间 */
  startLine: number
  /** 1-based，闭区间 */
  endLine: number
}

/** `defineExpose` 等价物：通过 ref 调用 */
export interface TpCodeEditorHandle {
  /** 当前编辑器实例 */
  readonly editor: EditorView | null
  getValue: () => string
  setValue: (value: string) => void
  focus: () => void
  destroy: () => void
  /** 跳转到 1-based 行号并居中滚动 */
  revealLine: (line: number) => boolean
  /** 当前选区（无选区或折叠时返回 null） */
  getSelection: () => TpCodeEditorSelection | null
}
