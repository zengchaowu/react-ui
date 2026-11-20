import type { CSSProperties } from 'react'
import type { CwDataTableColumn } from '../types'
import type { CalculateColumnStyleOptions } from '@zengchaowu/ui-shared/components/CwDataTable/functions/columnUtils'
import { calculateColumnStyle as calculateColumnStyleBase } from '@zengchaowu/ui-shared/components/CwDataTable/functions/columnUtils'

// 框架无关的列判断/宽度计算统一由 ui-shared 提供，这里只做 React CSSProperties 类型适配。
export * from '@zengchaowu/ui-shared/components/CwDataTable/functions/columnUtils'

/**
 * 计算列样式（React 适配：共享实现返回框架无关的字符串映射，这里转换为 CSSProperties）
 */
export function calculateColumnStyle(
  column: CwDataTableColumn,
  columnWidths: Record<string, number>,
  visibleColumns?: CwDataTableColumn[],
  options?: CalculateColumnStyleOptions,
): CSSProperties {
  return calculateColumnStyleBase(
    column,
    columnWidths,
    visibleColumns,
    options,
  ) as CSSProperties
}
