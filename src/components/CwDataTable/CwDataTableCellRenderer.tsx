import type { ReactNode } from 'react'
import type {
  CwDataTableCellRenderContext,
  CwDataTableColumn,
  CwDataTableLifecycle,
  CwDataTableRow,
  CwDataTableTreeRowMeta,
} from './types'
import { isColumnOverflowTooltipEnabled } from './functions/overflowTooltip'
import CwDataTableCellOverflow from './CwDataTableCellOverflow'

export interface CwDataTableCellRendererProps {
  column: CwDataTableColumn
  row: CwDataTableRow
  value: unknown
  index: number
  lifecycle?: CwDataTableLifecycle
  treeMeta?: CwDataTableTreeRowMeta
  showOverflowTooltip?: boolean
}

export function CwDataTableCellRenderer({
  column,
  row,
  value,
  index,
  lifecycle,
  treeMeta,
  showOverflowTooltip = true,
}: CwDataTableCellRendererProps) {
  const ctx: CwDataTableCellRenderContext = {
    row,
    value,
    index,
    rowIndex: index,
    column,
    treeMeta,
  }

  lifecycle?.onBeforeCellRender?.(row, column, value, index)

  let rendered: ReactNode = null

  if (typeof column.cellRender === 'function') {
    rendered = column.cellRender(ctx)
  } else if (column.cellComponent) {
    const CellComponent = column.cellComponent
    const cellProps = column.cellProps ? column.cellProps(ctx) : {}
    rendered = <CellComponent {...cellProps} />
  } else {
    const text = String(value ?? '')
    if (
      column.wrap ||
      !isColumnOverflowTooltipEnabled(column, showOverflowTooltip)
    ) {
      rendered = <span className={column.wrap ? '' : 'truncate'}>{text}</span>
    } else {
      // Lazy overflow tip — avoid CwTruncateText per default cell
      rendered = <CwDataTableCellOverflow text={text}>{text}</CwDataTableCellOverflow>
    }
  }

  lifecycle?.onAfterCellRender?.(row, column, value, index)

  return <>{rendered}</>
}

export default CwDataTableCellRenderer
