import { createElement } from 'react'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import type { CwDataTableColumn, CwDataTableConfig } from '../../CwDataTable'
import { ExcelGridCell } from '../ExcelGridCell'
import { excelGridCellRole, renderExcelGridSlot } from '../excelGrid'
import { excelEditorBase } from '@zengchaowu/ui-shared/components/CwExcelEditor/styles'
import type { CwExcelCellStyle, CwExcelCellValue, CwExcelMerge } from '@zengchaowu/ui-shared/components/CwExcelEditor/types'
import { columnLetter, formatCell } from '@zengchaowu/ui-shared/components/CwExcelEditor/functions/workbook'
import { cellCss, GUTTER_WIDTH, MIN_COL_WIDTH, SHEET_ROW_HEIGHT, sumWidths, visibleCellBorders } from '@zengchaowu/ui-shared/components/CwExcelEditor/functions/sheetMetrics'

export type ExcelCommitMove = 'stay' | 'down' | 'up' | 'left' | 'right'

export interface ExcelTableContext {
  headerRow: boolean
  previewing: boolean
  gridEpoch: number
  windowStart: number
  columnRenderCount: number
  sheetWidth: number
  cells: CwExcelCellValue[][]
  merges: CwExcelMerge[]
  styles: (CwExcelCellStyle | null)[][]
  draft: string
  typeover: string | null
  editFocus: 'cell' | 'formula'
  editAt: { row: number; col: number } | null
  selection: () => { row: number; col: number } | null
  widthAt: (col: number) => number
  selectCell: (row: number, col: number) => void
  editCell: (row: number, col: number) => void
  setDraft: (value: string) => void
  cancelEdit: () => void
  commitAt: (row: number, col: number, value: string, move: ExcelCommitMove) => void
  startRowResize: (row: number, event: PointerEvent) => void
}

export function buildSheetRows(input: {
  cells: CwExcelCellValue[][]
  headerRow: boolean
  viewRows: number
  heightAt: (row: number) => number
}) {
  const start = input.headerRow ? 1 : 0
  const count = Math.max(input.cells.length, input.viewRows)
  const rows: Record<string, CwExcelCellValue | number>[] = []
  for (let index = start; index < count; index += 1) {
    const record: Record<string, CwExcelCellValue | number> = {
      __id: index,
      __h: input.heightAt(index),
    }
    rows.push(record)
  }
  return rows
}

