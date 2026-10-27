import { useCallback, useMemo } from 'react'
import type { CSSProperties } from 'react'
import type { CwDataTableColumn } from '../types'
import { calculateColumnStyle, computeLeftoverShares } from '../functions'

export interface UseColumnStyleGetterOptions {
  columnWidths: Record<string, number>
  visibleColumns: CwDataTableColumn[]
  expandFillColumns: boolean
  layoutContainerWidth: number
}

/**
 * 根据当前列宽与可见列计算列内联样式。
 * 剩余宽度按整表算一次，表头和每一行单元格共用。
 */
export function useColumnStyleGetter(options: UseColumnStyleGetterOptions) {
  const { columnWidths, visibleColumns, expandFillColumns, layoutContainerWidth } = options

  const leftoverShares = useMemo(
    () => computeLeftoverShares(visibleColumns, columnWidths, layoutContainerWidth),
    [visibleColumns, columnWidths, layoutContainerWidth],
  )

  const getColumnStyle = useCallback(
    (column: CwDataTableColumn): CSSProperties =>
      calculateColumnStyle(column, columnWidths, visibleColumns, {
        expandFillColumns,
        leftoverShares,
      }),
    [columnWidths, visibleColumns, expandFillColumns, leftoverShares],
  )

  return { getColumnStyle }
}
