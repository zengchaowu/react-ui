import type { CwInputTexts } from '../CwInput/types'
import type { CwPopupStyles } from '../CwPopup/types'
import type {  CwIconEmbed  } from '../CwIcon/types'

export interface CwAutoCompleteOption {
  label: string
  value: any
  key?: string | number
  disabled?: boolean
  [key: string]: any
}

export interface CwAutoCompleteProps {
  /** 备选项（可为空，走远程） */
  options?: CwAutoCompleteOption[]
  /** 绑定值 */
  modelValue?: any
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
  /** 自动完成组件尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 样式 */
  styles?: Partial<CwAutoCompleteStyles>
  /** 文案 */
  texts?: Partial<CwAutoCompleteTexts>
  /** 输入变化时拉取选项（需返回带 key 的项以优化渲染） */
  fetchOptions?: (query: string) => Promise<CwAutoCompleteOption[]> | CwAutoCompleteOption[]
}

export interface CwAutoCompleteStyles {
  root: string
  rootNormal?: string
  rootDisabled: string
  rootReadonly: string
  dropdown: string
  list: string
  option: string
  optionNormal: string
  optionSelected: string
  optionDisabled: string
  optionHover: string
  optionFocus: string
  suffix: string
  clearButton: string
  /** CwIcon 样式配置（清除图标） */
  clearIconStyles?: CwIconEmbed
  /** CwPopup 样式配置 */
  popupStyles?: Partial<CwPopupStyles>
  /** 尺寸样式：小（选项列表） */
  sizeSmall?: string
  /** 尺寸样式：中（选项列表） */
  sizeMedium?: string
  /** 尺寸样式：大（选项列表） */
  sizeLarge?: string
}

export interface CwAutoCompleteTexts {
  placeholder: string
  clear: string
  /** CwInput 文本配置 */
  inputTexts?: Partial<CwInputTexts>
}

export interface CwAutoCompleteEmits {
  'update:modelValue': [value: any]
  'change': [value: any, option?: CwAutoCompleteOption | null]
  'clear': []
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}


