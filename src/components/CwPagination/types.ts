import type { CwPaginationTexts } from '@zengchaowu/ui-shared/components/CwPagination/types'
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
