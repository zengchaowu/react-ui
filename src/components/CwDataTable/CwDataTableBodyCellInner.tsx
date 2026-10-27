import type { CwDataTableColumn, CwDataTableLifecycle, CwDataTableRow } from './types'
import type { CwDataTableTreeRowMeta } from '@zengchaowu/ui-shared/components/CwDataTable/types'
import CwDataTableCellRenderer from './CwDataTableCellRenderer'
import CwDataTableCellOverflow from './CwDataTableCellOverflow'
import { isColumnOverflowTooltipEnabled } from '@zengchaowu/ui-shared/components/CwDataTable/functions/overflowTooltip'

export interface CwDataTableBodyCellInnerProps {
  column: CwDataTableColumn
  row: CwDataTableRow
  rowIndex: number
  lifecycle?: CwDataTableLifecycle
  treeMeta?: CwDataTableTreeRowMeta
  showOverflowTooltip?: boolean
}

export function CwDataTableBodyCellInner({
  column,
  row,
  rowIndex,
  lifecycle,
  treeMeta,
  showOverflowTooltip,
}: CwDataTableBodyCellInnerProps) {
  const tableOverflowTooltip = showOverflowTooltip !== false

  const usesCustomCell =
    typeof column.cellRender === 'function' || Boolean(column.cellComponent)

  const needsRenderer =
    usesCustomCell ||
    Boolean(lifecycle?.onBeforeCellRender || lifecycle?.onAfterCellRender)

  const useOverflowShell =
    usesCustomCell && isColumnOverflowTooltipEnabled(column, tableOverflowTooltip)

  const plainTooltipEnabled = isColumnOverflowTooltipEnabled(
    column,
    tableOverflowTooltip,
  )

  const cellText = String(row?.[column.key] ?? '')

  const renderer = (
    <CwDataTableCellRenderer
      column={column}
      row={row}
      value={row?.[column.key]}
      index={rowIndex}
      lifecycle={lifecycle}
      treeMeta={treeMeta}
      showOverflowTooltip={tableOverflowTooltip}
    />
  )

  if (needsRenderer && !useOverflowShell) {
    return renderer
  }

  if (needsRenderer && useOverflowShell) {
    return <CwDataTableCellOverflow text={cellText}>{renderer}</CwDataTableCellOverflow>
  }

  if (column.wrap) {
    return <span>{cellText}</span>
  }

  if (!plainTooltipEnabled) {
    return <span className="truncate">{cellText}</span>
  }

  return <CwDataTableCellOverflow text={cellText}>{cellText}</CwDataTableCellOverflow>
}

export default CwDataTableBodyCellInner
