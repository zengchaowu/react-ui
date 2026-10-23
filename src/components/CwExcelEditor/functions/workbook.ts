import type { CwExcelCellStyle, CwExcelCellValue, CwExcelMerge, CwExcelSheet, CwExcelWorkbook } from '../types'

export function columnLetter(index: number): string {
  let n = index + 1
  let letters = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    letters = String.fromCharCode(65 + rem) + letters
    n = Math.floor((n - 1) / 26)
  }
  return letters
}

export function createBlankWorkbook(): CwExcelWorkbook {
  return {
    sheets: [
      {
        name: 'Sheet1',
        cells: [[null]],
        merges: [],
      },
    ],
  }
}

function cloneStyle(style: CwExcelCellStyle | null): CwExcelCellStyle | null {
  if (!style) return null
  const border = style.border
  return {
    ...style,
    border: border
      ? {
        left: border.left ? { ...border.left } : undefined,
        right: border.right ? { ...border.right } : undefined,
        top: border.top ? { ...border.top } : undefined,
        bottom: border.bottom ? { ...border.bottom } : undefined,
      }
      : undefined,
  }
}

export function cloneWorkbook(workbook: CwExcelWorkbook): CwExcelWorkbook {
  return {
    sheets: workbook.sheets.map((sheet) => ({
      name: sheet.name,
      cells: sheet.cells.map((row) => row.slice()),
      merges: (sheet.merges ?? []).map((merge) => ({ ...merge })),
      colWidths: (sheet.colWidths ?? []).slice(),
      rowHeights: (sheet.rowHeights ?? []).slice(),
      styles: (sheet.styles ?? []).map((row) => row.map((style) => (cloneStyle(style)))),
    })),
  }
}

export function rectangularize(cells: CwExcelCellValue[][]): CwExcelCellValue[][] {
  const source = cells.length > 0 ? cells : [[null]]
  let width = 0
  let uniform = true
  for (const row of source) {
    if (row.length > width) {
      if (width > 0) uniform = false
      width = row.length
    } else if (row.length !== width) uniform = false
  }
  if (width === 0) return [[null]]
  // 已经对齐的大表不再逐格复制，合并清值时再复制那一行。
  if (uniform) return source.slice()
  return source.map((row) => {
    if (row.length === width) return row.slice()
    const copy = row.slice()
    while (copy.length < width) copy.push(null)
    return copy
  })
}

export function normalizeWorkbook(workbook: CwExcelWorkbook): CwExcelWorkbook {
  const sheets = workbook.sheets.length
    ? workbook.sheets.map((sheet, index) => normalizeSheet(sheet, index))
    : createBlankWorkbook().sheets
  return { sheets }
}

export function normalizeSheet(sheet: CwExcelSheet, index = 0): CwExcelSheet {
  const cells = rectangularize(sheet.cells ?? [])
  const merges = normalizeMerges(sheet.merges)
  clearCoveredCells(cells, merges)
  const colWidths = (sheet.colWidths ?? []).map((width) => (Number.isFinite(width) && width > 0 ? Math.round(width) : 0))
  const rowHeights = (sheet.rowHeights ?? []).map((height) => (Number.isFinite(height) && height > 0 ? Math.round(height) : 0))
  return {
    name: sheet.name?.trim() || `Sheet${index + 1}`,
    cells,
    merges,
    colWidths,
    rowHeights,
    styles: (sheet.styles ?? []).map((row) => row.map((style) => (cloneStyle(style)))),
  }
}

function blankStyleRow(width: number): (CwExcelCellStyle | null)[] {
  return Array(width).fill(null)
}

function shiftMetric(values: number[] | undefined, at: number, count: number, insert: boolean) {
  const next = (values ?? []).slice()
  while (next.length < at) next.push(0)
  if (insert) next.splice(at, 0, ...Array(count).fill(0))
  else next.splice(at, count)
  return next
}

