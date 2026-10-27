import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import type { CwDataTableColumn, CwDataTableLifecycle, CwDataTableRow } from './types'
import type { CwDataTableStyles } from '@zengchaowu/ui-shared/components/CwDataTable/types'
import type { CwDataTableTexts, CwDataTableTreeRowMeta } from '@zengchaowu/ui-shared/components/CwDataTable/types'
import type { DataTableRenderRow } from './hooks/useVirtualScroll'
import CwDataTableBodyCellContent from './CwDataTableBodyCellContent'
import CwDataTableCellOverflow from './CwDataTableCellOverflow'
import {
  getRowClasses,
  isColumnOverflowTooltipEnabled,
  isPlainTextBodyColumn,
} from './functions'

export interface CwDataTableBodyRowsProps {
  virtualScroll: boolean
  renderRows: DataTableRenderRow[]
  offsetTop: number
  offsetBottom: number
  visibleColumns: CwDataTableColumn[]
  tableStyles: CwDataTableStyles
  omitLastRowBottomBorder: boolean
  columnSelectEnabled: boolean
  /** 参与渲染依赖，保证选中/hover 切换时刷新 class */
  selectedColumnKey?: string
  hoveredColumnKey?: string
  getBodyCellClassList: (column: CwDataTableColumn) => string[]
  getColumnStyle: (column: CwDataTableColumn) => CSSProperties
  handleColumnSelect: (column: CwDataTableColumn) => void
  lifecycle?: CwDataTableLifecycle
  treeEnabled?: boolean
  indentSize?: number
  texts?: CwDataTableTexts
  isIndentColumn?: (column: CwDataTableColumn) => boolean
  getTreeRowMeta?: (row: CwDataTableRow) => CwDataTableTreeRowMeta | undefined
  toggleTreeExpand?: (row: CwDataTableRow) => void
  showOverflowTooltip?: boolean
  /** 行级属性：class / data-* / 事件，透传到行容器 */
  rowAttrs?: (row: any, rowIndex: number) => Record<string, any>
  overlay?: ReactNode
}

export function CwDataTableBodyRows({
  virtualScroll,
  renderRows,
  offsetTop,
  offsetBottom,
  visibleColumns,
  tableStyles,
  omitLastRowBottomBorder,
  columnSelectEnabled,
  getBodyCellClassList,
  getColumnStyle,
  handleColumnSelect,
  lifecycle,
  treeEnabled,
  indentSize,
  texts,
  isIndentColumn,
  getTreeRowMeta,
  toggleTreeExpand,
  showOverflowTooltip,
  rowAttrs,
  overlay,
}: CwDataTableBodyRowsProps) {
  const isPlainColumn = (column: CwDataTableColumn) =>
    isPlainTextBodyColumn(column, {
      treeEnabled,
      isIndentColumn,
      lifecycle,
    })

  const isOverflowTip = (column: CwDataTableColumn) =>
    isColumnOverflowTooltipEnabled(column, showOverflowTooltip !== false)

  const cellText = (row: CwDataTableRow, column: CwDataTableColumn) =>
    String(row?.[column.key] ?? '')

  return (
    <div
      className={[tableStyles.scrollContent, overlay ? 'relative' : '']
        .filter(Boolean)
        .join(' ')}
      style={virtualScroll ? { overflowAnchor: 'none' } : undefined}
    >
      {virtualScroll && offsetTop > 0 ? (
        <div className={tableStyles.placeholder} style={{ height: `${offsetTop}px` }} />
      ) : null}
      {renderRows.map((row) => (
        <div
          key={row.key}
          data-cw-dt-row=""
          className={getRowClasses(
            row.isLast,
            omitLastRowBottomBorder,
            tableStyles,
            columnSelectEnabled,
          )
            .filter(Boolean)
            .join(' ')}
          style={row.height != null ? { height: `${row.height}px` } : undefined}
          {...(rowAttrs ? rowAttrs(row.data, row.rowIndex) : {})}
        >
          {visibleColumns.map((column) => (
            <div
              key={column.key}
              data-cw-dt-col={column.key}
              className={getBodyCellClassList(column).filter(Boolean).join(' ')}
              style={getColumnStyle(column)}
              onClick={
                columnSelectEnabled
                  ? (_event: ReactMouseEvent<HTMLDivElement>) => handleColumnSelect(column)
                  : undefined
              }
            >
              {/* Plain text: Content + CellRenderer + TruncateText 会放大进退成本 */}
              {isPlainColumn(column) ? (
                <div
                  className={
                    column.fitContent ? tableStyles.cellContentFit : tableStyles.cellContent
                  }
                >
                  {column.wrap ? (
                    <span>{cellText(row.data, column)}</span>
                  ) : !isOverflowTip(column) ? (
                    <span className="truncate">{cellText(row.data, column)}</span>
                  ) : (
                    <CwDataTableCellOverflow text={cellText(row.data, column)}>
                      {cellText(row.data, column)}
                    </CwDataTableCellOverflow>
                  )}
                </div>
              ) : (
                <CwDataTableBodyCellContent
                  column={column}
                  row={row.data}
                  rowIndex={row.rowIndex}
                  tableStyles={tableStyles}
                  lifecycle={lifecycle}
                  treeEnabled={treeEnabled}
                  indentSize={indentSize ?? 16}
                  texts={texts}
                  isIndentColumn={isIndentColumn}
                  getTreeRowMeta={getTreeRowMeta}
                  showOverflowTooltip={showOverflowTooltip}
                  onToggleTree={() => toggleTreeExpand?.(row.data)}
                />
              )}
            </div>
          ))}
        </div>
      ))}
      {virtualScroll && offsetBottom > 0 ? (
        <div className={tableStyles.placeholder} style={{ height: `${offsetBottom}px` }} />
      ) : null}
      {overlay}
    </div>
  )
}

export default CwDataTableBodyRows
