import type { CwInputTexts } from '../CwInput/types'
import type { CwIconEmbed } from '../CwIcon/types'
import type {
  CwCascaderPanelOption,
  CwCascaderPanelValue,
} from '../CwCascaderPanel/types'

export type CwCascaderOption = CwCascaderPanelOption

export interface CwCascaderProps {
  /** 级联数据 */
  options?: CwCascaderOption[]
  /** 当前选中的路径值（从根到叶的 value 数组） */
  value?: CwCascaderPanelValue[]
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
  popupClass?: string
  popupTriggerClass?: string
  /** 文本配置 */
  texts?: Partial<CwCascaderTexts>
  /** 值变化（对应 `update:modelValue` + `change`） */
  onChange?: (
    value: CwCascaderPanelValue[],
    option?: CwCascaderOption | null,
  ) => void
  /** 清除事件 */
  onClear?: () => void
  /** 聚焦事件 */
  onFocus?: (event: FocusEvent) => void
  /** 失焦事件 */
  onBlur?: (event: FocusEvent) => void
}

/** @internal 库内默认 class 表，业务勿覆盖 */
export interface CwCascaderStyles {
  root: string
  rootNormal?: string
  rootDisabled: string
  rootReadonly: string
  dropdown: string
  suffix: string
  clearButton: string
  /** CwIcon 样式配置（清除图标） */
  clearIconStyles?: CwIconEmbed
  arrowOpen: string
  /** CwIcon 样式配置（箭头图标） */
  arrowIconStyles?: CwIconEmbed
}

export interface CwCascaderTexts {
  placeholder: string
  empty: string
  clear: string
  /** CwInput 文本配置 */
  inputTexts?: Partial<CwInputTexts>
}

export interface CwCascaderEmits {
  'update:modelValue': [value: CwCascaderPanelValue[]]
  change: [value: CwCascaderPanelValue[], option?: CwCascaderOption | null]
  clear: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}
