import type { HTMLAttributes } from 'react'

/** 分段选项 */
export interface CwSegmentOption {
  /** 显示标签；仅图标模式可省略 */
  label?: string
  /** 图标名（asset icon，如 common--commerce--card-view-line） */
  icon?: string
  /** 仅图标模式下的无障碍名称与 tooltip */
  title?: string
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

export type CwSegmentAppearance = 'default' | 'dense'

export interface CwSegmentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** 当前选中值（Vue `modelValue`） */
  value?: string | number
  /** 选项列表 */
  options: CwSegmentOption[] | string[]
  /** 是否禁用整组 */
  disabled?: boolean
  /** 尺寸 */
  size?: 'small' | 'medium' | 'large'
  /** 场景外观（如 DevTools 侧栏密集布局） */
  appearance?: CwSegmentAppearance
  texts?: Partial<CwSegmentTexts>
  className?: string
  /** 选中值变化（Vue `update:modelValue` / `change`） */
  onChange?: (value: string | number) => void
}

export interface CwSegmentEmits {
  onChange?: (value: string | number) => void
}
