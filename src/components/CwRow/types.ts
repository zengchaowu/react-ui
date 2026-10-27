import type { CwRowProps, CwColProps } from '@zengchaowu/ui-shared/components/CwRow/types'
// 栅格属性类型定义

// CwRow 组件类型定义

// CwCol 组件类型定义

// CwWrapRow 组件类型定义
export interface CwWrapRowProps extends CwRowProps {
  wrap: true
  /** 最大行数 */
  maxRows: number
  /** 所有col的props */
  colPros: CwColProps
}
