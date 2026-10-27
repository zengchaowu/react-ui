import type { ReactNode } from 'react'
import type { CwInputAppearance, CwInputTexts } from '@zengchaowu/ui-shared/components/CwInput/types'
import type { CwIconEmbed } from '@zengchaowu/ui-shared/components/CwIcon/types'

export type CwSelectValue = string | number

export interface CwSelectOption {
  label: string
  value: CwSelectValue
  disabled?: boolean
  description?: string
  [key: string]: unknown
}

/** CwSelectTags 可透传的属性子集（React 侧多选标签由 CwSelect 内联渲染） */
export interface CwSelectTagsOverrides {
  /** 最大显示行数 */
  maxRows?: number
  /** 触发器容器尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 标签尺寸 */
  tagSize?: 'small' | 'medium' | 'large'
  /** 标签类型 */
  tagType?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  /** 是否显示删除按钮 */
  closable?: boolean
  /** 全选时是否折叠为单个「全选」标签 */
  collapseSelectAll?: boolean
  /** 全选标签文本 */
  selectAllText?: string
  /** 更多标签文本（支持 `{count}` 占位） */
  moreText?: string
}

export interface CwSelectProps {
  /** 选项数据 */
  options?: CwSelectOption[]
  /** 当前选中的值（单选时为单个值，多选时为数组） */
  value?: CwSelectValue | CwSelectValue[] | null
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
  /** 触发器文本对齐（透传 CwInput） */
  align?: 'left' | 'right' | 'center'
  /** CwSelectTags 组件属性（仅多选模式生效） */
  tagsProps?: Partial<CwSelectTagsOverrides>
  /** CwPopup 浮层壳 class（替代 appearance 默认壳） */
  popupClass?: string
  /** CwPopup trigger 包裹层 class */
  popupTriggerClass?: string
  /** 自定义文本对象 */
  texts?: Partial<CwSelectTexts>
  /** 值变化（对应 `update:modelValue` + `change`） */
  onChange?: (
    value: CwSelectValue | CwSelectValue[] | null,
    option?: CwSelectOption | CwSelectOption[] | null,
  ) => void
  /** 全选状态变化（对应 `update:selectAll`） */
  onSelectAllChange?: (value: boolean) => void
  /** 清除事件 */
  onClear?: () => void
  /** 聚焦事件 */
  onFocus?: (event: FocusEvent) => void
  /** 失焦事件 */
  onBlur?: (event: FocusEvent) => void
  /** 标签点击事件（仅多选模式） */
  onTagClick?: (option: CwSelectOption, event: MouseEvent) => void
  /** 标签删除事件（仅多选模式） */
  onTagClose?: (option: CwSelectOption, event: MouseEvent) => void
  /** 点击更多标签事件（仅多选模式） */
  onMoreClick?: (event: MouseEvent) => void
  /** 具名插槽 icon（单选模式） */
  iconSlot?: ReactNode
  className?: string
}

/** @internal 库内默认 class 表，业务勿覆盖 */
export interface CwSelectStyles {
  root: string
  rootNormal: string
  rootDisabled: string
  rootReadonly: string
  dropdown: string
  list: string
  /** CwDiv content 等宽留白（壳无 padding，滚动条贴边） */
  listContent?: string
  option: string
  optionNormal: string
  optionSelected: string
  optionDisabled: string
  /** 未选中项 hover（6%）；勿与 optionSelected 同挂 */
  optionHover: string
  optionFocus: string
  /** 键盘焦点落在已选中项上 */
  optionFocusOnSelected: string
  empty: string
  suffix: string
  clearButton: string
  /** CwIcon 样式配置（清除图标） */
  clearIconStyles?: CwIconEmbed
  arrowOpen: string
  /** CwIcon 样式配置（箭头图标） */
  arrowIconStyles?: CwIconEmbed
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
  tagsTexts?: Partial<CwSelectTagsTextsConfig>
}

export interface CwSelectTagsTextsConfig {
  placeholder?: string
  label?: string
  selectAll?: string
  more?: string
}

export interface CwSelectEmits {
  'update:modelValue': [value: CwSelectValue | CwSelectValue[] | null]
  'update:selectAll': [value: boolean]
  change: [
    value: CwSelectValue | CwSelectValue[] | null,
    option?: CwSelectOption | CwSelectOption[] | null,
  ]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  /** 标签点击事件（仅多选模式） */
  'tag-click': [option: CwSelectOption, event: MouseEvent]
  /** 标签删除事件（仅多选模式） */
  'tag-close': [option: CwSelectOption, event: MouseEvent]
  /** 点击更多标签事件（仅多选模式） */
  'more-click': [event: MouseEvent]
}
