import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { CwDataTableColumn } from '../types'
import { computeScrollLeftToCenterColumn } from '../functions'

export interface UseScrollToColumnCenterOnSelectOptions {
  selectedColumn?: CwDataTableColumn
  columnSelectEnabled: boolean
  visibleColumns: CwDataTableColumn[]
  columnWidths: Record<string, number>
  bodyElRef: RefObject<HTMLElement | null>
  headerRef: RefObject<HTMLDivElement | null>
}

/** 列选中变化时，将选中列滚动到可视区域水平居中 */
export function useScrollToColumnCenterOnSelect(
  options: UseScrollToColumnCenterOnSelectOptions,
) {
  const { selectedColumn, columnSelectEnabled, visibleColumns, columnWidths } = options

  const lastCenteredColumnKeyRef = useRef<string | undefined>(selectedColumn?.key)

  useEffect(() => {
    if (!selectedColumn || !columnSelectEnabled) return
    if (lastCenteredColumnKeyRef.current === selectedColumn.key) return
    lastCenteredColumnKeyRef.current = selectedColumn.key

    const body = options.bodyElRef.current
    const header = options.headerRef.current
    if (!body || !header) return

    const left = computeScrollLeftToCenterColumn(
      selectedColumn,
      visibleColumns,
      columnWidths,
      body.clientWidth,
      body.scrollWidth,
    )
    if (left === null) return

    body.scrollTo({ left, behavior: 'smooth' })
    header.scrollTo({ left, behavior: 'smooth' })
  }, [
    options.bodyElRef,
    options.headerRef,
    columnSelectEnabled,
    columnWidths,
    selectedColumn,
    visibleColumns,
  ])
}