function rangesOverlap(a: CwExcelMerge, b: CwExcelMerge): boolean {
  return a.row < b.row + b.rowspan
    && b.row < a.row + a.rowspan
    && a.col < b.col + b.colspan
    && b.col < a.col + a.colspan
}

/** 丢掉 1×1、越界和互相重叠的区域。重叠时保留先出现的那块。 */
export function normalizeMerges(merges: readonly CwExcelMerge[] | undefined): CwExcelMerge[] {
  const kept: CwExcelMerge[] = []
  for (const merge of merges ?? []) {
    const row = Math.floor(Number(merge?.row))
    const col = Math.floor(Number(merge?.col))
    const rowspan = Math.floor(Number(merge?.rowspan))
    const colspan = Math.floor(Number(merge?.colspan))
    if (!Number.isFinite(row) || !Number.isFinite(col) || row < 0 || col < 0) continue
    if (!Number.isFinite(rowspan) || !Number.isFinite(colspan) || rowspan < 1 || colspan < 1) continue
    if (rowspan === 1 && colspan === 1) continue
    const next = { row, col, rowspan, colspan }
    if (kept.some((item) => rangesOverlap(item, next))) continue
    kept.push(next)
  }
  return kept
}

/** 被盖住的格子不存值。 */
export function clearCoveredCells(cells: CwExcelCellValue[][], merges: readonly CwExcelMerge[]) {
  for (const merge of merges) {
    for (let row = merge.row; row < merge.row + merge.rowspan; row += 1) {
      const line = cells[row]
      if (!line) continue
      let next: CwExcelCellValue[] | null = null
      for (let col = merge.col; col < merge.col + merge.colspan; col += 1) {
        if (row === merge.row && col === merge.col) continue
        if (col >= line.length || line[col] == null) continue
        if (!next) {
          next = line.slice()
          cells[row] = next
        }
        next[col] = null
      }
    }
  }
}

/** 盖住这个格子的合并。没有合并时返回 null。 */
export function mergeCovering(merges: readonly CwExcelMerge[], row: number, col: number): CwExcelMerge | null {
  for (const merge of merges) {
    if (
      row >= merge.row
      && row < merge.row + merge.rowspan
      && col >= merge.col
      && col < merge.col + merge.colspan
    ) return merge
  }
  return null
}

export type ExcelGridCellRole = 'plain' | 'covered' | 'axis'

/** 底层网格角色：合并区只留占位，文字/边框由 merge overlay 绘制。 */
export function excelGridCellRole(
  merges: readonly CwExcelMerge[],
  row: number,
  col: number,
): ExcelGridCellRole {
  if (row < 0 || col < 0) return 'axis'
  if (mergeCovering(merges, row, col)) return 'covered'
  return 'plain'
}

/** 从当前格跨出合并区域。落在另一块合并上时，由调用方再收成锚点。 */
export function stepFromMerge(
  merges: readonly CwExcelMerge[],
  row: number,
  col: number,
  move: 'down' | 'up' | 'left' | 'right',
): { row: number; col: number } {
  const merge = mergeCovering(merges, row, col)
  const originRow = merge?.row ?? row
  const originCol = merge?.col ?? col
  const rowspan = merge?.rowspan ?? 1
  const colspan = merge?.colspan ?? 1
  if (move === 'down') return { row: originRow + rowspan, col: originCol }
  if (move === 'up') return { row: originRow - 1, col: originCol }
  if (move === 'right') return { row: originRow, col: originCol + colspan }
  return { row: originRow, col: originCol - 1 }
}

export function dropMergesOverlapping(
  merges: readonly CwExcelMerge[],
  row: number,
  col: number,
  rowspan: number,
  colspan: number,
): CwExcelMerge[] {
  const area = { row, col, rowspan, colspan }
  return merges.filter((merge) => !rangesOverlap(merge, area))
}

