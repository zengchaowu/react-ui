import type {  CwIconEmbed  } from '../CwIcon/types'

export interface CwSearchBarProps {
  /** 输入框的值 */
  modelValue?: string
  /** 输入框占位符 */
  placeholder?: string
  /** 查询按钮文本 */
  buttonText?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 输入框尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 是否显示右侧查询按钮 */
  showButton?: boolean
  /** 查询按钮点击事件 */
  onSearch?: (value: string) => void
  /** 自定义样式 */
  styles?: Partial<CwSearchBarStyles>
  /** 自定义文本 */
  texts?: Partial<CwSearchBarTexts>
}

export interface CwSearchBarStyles {
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly: string
  container: string
  containerNormal: string
  containerReadonly: string
  containerFocus: string
  containerDisabled: string
  searchIcon: string
  searchIconNormal: string
  searchIconDisabled: string
  input: string
  inputNormal: string
  inputDisabled: string
  inputReadonly: string
  button: string
  buttonNormal: string
  buttonDisabled: string
  buttonFocused: string
  buttonText: string
  buttonTextNormal: string
  buttonTextDisabled: string
  /** 容器高度：小 */
  sizeSmall: string
  /** 容器高度：中 */
  sizeMedium: string
  /** 容器高度：大 */
  sizeLarge: string
  /** 输入框字号/行高：小 */
  inputSizeSmall: string
  /** 输入框字号/行高：中 */
  inputSizeMedium: string
  /** 输入框字号/行高：大 */
  inputSizeLarge: string
  /** 查询按钮：小 */
  buttonSizeSmall: string
  /** 查询按钮：中 */
  buttonSizeMedium: string
  /** 查询按钮：大 */
  buttonSizeLarge: string
  /** 搜索图标区：小 */
  searchIconSizeSmall: string
  /** 搜索图标区：中 */
  searchIconSizeMedium: string
  /** 搜索图标区：大 */
  searchIconSizeLarge: string
  /** CwIcon 样式配置（搜索图标） */
  searchIconStyles?: CwIconEmbed
}

export interface CwSearchBarTexts {
  placeholder?: string
  buttonText?: string
}

export interface CwSearchBarEmits {
  /** 值更新事件 */
  'update:modelValue': [value: string]
  /** 输入事件 */
  'input': [value: string]
  /** 变化事件 */
  'change': [value: string]
  /** 查询事件 */
  'search': [value: string]
  /** 聚焦事件 */
  'focus': [event: FocusEvent]
  /** 失焦事件 */
  'blur': [event: FocusEvent]
}
