import { useCallback, useMemo } from 'react'
import type { CwDataTableColumn, CwDataTableStyles } from '../types'
import { getBodyCellClasses, getHeaderCellClasses } from '../functions'

type ClassVariants = {
  base: string[]
  idle: string[]
  selected: string[]
  hovered: string[]
}

export interface UseCellClassListsOptions {
  visibleColumns: CwDataTableColumn[]
  styles: CwDataTableStyles
  leftFixedOverlaps: boolean
  rightFixedOverlaps: boolean
  omitLastColumnRightBorder: boolean
  resizable: boolean
  columnSelectEnabled: boolean
  selectedColumnKey?: string
  hoveredColumnKey?: string
}

/**
 * 预计算每列 class 变体；选中/hover 只做 key 查表，复用数组引用。
 */
export function useCellClassLists(options: UseCellClassListsOptions) {
  const {
    visibleColumns,
    styles,
    leftFixedOverlaps,
    rightFixedOverlaps,
    omitLastColumnRightBorder,
    resizable,
    columnSelectEnabled,
    selectedColumnKey,
    hoveredColumnKey,
  } = options

  const bodyVariantsByKey = useMemo(() => {
    const map = new Map<string, ClassVariants>()
    for (const column of visibleColumns) {
      const base = getBodyCellClasses(
        column,
        visibleColumns,
        styles,
        leftFixedOverlaps,
        rightFixedOverlaps,
        false,
        false,
        omitLastColumnRightBorder,
      )
      const idle = base.concat('cursor-pointer')
      map.set(column.key, {
        base,
        idle,
        selected: idle.concat(styles.cellSelected),
        hovered: idle.concat(styles.cellHovered),
      })
    }
    return map
  }, [
    visibleColumns,
    styles,
    leftFixedOverlaps,
    rightFixedOverlaps,
    omitLastColumnRightBorder,
  ])

  const headerVariantsByKey = useMemo(() => {
    const map = new Map<string, ClassVariants>()
    for (const column of visibleColumns) {
      const base = getHeaderCellClasses(
        column,
        visibleColumns,
        styles,
        leftFixedOverlaps,
        rightFixedOverlaps,
        resizable,
        false,
        false,
        omitLastColumnRightBorder,
      )
      const idle = base.concat('cursor-pointer')
      map.set(column.key, {
        base,
        idle,
        selected: idle.concat(styles.headerCellSelected),
        hovered: idle.concat(styles.headerCellHovered),
      })
    }
    return map
  }, [
    visibleColumns,
    styles,
    leftFixedOverlaps,
    rightFixedOverlaps,
    resizable,
    omitLastColumnRightBorder,
  ])

  const pickVariant = useCallback(
    (map: Map<string, ClassVariants>, column: CwDataTableColumn) => {
      const entry = map.get(column.key)
      if (!entry) return []
      if (!columnSelectEnabled) return entry.base
      if (column.key === selectedColumnKey) return entry.selected
      if (column.key === hoveredColumnKey) return entry.hovered
      return entry.idle
    },
    [columnSelectEnabled, selectedColumnKey, hoveredColumnKey],
  )

  const getBodyCellClassList = useCallback(
    (column: CwDataTableColumn) => pickVariant(bodyVariantsByKey, column),
    [pickVariant, bodyVariantsByKey],
  )

  const getHeaderCellClassList = useCallback(
    (column: CwDataTableColumn) => pickVariant(headerVariantsByKey, column),
    [pickVariant, headerVariantsByKey],
  )

  return {
    getBodyCellClassList,
    getHeaderCellClassList,
  }
}
