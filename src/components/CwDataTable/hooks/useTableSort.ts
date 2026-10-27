import { useCallback } from 'react'
import type {
  CwDataTableColumn,
  CwDataTableSortConfig,
  CwDataTableSortState,
} from '../types'
import { calculateNextSortOrder, isSortedAsc, isSortedDesc } from '../functions'

export interface UseTableSortOptions {
  sortConfig: CwDataTableSortConfig
  defaultSortable: boolean
  onUpdateSort?: (sort: CwDataTableSortConfig) => void
  onSortChange?: (state?: CwDataTableSortState) => void
}

/** 表格排序 Hook */
export function useTableSort(options: UseTableSortOptions) {
  const { sortConfig, defaultSortable } = options
  const sortState = sortConfig.state

  const handleSort = useCallback(
    (column: CwDataTableColumn) => {
      if (column.sortable === false && !defaultSortable) return
      const nextOrder = calculateNextSortOrder(
        sortConfig.state?.key,
        sortConfig.state?.order,
        column.key,
      )
      const nextSortState: CwDataTableSortState | undefined = nextOrder
        ? { key: column.key, order: nextOrder }
        : undefined

      options.onUpdateSort?.({
        ...sortConfig,
        state: nextSortState,
      })
      options.onSortChange?.(nextSortState)
    },
    [defaultSortable, sortConfig, options.onUpdateSort, options.onSortChange],
  )

  const isColumnSortedAsc = (column: CwDataTableColumn) => isSortedAsc(column, sortState)
  const isColumnSortedDesc = (column: CwDataTableColumn) => isSortedDesc(column, sortState)

  return {
    sortState,
    isColumnSortedAsc,
    isColumnSortedDesc,
    handleSort,
  }
}
