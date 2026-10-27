import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CwDataTableColumn, CwDataTableColumnSelectConfig } from '../types'

export interface UseColumnSelectOptions {
  columnSelectConfig?: CwDataTableColumnSelectConfig
  visibleColumns: CwDataTableColumn[]
  onUpdate?: (columnKey: string | undefined) => void
  onChange?: (column: CwDataTableColumn | undefined) => void
}

/** 列选中管理 Hook */
export function useColumnSelect(options: UseColumnSelectOptions) {
  const { columnSelectConfig, visibleColumns } = options
  const enabled = columnSelectConfig?.enabled ?? false
  const required = columnSelectConfig?.required ?? false

  // 内部状态（非受控模式）
  const [internalSelectedKey, setInternalSelectedKey] = useState<string | undefined>(() => {
    if (columnSelectConfig?.defaultSelectedColumnKey) {
      return columnSelectConfig.defaultSelectedColumnKey
    }
    if (required) return visibleColumns[0]?.key
    return undefined
  })

  useEffect(() => {
    if (columnSelectConfig?.selectedColumnKey !== undefined) {
      setInternalSelectedKey(columnSelectConfig.selectedColumnKey)
    }
  }, [columnSelectConfig?.selectedColumnKey])

  // 选中的列 key（受控或非受控）
  const selectedColumnKey = useMemo(() => {
    let key =
      columnSelectConfig?.selectedColumnKey !== undefined
        ? columnSelectConfig.selectedColumnKey
        : internalSelectedKey
    if (required && !key) {
      key = visibleColumns[0]?.key
    }
    return key
  }, [columnSelectConfig?.selectedColumnKey, internalSelectedKey, required, visibleColumns])

  // 选中的列对象
  const selectedColumn = useMemo(
    () =>
      selectedColumnKey
        ? visibleColumns.find((col) => col.key === selectedColumnKey)
        : undefined,
    [selectedColumnKey, visibleColumns],
  )

  // 判断列是否被选中
  const isColumnSelected = useCallback(
    (column: CwDataTableColumn) => enabled && column.key === selectedColumnKey,
    [enabled, selectedColumnKey],
  )

  // 处理列选中
  const handleColumnSelect = useCallback(
    (column: CwDataTableColumn) => {
      if (!enabled) return
      // 如果 required 为 true，点击已选中的列不会取消选中
      if (required && column.key === selectedColumnKey) return

      const newKey = column.key === selectedColumnKey ? undefined : column.key

      // 更新内部状态（非受控模式）
      if (columnSelectConfig?.selectedColumnKey === undefined) {
        setInternalSelectedKey(newKey)
      }

      options.onUpdate?.(newKey)
      options.onChange?.(newKey ? column : undefined)
    },
    [
      enabled,
      required,
      selectedColumnKey,
      columnSelectConfig?.selectedColumnKey,
      options.onUpdate,
      options.onChange,
    ],
  )

  // 监听 visibleColumns 变化，如果 required 为 true 且没有选中列，自动选中第一列
  useEffect(() => {
    if (!required || selectedColumnKey) return
    const firstColumn = visibleColumns[0]
    if (!firstColumn) return
    if (columnSelectConfig?.selectedColumnKey !== undefined) return
    setInternalSelectedKey(firstColumn.key)
    options.onChange?.(firstColumn)
  }, [
    required,
    selectedColumnKey,
    visibleColumns,
    columnSelectConfig?.selectedColumnKey,
    options.onChange,
  ])

  return {
    enabled,
    selectedColumnKey,
    selectedColumn,
    isColumnSelected,
    handleColumnSelect,
  }
}
