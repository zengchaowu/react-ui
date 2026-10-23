import { useMemo } from 'react'
import { getVirtualWindow } from '../../CwVirtualScroll/virtual-scroll'
import type { CwTreeFlatRow } from '../functions/flattenVisibleTreeRows'

export type CwTreeVisibleRow = CwTreeFlatRow & { startIndex: number }

/**
 * 树虚拟滚动：固定行高 + 共享引擎，输出可见切片与上下占位。
 */
export function useTreeVirtualScroll(
  flatRows: CwTreeFlatRow[],
  enabled: boolean,
  rowHeight: number,
  containerHeight: number,
  scrollTop: number,
  buffer: number,
): {
  visibleRows: CwTreeVisibleRow[]
  offsetTop: number
  offsetBottom: number
} {
  const virtualWindow = useMemo(
    () =>
      enabled
        ? getVirtualWindow(
            flatRows.length,
            rowHeight,
            scrollTop,
            containerHeight,
            buffer,
          )
        : { startIndex: 0, endIndex: -1, offsetStart: 0, offsetEnd: 0 },
    [enabled, flatRows.length, rowHeight, scrollTop, containerHeight, buffer],
  )

  const visibleRows = useMemo<CwTreeVisibleRow[]>(() => {
    if (!enabled) return []
    const { startIndex, endIndex } = virtualWindow
    if (startIndex < 0 || endIndex < startIndex) return []
    const out: CwTreeVisibleRow[] = []
    for (let i = startIndex; i <= endIndex; i += 1) {
      const row = flatRows[i]
      if (!row) continue
      out.push({ ...row, startIndex: i })
    }
    return out
  }, [enabled, flatRows, virtualWindow])

  return {
    visibleRows,
    offsetTop: virtualWindow.offsetStart,
    offsetBottom: virtualWindow.offsetEnd,
  }
}
