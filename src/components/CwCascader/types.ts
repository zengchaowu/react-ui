import type { CwInputTexts } from '../CwInput/types'
import type { CwPopupStyles } from '../CwPopup/types'
import type {  CwIconEmbed  } from '../CwIcon/types'

export interface CwCascaderOption {
  label: string
  value: any
  disabled?: boolean
  children?: CwCascaderOption[]
  [key: string]: any
}

export interface CwCascaderProps {
  /** 级联数据 */
  options: CwCascaderOption[]
  /** 当前选中的路径值（从根到叶的 value 数组） */
  modelValue?: any[]
  /** 占位符 */
  placeholder?: string
  /** 禁用 */
  disabled?: boolean
  /** 只读 */
  readonly?: boolean
  /** 可清空 */
  clearable?: boolean
  /** 级联选择器尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 样式配置 */
  styles?: Partial<CwCascaderStyles>
  /** 文本配置 */
  texts?: Partial<CwCascaderTexts>
}

export interface CwCascaderStyles {
  root: string
  rootNormal?: string
  rootDisabled: string
  rootReadonly: string
  dropdown: string
  panel: string
  column: string
  option: string
  optionNormal: string
  optionSelected: string
  optionDisabled: string
  optionHover: string
  optionFocus: string
  optionContent: string
  optionLabel: string
  optionArrow: string
  empty: string
  suffix: string
  clearButton: string
  /** CwIcon 样式配置（清除图标） */
  clearIconStyles?: CwIconEmbed
  arrowOpen: string
  /** CwIcon 样式配置（箭头图标） */
  arrowIconStyles?: CwIconEmbed
  /** CwPopup 样式配置 */
  popupStyles?: Partial<CwPopupStyles>
  /** 尺寸样式：小（选项列表） */
  sizeSmall?: string
  /** 尺寸样式：中（选项列表） */
  sizeMedium?: string
  /** 尺寸样式：大（选项列表） */
  sizeLarge?: string
  /** 空状态尺寸样式：小 */
  emptySizeSmall?: string
  /** 空状态尺寸样式：中 */
  emptySizeMedium?: string
  /** 空状态尺寸样式：大 */
  emptySizeLarge?: string
}

export interface CwCascaderTexts {
  placeholder: string
  empty: string
  clear: string
  /** CwInput 文本配置 */
  inputTexts?: Partial<CwInputTexts>
}

export interface CwCascaderEmits {
  'update:modelValue': [value: any[]]
  'change': [value: any[], option?: CwCascaderOption | null]
  'clear': []
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}