export function buildSheetTable(ctx: ExcelTableContext): CwDataTableConfig {
  void ctx.gridEpoch
  const cells = ctx.cells.length ? ctx.cells : [[null]]
  const width = ctx.sheetWidth
  const header = ctx.headerRow ? cells[0] ?? [] : []
  const start = Math.min(ctx.windowStart, Math.max(0, width - 1))
  const end = Math.min(width, start + ctx.columnRenderCount)
  const leftPad = sumWidths(0, start, ctx.widthAt)
  const rightPad = sumWidths(end, width, ctx.widthAt)

  const renderAxis = (row: number, col: number, label: string) => {
    const handle = col < 0 && row >= 0 && !ctx.previewing
      ? createElement('span', {
          className: excelEditorBase.rowResize,
          onPointerDown: (event: ReactPointerEvent<HTMLSpanElement>) => {
            event.preventDefault()
            event.stopPropagation()
            ctx.startRowResize(row, event.nativeEvent)
          },
          onClick: (event: ReactMouseEvent<HTMLSpanElement>) => event.stopPropagation(),
        })
      : null
    return createElement(
      'span',
      {
        className: excelEditorBase.axis,
        'data-excel-grid': 'axis',
        'data-excel-row': String(row),
        'data-excel-col': String(col),
        onClick: () => {
          const current = ctx.selection()
          ctx.selectCell(row < 0 ? (current?.row ?? 0) : row, col < 0 ? (current?.col ?? 0) : col)
        },
      },
      ...(handle ? [label, handle] : [label]),
    )
  }

  const renderValue = (rowIndex: number, colIndex: number, value: CwExcelCellValue, placeholder = '') => {
    if (excelGridCellRole(ctx.merges, rowIndex, colIndex) === 'covered') {
      return createElement('span', {
        'data-excel-grid': 'covered',
        'data-excel-row': String(rowIndex),
        'data-excel-col': String(colIndex),
      })
    }
    const cellEditing = ctx.editAt?.row === rowIndex && ctx.editAt.col === colIndex
    const style = ctx.styles[rowIndex]?.[colIndex]
    const border = visibleCellBorders(ctx.styles, ctx.merges, rowIndex, colIndex)
    return createElement(ExcelGridCell, {
      text: formatCell(value),
      placeholder,
      align: style?.align ?? 'left',
      css: cellCss(style),
      borderShadow: border.shadow,
      borderRight: border.right,
      borderBottom: border.bottom,
      readonly: ctx.previewing,
      selected: false,
      editing: cellEditing,
      draft: cellEditing ? ctx.draft : '',
      typeover: cellEditing ? ctx.typeover : null,
      autofocus: cellEditing && ctx.editFocus === 'cell',
      'data-excel-row': String(rowIndex),
      'data-excel-col': String(colIndex),
      onSelect: () => ctx.selectCell(rowIndex, colIndex),
      onEdit: () => ctx.editCell(rowIndex, colIndex),
      onInput: (value: string) => ctx.setDraft(value),
      onCancel: () => ctx.cancelEdit(),
      onCommit: (payload: { value: string; move: ExcelCommitMove }) => {
        ctx.commitAt(rowIndex, colIndex, payload.value, payload.move)
      },
    })
  }

  const columns: CwDataTableColumn[] = [
    {
      key: '__row',
      title: '',
      width: GUTTER_WIDTH,
      minWidth: GUTTER_WIDTH,
      flex: 0,
      fixed: 'left',
      resizable: false,
      headerRender: () => renderAxis(-1, -1, ''),
      cellRender: ({ row }) => renderAxis(Number(row.__id), -1, String(Number(row.__id) + 1)),
    },
  ]

  const padColumn = (key: string, padWidth: number): CwDataTableColumn => ({
    key,
    title: '',
    width: padWidth,
    minWidth: padWidth,
    flex: 0,
    resizable: false,
    headerRender: () => createElement('span'),
    cellRender: () => renderExcelGridSlot('covered'),
  })
  if (leftPad > 0) columns.push(padColumn('__padL', leftPad))

  for (let col = start; col < end; col += 1) {
    const key = `c${col}`
    const title = ctx.headerRow ? formatCell(header[col] ?? null) || columnLetter(col) : columnLetter(col)
    columns.push({
      key,
      title,
      width: ctx.widthAt(col),
      minWidth: MIN_COL_WIDTH,
      flex: 0,
      align: 'left',
      headerRender: () => (
        ctx.headerRow
          ? renderValue(0, col, header[col] ?? null, columnLetter(col))
          : renderAxis(-1, col, columnLetter(col))
      ),
      cellRender: ({ row }) => {
        const rowIndex = Number(row.__id)
        return renderValue(rowIndex, col, cells[rowIndex]?.[col] ?? null)
      },
    })
  }
  if (rightPad > 0) columns.push(padColumn('__padR', rightPad))

  return {
    columns,
    rowKey: '__id',
    fixedHeader: true,
    borderless: true,
    resizable: true,
    showOverflowTooltip: false,
    virtualScroll: true,
    rowHeight: SHEET_ROW_HEIGHT,
    rowHeightKey: '__h',
    sort: { defaultSortable: false },
    bodyLayout: 'fill',
    persistScrollbar: true,
    syncColumnWidthsFromBody: false,
    defaultExpandFillColumns: false,
  }
}
