import type { CwGridBreakpointConfig } from '../CwGrid/types'
import type { CwFilterSheetOption, CwFilterSheetTexts } from '@zengchaowu/ui-shared/components/CwFilterSheet/types'

/** 单个 section 的选中值（单选可为 null） */
export type CwFilterSheetValue =
  | string
  | number
  | (string | number)[]
  | null

/** 所有 section 的选中值，key 为 section.key */
export type CwFilterSheetValues = Record<string, CwFilterSheetValue>

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
  onClick?: (values: CwFilterSheetValues) => void
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
  /** 自定义文本 */
  texts?: Partial<CwFilterSheetTexts>
  /** 等价 Vue `@update:values`（筛选值变化事件） */
  onValuesChange?: (values: CwFilterSheetValues) => void
  /** 等价 Vue `@confirm` */
  onConfirm?: (values: CwFilterSheetValues) => void
  /** 等价 Vue `@reset` */
  onReset?: () => void
  /** 等价 Vue `@close` */
  onClose?: () => void
}

export interface CwFilterSheetEmits {
  /** 筛选值变化事件 */
  'update:values': [values: CwFilterSheetValues]
  /** 确认事件 */
  confirm: [values: CwFilterSheetValues]
  /** 重置事件 */
  reset: []
  /** 关闭事件 */
  close: []
}

/** 组件暴露的 imperative 方法（对应 Vue defineExpose） */
export interface CwFilterSheetHandle {
  show: () => void
  close: () => void
}