export function insertSheetRow(sheet: CwExcelSheet, at: number) {
  const width = Math.max(sheet.cells[0]?.length ?? 1, 1)
  const index = Math.max(0, at)
  while (sheet.cells.length < index) sheet.cells.push(Array(width).fill(null))
  sheet.cells.splice(index, 0, Array(width).fill(null))
  sheet.rowHeights = shiftMetric(sheet.rowHeights, index, 1, true)
  const styles = (sheet.styles ?? []).slice()
  while (styles.length < index) styles.push(blankStyleRow(width))
  styles.splice(index, 0, blankStyleRow(width))
  sheet.styles = styles
  sheet.merges = sheet.merges.map((merge) => {
    if (merge.row >= index) return { ...merge, row: merge.row + 1 }
    if (merge.row + merge.rowspan > index) return { ...merge, rowspan: merge.rowspan + 1 }
    return merge
  })
}

export function deleteSheetRows(sheet: CwExcelSheet, at: number, count: number) {
  if (count < 1 || at < 0 || at >= sheet.cells.length) return
  if (sheet.cells.length === 1) {
    sheet.cells[0] = (sheet.cells[0] ?? [null]).map(() => null)
    sheet.merges = []
    sheet.rowHeights = []
    sheet.styles = []
    return
  }
  const removed = Math.min(count, sheet.cells.length - at)
  const delEnd = at + removed
  for (const merge of sheet.merges) {
    const end = merge.row + merge.rowspan
    if (merge.row < at || merge.row >= delEnd || delEnd >= end) continue
    const value = sheet.cells[merge.row]?.[merge.col] ?? null
    const line = sheet.cells[delEnd]
    if (!line) continue
    while (line.length <= merge.col) line.push(null)
    line[merge.col] = value
  }
  sheet.cells.splice(at, removed)
  sheet.rowHeights = shiftMetric(sheet.rowHeights, at, removed, false)
  sheet.styles = (sheet.styles ?? []).slice()
  sheet.styles.splice(at, removed)
  if (sheet.cells.length === 0) sheet.cells.push([null])
  sheet.merges = sheet.merges.flatMap((merge) => {
    const next = shiftMergeAfterRowDelete(merge, at, removed)
    return next ? [next] : []
  })
}

function shiftMergeAfterRowDelete(merge: CwExcelMerge, at: number, count: number): CwExcelMerge | null {
  const end = merge.row + merge.rowspan
  const delEnd = at + count
  if (end <= at) return merge
  if (merge.row >= delEnd) return { ...merge, row: merge.row - count }
  const removed = Math.min(end, delEnd) - Math.max(merge.row, at)
  const rowspan = merge.rowspan - removed
  if (rowspan < 1) return null
  const row = merge.row < at ? merge.row : at
  if (rowspan === 1 && merge.colspan === 1) return null
  return { ...merge, row, rowspan }
}

export function insertSheetColumn(sheet: CwExcelSheet, at: number) {
  const index = Math.max(0, at)
  if (sheet.cells.length === 0) {
    sheet.cells.push([null])
    return
  }
  const width = Math.max(sheet.cells[0]?.length ?? 0, index)
  for (const line of sheet.cells) {
    while (line.length < width) line.push(null)
    line.splice(Math.min(index, line.length), 0, null)
  }
  sheet.colWidths = shiftMetric(sheet.colWidths, index, 1, true)
  sheet.styles = (sheet.styles ?? []).map((row) => {
    const next = row.slice()
    while (next.length < index) next.push(null)
    next.splice(Math.min(index, next.length), 0, null)
    return next
  })
  sheet.merges = sheet.merges.map((merge) => {
    if (merge.col >= index) return { ...merge, col: merge.col + 1 }
    if (merge.col + merge.colspan > index) return { ...merge, colspan: merge.colspan + 1 }
    return merge
  })
}

