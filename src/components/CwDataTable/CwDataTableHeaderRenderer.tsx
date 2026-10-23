import type {
  CwDataTableColumn,
  CwDataTableHeaderRenderContext,
  CwDataTableSortState,
} from './types'

export interface CwDataTableHeaderRendererProps {
  column: CwDataTableColumn
  sortState?: CwDataTableSortState
  onSort: (column: CwDataTableColumn) => void
  isSelected?: boolean
  isHovered?: boolean
}

export function CwDataTableHeaderRenderer({
  column,
  sortState,
  onSort,
  isSelected,
  isHovered,
}: CwDataTableHeaderRendererProps) {
  if (typeof column.headerRender !== 'function') return null

  const ctx: CwDataTableHeaderRenderContext = {
    column,
    sortState,
    onSort,
    isSelected,
    isHovered,
  }
  return <>{column.headerRender(ctx)}</>
}

export default CwDataTableHeaderRenderer
