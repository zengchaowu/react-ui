/** 分段选项 */
export interface CwSegmentOption {
  /** 显示标签 */
  label: string
  /** 选项值 */
  value: string | number
  /** 是否禁用 */
  disabled?: boolean
}

export interface CwSegmentStyles {
  root: string
  rootDisabled: string
  slider: string
  sliderMove: string
  item: string
  itemActive: string
  itemInactive: string
}

export interface CwSegmentTexts {}

export interface CwSegmentProps {
  /** 当前选中值 */
  modelValue?: string | number
  /** 选项列表 */
  options: CwSegmentOption[] | string[]
  /** 是否禁用整组 */
  disabled?: boolean
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large'
  texts?: Partial<CwSegmentTexts>
}

export interface CwSegmentEmits {
  'update:modelValue': [value: string | number]
  'change': [value: string | number]
}