export function deleteSheetColumns(sheet: CwExcelSheet, at: number, count: number) {
  if (count < 1 || at < 0) return
  const width = sheet.cells[0]?.length ?? 0
  if (at >= width) return
  if (width <= 1) {
    for (const line of sheet.cells) line.splice(0, line.length, null)
    if (sheet.cells.length === 0) sheet.cells.push([null])
    sheet.merges = []
    sheet.colWidths = []
    sheet.styles = (sheet.styles ?? []).map(() => [null])
    return
  }
  const removed = Math.min(count, width - at)
  const delEnd = at + removed
  for (const merge of sheet.merges) {
    const end = merge.col + merge.colspan
    if (merge.col < at || merge.col >= delEnd || delEnd >= end) continue
    const value = sheet.cells[merge.row]?.[merge.col] ?? null
    const line = sheet.cells[merge.row]
    if (!line) continue
    while (line.length <= delEnd) line.push(null)
    line[delEnd] = value
  }
  for (const line of sheet.cells) {
    if (at < line.length) line.splice(at, Math.min(removed, line.length - at))
    if (line.length === 0) line.push(null)
  }
  sheet.colWidths = shiftMetric(sheet.colWidths, at, removed, false)
  sheet.styles = (sheet.styles ?? []).map((row) => {
    const next = row.slice()
    if (at < next.length) next.splice(at, Math.min(removed, next.length - at))
    return next
  })
  if (sheet.cells.length === 0) sheet.cells.push([null])
  sheet.merges = sheet.merges.flatMap((merge) => {
    const next = shiftMergeAfterColumnDelete(merge, at, removed)
    return next ? [next] : []
  })
}

function shiftMergeAfterColumnDelete(merge: CwExcelMerge, at: number, count: number): CwExcelMerge | null {
  const end = merge.col + merge.colspan
  const delEnd = at + count
  if (end <= at) return merge
  if (merge.col >= delEnd) return { ...merge, col: merge.col - count }
  const removed = Math.min(end, delEnd) - Math.max(merge.col, at)
  const colspan = merge.colspan - removed
  if (colspan < 1) return null
  const col = merge.col < at ? merge.col : at
  if (merge.rowspan === 1 && colspan === 1) return null
  return { ...merge, col, colspan }
}

export function normalizeCell(value: unknown): CwExcelCellValue {
  if (value == null || value === '') return null
  if (value instanceof Date) {
    const time = value.getTime()
    if (Number.isNaN(time)) return null
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'boolean' || typeof value === 'string') return value
  return String(value)
}

/** 空串写成 null；纯数字写成 number；带前导零的文本保持字符串。 */
export function parseCellDraft(draft: string, previous: CwExcelCellValue): CwExcelCellValue {
  const text = draft
  if (text.trim() === '') return null
  const trimmed = text.trim()
  if (typeof previous === 'boolean' && /^(true|false)$/i.test(trimmed)) {
    return trimmed.toLowerCase() === 'true'
  }
  if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(trimmed)) return Number(trimmed)
  return text
}

/**
 * 纯文本粘贴。没有制表符时整段写入当前格，换行留在这个格子里。
 * 有制表符才按表格展开：列用制表符，行用换行。末尾多出来的换行不算一行。
 */
export function parseClipboardGrid(text: string): string[][] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const body = normalized.endsWith('\n') ? normalized.slice(0, -1) : normalized
  if (body === '') return []
  if (!body.includes('\t')) return [[body]]
  return body.split('\n').map((line) => line.split('\t'))
}

export function formatCell(value: CwExcelCellValue): string {
  if (value == null) return ''
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  return String(value)
}

/** 工作表名最多 31 个字符，去掉 Excel 不允许的符号；重名时在后面加数字。 */
export function allocateSheetName(preferred: string, used: Set<string>): string {
  const base = preferred.replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 31) || 'Sheet'
  if (!used.has(base)) return base
  for (let index = 2; index < 100; index += 1) {
    const suffix = ` ${index}`
    const next = `${base.slice(0, 31 - suffix.length)}${suffix}`
    if (!used.has(next)) return next
  }
  return base
}

/** 当前接收方向键的表格。页面上有多张表时，只让最近点过的那张响应。 */
export const excelKeyboardOwner: { root: HTMLElement | null } = { root: null }
