import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type {
  CwDataTableColumn,
  CwDataTableColumnSelectConfig,
  CwDataTableStyles,
} from '../types'
import {
  computeScrollLeftToCenterColumn,
  getBodyCellClasses,
  getHeaderCellClasses,
} from '../functions'

type ClassVariants = {
  base: string[]
  idle: string[]
  selected: string[]
  hovered: string[]
}

export interface UseColumnSelectionOptions {
  visibleColumns: CwDataTableColumn[]
  styles: CwDataTableStyles
  columnSelect?: CwDataTableColumnSelectConfig
  columnSelectEnabled: boolean
  columnSelectRequired: boolean
  resizable: boolean
  bodyElRef: RefObject<HTMLElement | null>
  headerRef: RefObject<HTMLDivElement | null>
  columnWidths: Record<string, number>
  leftFixedOverlaps: boolean
  rightFixedOverlaps: boolean
  omitLastColumnRightBorder: boolean
  onUpdateColumnSelect?: (columnKey: string | undefined) => void
  onColumnSelectChange?: (column: CwDataTableColumn | undefined) => void
}

/** 列选中 / hover 状态、选中列居中与表头表体单元格 class 变体 */
export function useColumnSelection(options: UseColumnSelectionOptions) {
  const {
    visibleColumns,
    styles,
    columnSelect: columnSelectConfig,
    columnSelectEnabled,
    columnSelectRequired,
    resizable,
    bodyElRef,
    headerRef,
    columnWidths,
    leftFixedOverlaps,
    rightFixedOverlaps,
    omitLastColumnRightBorder,
  } = options

  // 列选中
  const [internalSelectedKey, setInternalSelectedKey] = useState<string | undefined>(() => {
    if (columnSelectConfig?.defaultSelectedColumnKey) {
      return columnSelectConfig.defaultSelectedColumnKey
    }
    if (columnSelectRequired) return visibleColumns[0]?.key
    return undefined
  })

  useEffect(() => {
    if (columnSelectConfig?.selectedColumnKey !== undefined) {
      setInternalSelectedKey(columnSelectConfig.selectedColumnKey)
    }
  }, [columnSelectConfig?.selectedColumnKey])

  const selectedColumnKey = useMemo(() => {
    let key =
      columnSelectConfig?.selectedColumnKey !== undefined
        ? columnSelectConfig.selectedColumnKey
        : internalSelectedKey
    if (columnSelectRequired && !key) {
      key = visibleColumns[0]?.key
    }
    return key
  }, [
    columnSelectConfig?.selectedColumnKey,
    internalSelectedKey,
    columnSelectRequired,
    visibleColumns,
  ])

  const selectedColumn = useMemo(
    () =>
      selectedColumnKey
        ? visibleColumns.find((col) => col.key === selectedColumnKey)
        : undefined,
    [selectedColumnKey, visibleColumns],
  )

  const isColumnSelected = useCallback(
    (column: CwDataTableColumn) =>
      columnSelectEnabled && column.key === selectedColumnKey,
    [columnSelectEnabled, selectedColumnKey],
  )

  const handleColumnSelect = useCallback(
    (column: CwDataTableColumn) => {
      if (!columnSelectEnabled) return
      if (columnSelectRequired && column.key === selectedColumnKey) return

      const newKey = column.key === selectedColumnKey ? undefined : column.key

      if (columnSelectConfig?.selectedColumnKey === undefined) {
        setInternalSelectedKey(newKey)
      }

      options.onUpdateColumnSelect?.(newKey)
      options.onColumnSelectChange?.(newKey ? column : undefined)
    },
    [
      columnSelectEnabled,
      columnSelectRequired,
      selectedColumnKey,
      columnSelectConfig?.selectedColumnKey,
      options.onUpdateColumnSelect,
      options.onColumnSelectChange,
    ],
  )

  useEffect(() => {
    if (!columnSelectRequired || selectedColumnKey) return
    const firstColumn = visibleColumns[0]
    if (!firstColumn) return
    if (columnSelectConfig?.selectedColumnKey !== undefined) return
    setInternalSelectedKey(firstColumn.key)
    options.onColumnSelectChange?.(firstColumn)
  }, [
    columnSelectRequired,
    selectedColumnKey,
    visibleColumns,
    columnSelectConfig?.selectedColumnKey,
    options.onColumnSelectChange,
  ])

  // 列 hover
  const [hoveredColumnKey, setHoveredColumnKey] = useState<string | undefined>(undefined)

  const handleColumnMouseEnter = useCallback(
    (column: CwDataTableColumn) => {
      if (columnSelectEnabled) setHoveredColumnKey(column.key)
    },
    [columnSelectEnabled],
  )

  const handleColumnMouseLeave = useCallback(() => {
    if (columnSelectEnabled) setHoveredColumnKey(undefined)
  }, [columnSelectEnabled])

  const isColumnHovered = useCallback(
    (column: CwDataTableColumn) =>
      columnSelectEnabled && column.key === hoveredColumnKey,
    [columnSelectEnabled, hoveredColumnKey],
  )

  // 选中列水平居中
  const lastCenteredColumnKeyRef = useRef<string | undefined>(selectedColumn?.key)
  useEffect(() => {
    if (!selectedColumn || !columnSelectEnabled) return
    if (lastCenteredColumnKeyRef.current === selectedColumn.key) return
    lastCenteredColumnKeyRef.current = selectedColumn.key

    const body = bodyElRef.current
    const header = headerRef.current
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
  }, [bodyElRef, columnSelectEnabled, columnWidths, headerRef, selectedColumn, visibleColumns])

  // 单元格 class 变体
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
    selectedColumnKey,
    isColumnSelected,
    handleColumnSelect,
    hoveredColumnKey,
    isColumnHovered,
    handleColumnMouseEnter,
    handleColumnMouseLeave,
    getBodyCellClassList,
    getHeaderCellClassList,
  }
}
