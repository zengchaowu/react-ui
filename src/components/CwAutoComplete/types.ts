import type { CwInputAppearance, CwInputTexts } from '../CwInput/types'
import type { CwIconEmbed } from '../CwIcon/types'

export interface CwAutoCompleteOption {
  /** 写入输入框 / 参与过滤的文案；value 与此项一致 */
  label: string
  key?: string | number
  disabled?: boolean
  [key: string]: unknown
}

/** 字符串会规范成 `{ label }` */
export type CwAutoCompleteOptionInput = string | CwAutoCompleteOption

export interface CwAutoCompleteProps {
  /** 备选项（可为空，走远程）；可为字符串或 `{ label }` */
  options?: CwAutoCompleteOptionInput[]
  /** 输入框内容（与展示文案同一值） */
  value?: string | null
  /** 占位符 */
  placeholder?: string
  /** 禁用 */
  disabled?: boolean
  /** 只读（不可输入与选择） */
  readonly?: boolean
  /** 可清空 */
  clearable?: boolean
  /** 输入防抖毫秒（仅影响拉选项，不影响 value） */
  debounce?: number
  /** 文本对齐方式 */
  align?: 'left' | 'right'
  /** 自动完成组件尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 触发器用 CwInput 的官方外观（CellForm 默认 plain） */
  inputAppearance?: CwInputAppearance
  popupClass?: string
  popupTriggerClass?: string
  /** 文案 */
  texts?: Partial<CwAutoCompleteTexts>
  /** 输入变化时拉取选项；可为字符串或 `{ label }` */
  fetchOptions?: (
    query: string,
  ) =>
    | Promise<CwAutoCompleteOptionInput[]>
    | CwAutoCompleteOptionInput[]
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

export interface CwAutoCompleteStyles {
  root: string
  rootNormal?: string
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
  suffix: string
  clearButton: string
  /** CwIcon 样式配置（清除图标） */
  clearIconStyles?: CwIconEmbed
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

/** 组件暴露的 imperative 方法（对应 Vue defineExpose） */
export interface CwAutoCompleteHandle {
  /** 下拉框是否打开 */
  isVisible: () => boolean
}

export interface CwAutoCompleteEmits {
  'update:modelValue': [value: string | null]
  /** 输入或点选后；点选时带上对应 option */
  change: [value: string | null, option?: CwAutoCompleteOption | null]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}
