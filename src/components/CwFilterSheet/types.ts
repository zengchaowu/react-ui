import type { CwGridBreakpointConfig } from '../CwGrid/types'

export interface CwFilterSheetOption {
  /** 选项值 */
  value: string | number
  /** 选项标签 */
  label: string
  /** 是否禁用 */
  disabled?: boolean
}

export interface CwFilterSheetSection {
  /** Section 的唯一标识 */
  key: string
  /** Section 标题 */
  title: string
  /** 选项列表 */
  options: CwFilterSheetOption[]
  /** 选择模式：'single' 单选，'multiple' 多选 */
  mode?: 'single' | 'multiple'
  /** 初始选中的值（单选时为单个值，多选时为数组） */
  initialValue?: string | number | (string | number)[]
  /** 是否禁用整个 section */
  disabled?: boolean
  /** 列数（每行显示的选项数） */
  columns?: number
  /** 响应式断点配置，优先级高于 columns */
  breakpoints?: CwGridBreakpointConfig
  /** 栅格间隔（gutter） */
  gutter?: number
  /** 行间距 */
  rowGap?: number
}

export interface CwFilterSheetButton {
  /** 按钮文本 */
  label: string
  /** 按钮类型：'primary' | 'secondary' */
  type?: 'primary' | 'secondary'
  /** 是否禁用 */
  disabled?: boolean
  /** 点击事件处理函数 */
  onClick?: (values: Record<string, string | number | (string | number)[] | null>) => void
}

export interface CwFilterSheetProps {
  /** 标题 */
  title?: string
  /** Section 配置数组 */
  sections?: CwFilterSheetSection[]
  /** 底部按钮配置数组（如果不配置，则使用默认的重置和确认按钮） */
  buttons?: CwFilterSheetButton[]
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 自定义样式 */
  styles?: Partial<CwFilterSheetStyles>
  /** 自定义文本 */
  texts?: Partial<CwFilterSheetTexts>
  /** Sheet 样式配置 */
  sheetStyles?: Partial<CwFilterSheetSheetStyles>
}

export interface CwFilterSheetEmits {
  /** 筛选值变化事件 */
  'update:values': [values: Record<string, string | number | (string | number)[] | null>]
  /** 确认事件 */
  confirm: [values: Record<string, string | number | (string | number)[] | null>]
  /** 重置事件 */
  reset: []
  /** 关闭事件 */
  close: []
}

export interface CwFilterSheetStyles {
  /** 根容器 */
  root: string
  /** Sheet 顶栏标题 */
  headerTitle: string
  /** Section 容器 */
  section: string
  /** Section 标题 */
  sectionTitle: string
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
  /** 选中标记容器 */
  checkmark: string
  /** 底部按钮区域 */
  footer: string
}

export interface CwFilterSheetTexts {
  /** 标题文本 */
  title: string
  /** 重置按钮文本 */
  resetText: string
  /** 确认按钮文本 */
  confirmText: string
}

export interface CwFilterSheetSheetStyles {
  /** Sheet 内容样式 */
  body: string
  /** Sheet 内容容器（底部方向）样式 */
  contentBottom: string
  /** Sheet Footer 样式 */
  footer?: string
}
