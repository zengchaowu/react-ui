import type { CwInputAppearance, CwInputTexts } from '../CwInput/types'
import type { CwPopupStyles } from '../CwPopup/types'
import type {  CwIconEmbed  } from '../CwIcon/types'
import type { CwSelectTagsProps } from '../CwSelectTags/types'
import type { CwSelectTagsStyles } from '../CwSelectTags/types'
import type { CwSelectTagsTexts } from '../CwSelectTags/types'
import type { CwCheckboxStyles } from '../CwCheckbox/types'

export interface CwSelectOption {
  label: string
  value: any
  disabled?: boolean
  description?: string
  [key: string]: any
}

export interface CwSelectProps {
  /** 选项数据 */
  options: CwSelectOption[]
  /** 当前选中的值（单选时为单个值，多选时为数组） */
  modelValue?: any | any[]
  /** 是否多选 */
  multiple?: boolean
  /** 占位符文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否可清空 */
  clearable?: boolean
  /** 是否全选（仅多选模式生效） */
  selectAll?: boolean
  /** 选择器尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 触发器用 CwInput 的官方外观 */
  inputAppearance?: CwInputAppearance
  /** CwSelectTags 组件属性（仅多选模式生效） */
  tagsProps?: Partial<Omit<CwSelectTagsProps, 'tags' | 'modelValue' | 'disabled' | 'readonly' | 'placeholder' | 'showLabel' | 'selectAll'>>
  /** 自定义样式对象 */
  styles?: Partial<CwSelectStyles>
  /** 自定义文本对象 */
  texts?: Partial<CwSelectTexts>
}

export interface CwSelectStyles {
  root: string
  rootNormal: string
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
  /** CwSelectTags 样式配置（仅多选模式生效） */
  tagsStyles?: Partial<CwSelectTagsStyles>
  /** 全选 Checkbox 样式配置（仅多选模式生效） */
  selectAllCheckboxStyles?: Partial<CwCheckboxStyles>
  /** 全选选项样式 */
  selectAllOption?: string
  /** 全选行字号：小 */
  selectAllOptionSizeSmall?: string
  /** 全选行字号：中 */
  selectAllOptionSizeMedium?: string
  /** 全选行字号：大 */
  selectAllOptionSizeLarge?: string
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

export interface CwSelectTexts {
  placeholder: string
  empty: string
  clear: string
  /** CwInput 文本配置 */
  inputTexts?: Partial<CwInputTexts>
  /** CwSelectTags 文本配置（仅多选模式生效） */
  tagsTexts?: Partial<CwSelectTagsTexts>
}

export interface CwSelectEmits {
  'update:modelValue': [value: any | any[]]
  'update:selectAll': [value: boolean]
  'change': [value: any | any[], option?: CwSelectOption | CwSelectOption[] | null]
  'clear': []
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  /** 标签点击事件（仅多选模式） */
  'tag-click': [option: CwSelectOption, event: MouseEvent]
  /** 标签删除事件（仅多选模式） */
  'tag-close': [option: CwSelectOption, event: MouseEvent]
  /** 点击更多标签事件（仅多选模式） */
  'more-click': [event: MouseEvent]
}
