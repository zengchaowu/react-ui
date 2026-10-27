import { useMemo, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { CwDataTableColumn } from '../types'
import { computeVisibleColumns } from '../functions'

/** 处理可见列和固定列逻辑 */
export function useVisibleColumns(
  columns: CwDataTableColumn[],
  fixedLeftColumns: number,
  fixedRightColumns: number,
): {
  visibleColumns: CwDataTableColumn[]
  visibleColumnsRef: MutableRefObject<CwDataTableColumn[]>
} {
  const visibleColumns = useMemo(
    () => computeVisibleColumns(columns, fixedLeftColumns, fixedRightColumns),
    [columns, fixedLeftColumns, fixedRightColumns],
  )
  const visibleColumnsRef = useRef(visibleColumns)
  visibleColumnsRef.current = visibleColumns

  return { visibleColumns, visibleColumnsRef }
}
