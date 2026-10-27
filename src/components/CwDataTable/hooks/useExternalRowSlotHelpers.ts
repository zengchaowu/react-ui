import { useCallback } from 'react'
import type { CSSProperties } from 'react'
import type { CwDataTableColumn } from '../types'
import {
  mergeColumnStyleTransparentLateralBorders,
  mergeColumnStyleTransparentRight,
  stripFixedBodyFirstBorderClasses,
} from '../functions'

export interface UseExternalRowSlotHelpersParams {
  getColumnStyle: (column: CwDataTableColumn) => CSSProperties
  getBodyCellClassList: (column: CwDataTableColumn) => string[]
}

/** external-row 插槽：透明边框与类名处理，避免模板内联大段逻辑 */
export function useExternalRowSlotHelpers(params: UseExternalRowSlotHelpersParams) {
  const { getColumnStyle, getBodyCellClassList } = params

  const getExternalRowColumnStyle = useCallback(
    (column: CwDataTableColumn) => mergeColumnStyleTransparentRight(getColumnStyle(column)),
    [getColumnStyle],
  )

  const getExternalCellStyle = useCallback(
    (column: CwDataTableColumn) =>
      mergeColumnStyleTransparentLateralBorders(getColumnStyle(column)),
    [getColumnStyle],
  )

  const getExternalRowBodyCellClasses = useCallback(
    (column: CwDataTableColumn) => stripFixedBodyFirstBorderClasses(getBodyCellClassList(column)),
    [getBodyCellClassList],
  )

  return {
    getExternalRowColumnStyle,
    getExternalCellStyle,
    getExternalRowBodyCellClasses,
  }
}
