import { useMemo } from 'react'
import type { CwDataTableConfig } from '../types'

/**
 * 表格配置提取 Hook
 */
export function useTableConfig(config: CwDataTableConfig) {
  const columns = config.columns
  const showHeader = config.showHeader !== false
  const fixedHeader = config.fixedHeader ?? false
  const fixedLeftColumns = config.fixedLeftColumns ?? 0
  const fixedRightColumns = config.fixedRightColumns ?? 0
  const rowHeight = config.rowHeight ?? 50
  const rowHeightKey = config.rowHeightKey
  const virtualScroll = config.virtualScroll ?? false
  const virtualBuffer = config.virtualBuffer ?? 3
  const resizable = config.resizable !== false
  const showOverflowTooltip = config.showOverflowTooltip !== false
  const sortConfig = useMemo(() => config.sort ?? {}, [config.sort])
  const defaultSortable = sortConfig.defaultSortable ?? false
  const rowKey = config.rowKey
  /** 行级属性透传（class / data-* / 事件） */
  const rowAttrs = config.rowAttrs
  const columnSelectConfig = config.columnSelect
  /** 是否从表体同步列宽（默认开启） */
  const syncWidthsFromBody = config.syncColumnWidthsFromBody !== false
  const defaultExpandFillColumns = config.defaultExpandFillColumns === true
  const stretchFitColumnsToContainer = config.stretchFitColumnsToContainer === true
  const bodyLayout = config.bodyLayout ?? 'fill'

  return {
    columns,
    showHeader,
    fixedHeader,
    fixedLeftColumns,
    fixedRightColumns,
    rowHeight,
    rowHeightKey,
    virtualScroll,
    virtualBuffer,
    resizable,
    showOverflowTooltip,
    sortConfig,
    defaultSortable,
    rowKey,
    rowAttrs,
    columnSelectConfig,
    syncWidthsFromBody,
    defaultExpandFillColumns,
    stretchFitColumnsToContainer,
    bodyLayout,
  }
}
