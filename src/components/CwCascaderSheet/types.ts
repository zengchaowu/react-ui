import type { CwDynamicSheetInnerStyles, CwDynamicSheetInnerTexts } from '../CwDynamicSheet/types'

export interface CwCascaderSheetOption {
  label: string
  value: any
  disabled?: boolean
  children?: CwCascaderSheetOption[]
  [key: string]: any
}

export interface CwCascaderSheetProps {
  /** 级联数据 */
  options?: CwCascaderSheetOption[]
  /** 当前选中的路径值（从根到叶的 value 数组） */
  modelValue?: any[]
  /** 标题 */
  title?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 自定义样式 */
  styles?: Partial<CwCascaderSheetStyles>
  /** 自定义文本 */
  texts?: Partial<CwCascaderSheetTexts>
  /** Sheet 样式配置 */
  sheetStyles?: Partial<CwCascaderSheetSheetStyles>
}

export interface CwCascaderSheetEmits {
  /** 选择改变事件 */
  'update:modelValue': [value: any[]]
  /** 选择事件 */
  change: [value: any[], option: CwCascaderSheetOption | null]
  /** 关闭事件 */
  close: []
}

export interface CwCascaderSheetStyles {
  /** 根容器 */
  root: string
  /** 头部容器 */
  headerContainer?: string
  /** 头部标题 */
  headerTitle?: string
  /** 面板容器 */
  panel: string
  /** 列容器 */
  column: string
  /** 选项容器 */
  option: string
  /** 选项正常状态 */
  optionNormal: string
  /** 选项选中状态 */
  optionSelected: string
  /** 选项禁用状态 */
  optionDisabled: string
  /** 选项聚焦状态 */
  optionFocus: string
  /** 选项悬停状态 */
  optionHover: string
  /** 选项内容 */
  optionContent: string
  /** 选项标签 */
  optionLabel: string
  /** 选项箭头 */
  optionArrow: string
  /** 空状态 */
  empty: string
}

export interface CwCascaderSheetTexts {
  /** 标题文本 */
  title: string
  /** 空状态文本 */
  empty: string
}

export interface CwCascaderSheetSheetStyles {
  /** Sheet 内容样式 */
  body: string
  /** Sheet 内容容器（底部方向）样式 */
  contentBottom: string
}

