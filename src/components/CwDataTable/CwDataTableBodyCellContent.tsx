import type {
  CwDataTableColumn,
  CwDataTableLifecycle,
  CwDataTableRow,
  CwDataTableStyles,
  CwDataTableTexts,
  CwDataTableTreeRowMeta,
} from './types'
import CwDataTableTreeIndent from './CwDataTableTreeIndent'
import CwDataTableBodyCellInner from './CwDataTableBodyCellInner'

export interface CwDataTableBodyCellContentProps {
  column: CwDataTableColumn
  row: CwDataTableRow
  rowIndex: number
  tableStyles: CwDataTableStyles
  lifecycle?: CwDataTableLifecycle
  treeEnabled?: boolean
  indentSize?: number
  texts?: CwDataTableTexts
  isIndentColumn?: (column: CwDataTableColumn) => boolean
  getTreeRowMeta?: (row: CwDataTableRow) => CwDataTableTreeRowMeta | undefined
  showOverflowTooltip?: boolean
  onToggleTree?: () => void
}

export function CwDataTableBodyCellContent({
  column,
  row,
  rowIndex,
  tableStyles,
  lifecycle,
  treeEnabled,
  indentSize,
  texts,
  isIndentColumn,
  getTreeRowMeta,
  showOverflowTooltip,
  onToggleTree,
}: CwDataTableBodyCellContentProps) {
  if (!row) return null

  const treeMeta = treeEnabled ? getTreeRowMeta?.(row) : undefined

  const showTreeIndent =
    Boolean(treeEnabled) &&
    Boolean(isIndentColumn?.(column)) &&
    Boolean(treeMeta)

  const usesCustomCell =
    typeof column.cellRender === 'function' || Boolean(column.cellComponent)

  const cellInnerExtraClass =
    column.wrap || column.fitContent || !usesCustomCell ? '' : 'truncate'

  const contentClass = [
    column.fitContent ? tableStyles.cellContentFit : tableStyles.cellContent,
    cellInnerExtraClass,
  ]
    .filter(Boolean)
    .join(' ')

  const cellInner = (
    <CwDataTableBodyCellInner
      column={column}
      row={row}
      rowIndex={rowIndex}
      lifecycle={lifecycle}
      treeMeta={treeMeta}
      showOverflowTooltip={showOverflowTooltip}
    />
  )

  return (
    <div className={contentClass}>
      {showTreeIndent && treeMeta ? (
        <CwDataTableTreeIndent
          meta={treeMeta}
          indentSize={indentSize ?? 16}
          tableStyles={tableStyles}
          texts={texts}
          onToggle={onToggleTree}
        >
          {cellInner}
        </CwDataTableTreeIndent>
      ) : (
        cellInner
      )}
    </div>
  )
}

export default CwDataTableBodyCellContent
