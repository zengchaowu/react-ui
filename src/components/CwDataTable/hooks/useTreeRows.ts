import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CwDataTableColumn, CwDataTableRow, CwDataTableTreeConfig } from '../types'
import {
  collectExpandableTreeKeys,
  flattenTreeRows,
  getTreeRowMeta,
} from '../functions'

export interface UseTreeRowsOptions {
  tree?: CwDataTableTreeConfig
  modelValue: CwDataTableRow[]
  columns: CwDataTableColumn[]
  rowKeyField?: string
  expandedKeys?: Array<string | number>
  onUpdateExpandedKeys?: (value: Array<string | number>) => void
  onTreeExpandChange?: (expandedKeys: Array<string | number>) => void
}

/** 树形表格：展开态维护 + 拍平可见行 */
export function useTreeRows(options: UseTreeRowsOptions) {
  const {
    tree: treeConfig,
    modelValue,
    columns,
    rowKeyField,
    expandedKeys: expandedKeysProp,
    onUpdateExpandedKeys,
    onTreeExpandChange,
  } = options

  const treeEnabled = treeConfig?.enabled === true
  const childrenKey = treeConfig?.childrenKey ?? 'children'
  const treeIndentSize = treeConfig?.indentSize ?? 16
  const indentColumnKey =
    treeConfig?.indentColumnKey ?? columns.find((c) => c.visible !== false)?.key

  const [expandedKeysState, setExpandedKeysState] = useState<Array<string | number>>(
    () => expandedKeysProp ?? [],
  )
  const expandedKeysRef = useRef(expandedKeysState)
  expandedKeysRef.current = expandedKeysState

  useEffect(() => {
    if (expandedKeysProp === undefined) return
    setExpandedKeysState((prev) => {
      if (prev.length === expandedKeysProp.length && prev.every((k, i) => k === expandedKeysProp[i])) {
        return prev
      }
      return expandedKeysProp
    })
  }, [expandedKeysProp])

  useEffect(() => {
    if (!treeEnabled || modelValue.length === 0) return
    if (expandedKeysRef.current.length > 0) return

    let next: Array<string | number> | null = null
    if (treeConfig?.defaultExpandAll) {
      next = collectExpandableTreeKeys(modelValue, childrenKey, rowKeyField)
    } else if (treeConfig?.defaultExpandedKeys?.length) {
      next = [...treeConfig.defaultExpandedKeys]
    }
    if (next && next.length > 0) {
      setExpandedKeysState(next)
      onUpdateExpandedKeys?.(next)
    }
  }, [
    treeEnabled,
    modelValue,
    treeConfig,
    childrenKey,
    rowKeyField,
    onUpdateExpandedKeys,
  ])

  const prevExpandedKeysRef = useRef(expandedKeysState)
  useEffect(() => {
    if (prevExpandedKeysRef.current === expandedKeysState) return
    prevExpandedKeysRef.current = expandedKeysState
    onTreeExpandChange?.(expandedKeysState)
  }, [expandedKeysState, onTreeExpandChange])

  const toggleTreeExpand = useCallback(
    (row: CwDataTableRow) => {
      const meta = getTreeRowMeta(row)
      if (!meta?.hasChildren) return
      const next = new Set(expandedKeysRef.current)
      if (next.has(meta.rowKey)) next.delete(meta.rowKey)
      else next.add(meta.rowKey)
      const nextKeys = [...next]
      setExpandedKeysState(nextKeys)
      onUpdateExpandedKeys?.(nextKeys)
    },
    [onUpdateExpandedKeys],
  )

  const isIndentColumn = useCallback(
    (column: CwDataTableColumn) => treeEnabled && column.key === indentColumnKey,
    [treeEnabled, indentColumnKey],
  )

  const flatRows = useMemo(
    () =>
      treeEnabled
        ? flattenTreeRows(modelValue, {
            childrenKey,
            rowKey: rowKeyField,
            expandedKeys: new Set(expandedKeysState),
          })
        : modelValue,
    [treeEnabled, modelValue, childrenKey, rowKeyField, expandedKeysState],
  )

  return {
    treeEnabled,
    treeIndentSize,
    indentColumnKey,
    flatRows,
    isIndentColumn,
    toggleTreeExpand,
  }
}
