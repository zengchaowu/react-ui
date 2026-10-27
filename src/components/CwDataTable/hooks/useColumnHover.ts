import { useCallback, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import type { CwDataTableColumn } from '../types'

/**
 * 列选中模式下的列 hover 状态。
 *
 * 判定走表格根容器委托：行底、表头底那 1px 分割线画在容器自己身上（不属于任何单元格），
 * 若按单元格绑 mouseenter/mouseleave，鼠标压到分割线上会先清空、进入下一行再重建，
 * 表现为整列高亮闪烁/消失。容器级判定下：命中单元格就切列，落在分割线上（行/表头容器）
 * 保持当前列不动，其余位置（空态、加载层、行以下空白）才清除。
 */
export function useColumnHover(columnSelectEnabled: boolean) {
  const [hoveredColumnKey, setHoveredColumnKey] = useState<string | undefined>(undefined)
  const hoveredColumnKeyRef = useRef<string | undefined>(undefined)
  hoveredColumnKeyRef.current = hoveredColumnKey

  /** 同列重复命中不触发渲染：mouseover 在切换每个子元素时都会冒泡上来 */
  const applyHoveredKey = useCallback((key: string | undefined) => {
    if (hoveredColumnKeyRef.current === key) return
    hoveredColumnKeyRef.current = key
    setHoveredColumnKey(key)
  }, [])

  /** 外部行插槽用：插槽 DOM 在表格根容器之外，吃不到容器委托 */
  const handleColumnMouseEnter = useCallback(
    (column: CwDataTableColumn) => {
      if (columnSelectEnabled) applyHoveredKey(column.key)
    },
    [applyHoveredKey, columnSelectEnabled],
  )

  /** 鼠标离开单元格、离开表格根容器时清除 */
  const handleColumnMouseLeave = useCallback(() => {
    if (columnSelectEnabled) applyHoveredKey(undefined)
  }, [applyHoveredKey, columnSelectEnabled])

  /** 表格根容器 onMouseOver 委托 */
  const handleColumnHoverOver = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      if (!columnSelectEnabled) return
      const target = event.target as Element | null
      const cell = target?.closest('[data-cw-dt-col]')
      if (cell) {
        applyHoveredKey(cell.getAttribute('data-cw-dt-col') ?? undefined)
        return
      }
      if (!target?.closest('[data-cw-dt-row], [data-cw-dt-header]')) {
        applyHoveredKey(undefined)
      }
    },
    [applyHoveredKey, columnSelectEnabled],
  )

  const isColumnHovered = useCallback(
    (column: CwDataTableColumn) => columnSelectEnabled && column.key === hoveredColumnKey,
    [columnSelectEnabled, hoveredColumnKey],
  )

  return {
    hoveredColumnKey,
    isColumnHovered,
    handleColumnMouseEnter,
    handleColumnMouseLeave,
    handleColumnHoverOver,
  }
}