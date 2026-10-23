import type { CwAutoCompleteOption, CwAutoCompleteTexts } from '../CwAutoComplete/types'

export interface CwAutoCompleteEmailProps {
  /** 绑定值 */
  value?: string | null
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
  /** 文案 */
  texts?: Partial<CwAutoCompleteEmailTexts>
  /** 值变化（合并 Vue `update:modelValue` 与 `change`） */
  onChange?: (
    value: string | null,
    option?: CwAutoCompleteOption | null,
  ) => void
  /** 清除 */
  onClear?: () => void
  /** 聚焦事件 */
  onFocus?: (event: FocusEvent) => void
  /** 失焦事件 */
  onBlur?: (event: FocusEvent) => void
}

export interface CwAutoCompleteEmailTexts {
  placeholder: string
  /** CwAutoComplete 文本配置 */
  autoCompleteTexts?: Partial<CwAutoCompleteTexts>
}

/** 组件暴露的 imperative 方法（对应 Vue defineExpose） */
export interface CwAutoCompleteEmailHandle {
  /** 检查下拉框是否打开 */
  isVisible: () => boolean
}

export interface CwAutoCompleteEmailEmits {
  'update:modelValue': [value: string | null]
  change: [value: string | null, option?: CwAutoCompleteOption | null]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}
