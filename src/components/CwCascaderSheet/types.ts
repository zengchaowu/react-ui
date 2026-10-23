import type { CwCascaderPanelOption } from '../CwCascaderPanel/types'

export type CwCascaderSheetOption = CwCascaderPanelOption

export interface CwCascaderSheetProps {
  /** 级联数据 */
  options?: CwCascaderSheetOption[]
  /** 当前选中的路径值（从根到叶的 value 数组） */
  value?: unknown[]
  /** 标题 */
  title?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 自定义文本 */
  texts?: Partial<CwCascaderSheetTexts>
  /** 选择改变事件（对应 `update:modelValue` + `change`） */
  onChange?: (
    value: unknown[],
    option: CwCascaderSheetOption | null,
  ) => void
  /** 关闭事件 */
  onClose?: () => void
}

export interface CwCascaderSheetEmits {
  /** 选择改变事件 */
  'update:modelValue': [value: unknown[]]
  /** 选择事件 */
  change: [value: unknown[], option: CwCascaderSheetOption | null]
  /** 关闭事件 */
  close: []
}

export interface CwCascaderSheetStyles {
  /** 头部容器 */
  headerContainer?: string
  /** 头部标题 */
  headerTitle?: string
}

export interface CwCascaderSheetTexts {
  /** 标题文本 */
  title: string
  /** 空状态文本 */
  empty: string
}

/** 组件暴露的 imperative 方法（对应 Vue defineExpose） */
export interface CwCascaderSheetHandle {
  show: () => void
}
