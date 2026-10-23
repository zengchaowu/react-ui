import type { CwGridBreakpointConfig } from '../CwGrid/types'

export interface CwSelectSheetOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface CwSelectSheetProps {
  /** 选项列表 */
  options?: CwSelectSheetOption[]
  /** 当前选中的值（对应 Vue `modelValue`） */
  value?: string | number | null
  /** 标题 */
  title?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 列数（每行显示的选项数） */
  columns?: number
  /** 响应式断点配置，优先级高于 columns */
  breakpoints?: CwGridBreakpointConfig
  /** 栅格间隔（gutter） */
  gutter?: number
  /** 行间距 */
  rowGap?: number
  /** 自定义文本 */
  texts?: Partial<CwSelectSheetTexts>
  /** 选择改变事件（对应 `update:modelValue` + `change`） */
  onChange?: (
    value: string | number | null,
    option: CwSelectSheetOption | null,
  ) => void
  /** 关闭事件 */
  onClose?: () => void
}

export interface CwSelectSheetEmits {
  /** 选择改变事件 */
  'update:modelValue': [value: string | number | null]
  /** 选择事件 */
  change: [value: string | number | null, option: CwSelectSheetOption | null]
  /** 关闭事件 */
  close: []
}

export interface CwSelectSheetStyles {
  /** 根容器 */
  root: string
  /** 头部容器 */
  headerContainer?: string
  /** 头部标题 */
  headerTitle?: string
  /** 选项容器 */
  option: string
  /** 选项正常状态 */
  optionNormal: string
  /** 选项选中状态 */
  optionSelected: string
  /** 选项禁用状态 */
  optionDisabled: string
  /** 选项聚焦状态 */
  optionFocused: string
  /** 选项悬停状态 */
  optionHover: string
}

export interface CwSelectSheetTexts {
  /** 标题文本 */
  title: string
}

/** 组件暴露的 imperative 方法（对应 Vue defineExpose） */
export interface CwSelectSheetHandle {
  show: () => void
}
