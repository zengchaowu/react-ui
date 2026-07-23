import type { CwAutoCompleteStyles, CwAutoCompleteTexts } from '../CwAutoComplete/types'

export interface CwAutoCompleteEmailProps {
  /** 绑定值 */
  modelValue?: string | null
  /** 占位符 */
  placeholder?: string
  /** 禁用 */
  disabled?: boolean
  /** 只读（不可输入与选择） */
  readonly?: boolean
  /** 可清空 */
  clearable?: boolean
  /** 输入防抖毫秒 */
  debounce?: number
  /** 文本对齐方式 */
  align?: 'left' | 'right'
  /** 邮箱自动完成组件尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 邮箱后缀列表 */
  emailSuffixes?: string[]
  /** 样式 */
  styles?: Partial<CwAutoCompleteEmailStyles>
  /** 文案 */
  texts?: Partial<CwAutoCompleteEmailTexts>
}

export interface CwAutoCompleteEmailStyles {
  root: string
  rootNormal?: string
  rootDisabled: string
  rootReadonly: string
  /** CwAutoComplete 样式配置 */
  autoCompleteStyles?: Partial<CwAutoCompleteStyles>
}

export interface CwAutoCompleteEmailTexts {
  placeholder: string
  /** CwAutoComplete 文本配置 */
  autoCompleteTexts?: Partial<CwAutoCompleteTexts>
}

export interface CwAutoCompleteEmailEmits {
  'update:modelValue': [value: string | null]
  'change': [value: string | null]
  'clear': []
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}
