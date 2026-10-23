export interface CwPaginationProps {
  /**
   * 当前页码（从 1 开始），对应 Vue `v-model:modelValue`
   */
  value: number
  /**
   * 总页数
   */
  total: number
  /**
   * 每页显示数量
   */
  pageSize?: number
  /**
   * 是否显示跳转输入框
   */
  showJumper?: boolean
  /**
   * 是否显示总数信息
   */
  showTotal?: boolean
  /**
   * 是否显示每页条数选择器
   */
  showPageSize?: boolean
  /**
   * 每页条数选项
   */
  pageSizeOptions?: number[]
  /**
   * 页码按钮数量（不包括首尾和省略号）
   */
  pageButtonCount?: number
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 自定义文本
   */
  texts?: Partial<CwPaginationTexts>
  /**
   * 页码变化（对应 Vue `update:modelValue` + `change`）
   */
  onChange?: (page: number, pageSize: number) => void
  /**
   * 每页条数变化（对应 Vue `pageSizeChange`）
   */
  onPageSizeChange?: (pageSize: number) => void
}

/** @internal */
export interface CwPaginationStyles {
  root: string
  rootDisabled: string
  info: string
  nav: string
  button: string
  pageButton: string
  buttonActive: string
  buttonDisabled: string
  ellipsis: string
  jumper: string
  jumperInput: string
  pageSize: string
  pageSizeSelect: string
}

export interface CwPaginationTexts {
  /**
   * 总数信息模板，支持 {total} 和 {start}-{end} 占位符
   * 例如: "共 {total} 条" 或 "显示 {start} 到 {end} 条，共 {total} 条"
   */
  total?: string
  /**
   * 跳转文本
   */
  jumper?: string
  /**
   * 每页条数文本
   */
  pageSize?: string
  /**
   * 上一页按钮文本
   */
  prev?: string
  /**
   * 下一页按钮文本
   */
  next?: string
  /**
   * 页码按钮的 aria-label 模板
   */
  pageLabel?: string
  /**
   * "页"字文本（用于跳转输入框）
   */
  pageUnit?: string
}

export interface CwPaginationEmits {
  /**
   * 页码变化事件（对应 `update:modelValue` + `change`）
   */
  onChange?: (page: number, pageSize: number) => void
  /**
   * 每页条数变化事件
   */
  onPageSizeChange?: (pageSize: number) => void
}
