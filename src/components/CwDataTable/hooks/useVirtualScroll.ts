import { useMemo, useRef } from 'react'
import {
  getVirtualWindow,
  MAX_VIRTUAL_SCROLL_PX,
} from '../../CwVirtualScroll/virtual-scroll'
import { getRowKey } from '../functions/columnUtils'
import type { CwDataTableRow } from '../types'

export interface DataTableRenderRow {
  key: string | number
  data: CwDataTableRow
  rowIndex: number
  isLast: boolean
  height?: number
}

export interface UseVirtualScrollOptions {
  displayedRows: CwDataTableRow[]
  virtualScroll: boolean
  rowHeight: number
  containerHeight: number
  scrollTop: number
  virtualBuffer: number
  rowKey?: string
  rowHeightKey?: string
}

export interface UseVirtualScrollResult {
  renderRows: DataTableRenderRow[]
  offsetTop: number
  offsetBottom: number
}

function indexAtHeight(prefix: number[], offset: number, count: number): number {
  let lo = 0
  let hi = Math.max(0, count - 1)
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if ((prefix[mid + 1] ?? 0) <= offset) lo = mid + 1
    else hi = mid
  }
  return lo
}

/**
 * 表格虚拟滚动：共享引擎 + 一次产出可渲染行（含 key / isLast）。
 */
export function useVirtualScroll({
  displayedRows,
  virtualScroll,
  rowHeight,
  containerHeight,
  scrollTop,
  virtualBuffer,
  rowKey,
  rowHeightKey,
}: UseVirtualScrollOptions): UseVirtualScrollResult {
  const prefixCacheRef = useRef<{
    list: CwDataTableRow[]
    key: string | undefined
    rowHeight: number
    prefix: number[]
  } | null>(null)

  return useMemo(() => {
    if (!virtualScroll) {
      const last = displayedRows.length - 1
      return {
        renderRows: displayedRows.map((data, rowIndex) => ({
          key: getRowKey(data, rowIndex, rowKey),
          data,
          rowIndex,
          isLast: rowIndex === last,
        })),
        offsetTop: 0,
        offsetBottom: 0,
      }
    }

    if (displayedRows.length === 0) {
      return { renderRows: [] as DataTableRenderRow[], offsetTop: 0, offsetBottom: 0 }
    }

    const lastDataIndex = displayedRows.length - 1

    if (rowHeightKey) {
      let cache = prefixCacheRef.current
      if (
        !cache ||
        cache.list !== displayedRows ||
        cache.key !== rowHeightKey ||
        cache.rowHeight !== rowHeight
      ) {
        const prefix = new Array<number>(displayedRows.length + 1)
        prefix[0] = 0
        for (let index = 0; index < displayedRows.length; index += 1) {
          const raw = displayedRows[index]?.[rowHeightKey]
          const size = typeof raw === 'number' && raw > 0 ? raw : rowHeight
          prefix[index + 1] = (prefix[index] ?? 0) + size
        }
        cache = { list: displayedRows, key: rowHeightKey, rowHeight, prefix }
        prefixCacheRef.current = cache
      }

      const prefix = cache.prefix
      const total = prefix[displayedRows.length] ?? 0
      if (total > 0 && total <= MAX_VIRTUAL_SCROLL_PX) {
        const overscan = Math.max(
          virtualBuffer,
          containerHeight > 0 ? Math.ceil(containerHeight / rowHeight) : 0,
        )
        let startIndex = 0
        let endIndex = Math.min(lastDataIndex, overscan * 2)
        if (containerHeight > 0) {
          startIndex = indexAtHeight(prefix, scrollTop, displayedRows.length) - overscan
          endIndex =
            indexAtHeight(prefix, scrollTop + containerHeight, displayedRows.length) + overscan
        }
        startIndex = Math.max(0, startIndex)
        endIndex = Math.min(lastDataIndex, endIndex)
        const offsetTop = prefix[startIndex] ?? 0
        const offsetBottom = total - (prefix[endIndex + 1] ?? total)

        const rows: DataTableRenderRow[] = []
        for (let index = startIndex; index <= endIndex; index += 1) {
          const row = displayedRows[index]
          // 稀疏数组中未物化的行在 materializeRange 完成前可能为 undefined，
          // 极端滚动竞态下跳过避免下游 row._data 崩溃（下一帧物化后会补回）。
          if (row == null) continue
          rows.push({
            key: getRowKey(row, index, rowKey),
            data: row,
            rowIndex: index,
            isLast: index === lastDataIndex,
            height: (prefix[index + 1] ?? 0) - (prefix[index] ?? 0),
          })
        }
        return { renderRows: rows, offsetTop, offsetBottom }
      }
    }

    const win = getVirtualWindow(
      displayedRows.length,
      rowHeight,
      scrollTop,
      containerHeight,
      virtualBuffer,
    )

    const rows: DataTableRenderRow[] = []
    for (let index = win.startIndex; index <= win.endIndex; index += 1) {
      const row = displayedRows[index]
      if (row == null) continue
      rows.push({
        key: getRowKey(row, index, rowKey),
        data: row,
        rowIndex: index,
        isLast: index === lastDataIndex,
        height: rowHeight,
      })
    }

    return { renderRows: rows, offsetTop: win.offsetStart, offsetBottom: win.offsetEnd }
  }, [
    displayedRows,
    virtualScroll,
    rowHeight,
    containerHeight,
    scrollTop,
    virtualBuffer,
    rowKey,
    rowHeightKey,
  ])
}
