export interface CwTextareaProps {
  /** 文本域当前值 */
  modelValue?: string
  /** 占位提示 */
  placeholder?: string
  /** 标签文本 */
  label?: string
  /** 是否显示标签 */
  showLabel?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 最多可输入字符数 */
  maxlength?: number
  /** 可见行数 */
  rows?: number
  /** 是否展示字符计数 */
  showCount?: boolean
  /** 最大可输入行数（包含换行） */
  maxRows?: number
  /** 最小可见行数 */
  minRows?: number
  /** 文本域尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 自定义样式 */
  styles?: Partial<CwTextareaStyles>
  /** 自定义文案 */
  texts?: Partial<CwTextareaTexts>
}

export interface CwTextareaStyles {
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly: string
  label: string
  labelNormal: string
  labelDisabled: string
  textareaWrapper: string
  textareaWrapperNormal: string
  textareaWrapperReadonly: string
  textareaWrapperDisabled: string
  textareaWrapperFocus: string
  textarea: string
  textareaNormal: string
  textareaReadonly: string
  textareaDisabled: string
  counter: string
  counterNormal: string
  counterDisabled: string
  /** 尺寸样式：小 */
  sizeSmall: string
  /** 尺寸样式：中 */
  sizeMedium: string
  /** 尺寸样式：大 */
  sizeLarge: string
}

export interface CwTextareaTexts {
  placeholder?: string
  label?: string
  /**
   * 计数文本模板
   * - {{length}}：当前字符数
   * - {{maxlength}}：最大字符数（无上限时为空字符串）
   */
  counter?: string
}

export interface CwTextareaEmits {
  /** 值更新事件 */
  'update:modelValue': [value: string]
  /** 输入事件 */
  'input': [value: string]
  /** 变化事件 */
  'change': [value: string]
  /** 聚焦事件 */
  'focus': [event: FocusEvent]
  /** 失焦事件 */
  'blur': [event: FocusEvent]
}

