import type { CwInputTexts } from '../CwInput/types'

export interface CwNumberInputProps {
  /** 输入框的值（数字） */
  modelValue?: number | string
  /** 输入框占位符 */
  placeholder?: string
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 步进值 */
  step?: number
  /** 是否允许小数 */
  allowDecimal?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否显示清除按钮 */
  clearable?: boolean
  /** 标签文本 */
  label?: string
  /** 是否显示标签 */
  showLabel?: boolean
  /** 文本对齐方式 */
  align?: 'left' | 'right'
  /** 输入框尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 自定义样式 */
  styles?: Partial<CwNumberInputStyles>
  /** 自定义文本 */
  texts?: Partial<CwNumberInputTexts>
}

/** NumberInput 自有 styles（结构对齐 Input 内部 base；本批不删 styles） */
export interface CwNumberInputStyles {
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly: string
  icon: string
  iconNormal: string
  iconDisabled: string
  label: string
  labelNormal: string
  labelDisabled: string
  inputMain: string
  inputMainAlignLeft: string
  inputMainAlignRight: string
  inputMainPadStart: string
  inputWithDisplayPrefix: string
  inputWrapper: string
  inputWrapperNormal: string
  inputWrapperReadonly: string
  inputWrapperFocus: string
  inputWrapperDisabled: string
  input: string
  inputNormal: string
  inputDisabled: string
  inputReadonly: string
  inputLeft: string
  inputRight: string
  suffix: string
  clearButton: string
  sizeSmall: string
  sizeMedium: string
  sizeLarge: string
  clearIconClass?: string
  clearIconStyles?: { class?: string; size?: number; root?: string }
}

export interface CwNumberInputTexts extends CwInputTexts {}

export interface CwNumberInputEmits {
  /** 值更新事件 */
  'update:modelValue': [value: number | string]
  /** 输入事件 */
  'input': [value: number | string]
  /** 变化事件 */
  'change': [value: number | string]
  /** 聚焦事件 */
  'focus': [event: FocusEvent]
  /** 失焦事件 */
  'blur': [event: FocusEvent]
  /** 清除事件 */
  'clear': []
}
