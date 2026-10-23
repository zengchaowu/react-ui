import type { CwExcelCellStyle, CwExcelMerge, CwExcelSheet } from '../types'
import { columnLetter, formatCell, mergeCovering } from './workbook'

export const MIN_SHEET_ROWS = 100
export const MIN_SHEET_COLS = 26
export const SHEET_ROW_CHUNK = 40
export const SHEET_COL_CHUNK = 8
export const SHEET_ROW_HEIGHT = 24
export const MIN_ROW_HEIGHT = 16
export const GUTTER_WIDTH = 42
export const COL_WIDTH = 80
export const MIN_COL_WIDTH = 24
export const ROW_LOOKAHEAD = 4
export const COL_LOOKAHEAD = 2
export const EDGE_SLACK = 240
/** 贴边补行/补列。按住滚动条拖到尽头时不能每个滚动事件都加一块，否则表格会越拖越重。 */
export const EDGE_GROW_INTERVAL = 200
/** 横向只挂视口附近的列。多挂两列，滚动时边上的格子先就位。 */
export const COLUMN_OVERSCAN = 2

const CELL_FONT_PX = 11 * 96 / 72
const CELL_LINE_BOX = 16
const CELL_PAD_X = 8
const CELL_PAD_Y = 8

export function guessColumnRenderCount() {
  if (typeof window === 'undefined') return 32
  return Math.min(120, Math.ceil(window.innerWidth / COL_WIDTH) + COLUMN_OVERSCAN * 2)
}

export function sumWidths(from: number, to: number, widthAt: (col: number) => number) {
  let total = 0
  for (let col = from; col < to; col += 1) total += widthAt(col)
  return total
}

export function columnIndexFromKey(key: string) {
  if (!/^c\d+$/.test(key)) return null
  return Number(key.slice(1))
}

export function scrollSpanIntoView(scrollPos: number, viewSize: number, start: number, size: number) {
  if (viewSize <= 0) return scrollPos
  const end = start + size
  const viewEnd = scrollPos + viewSize
  if (size >= viewSize) {
    if (start < scrollPos || start >= viewEnd) return Math.max(0, start)
    return scrollPos
  }
  if (start < scrollPos) return Math.max(0, start)
  if (end > viewEnd) return Math.max(0, end - viewSize)
  return scrollPos
}

/** 视口里的列都挂上表头。走出已挂范围再整窗平移。返回 null 表示窗口起点不用动。 */
export function planColumnWindow(input: {
  scrollLeft: number
  viewWidth: number
  sheetWidth: number
  windowStart: number
  columnRenderCount: number
  widthAt: (col: number) => number
}) {
  const { sheetWidth: width, widthAt } = input
  const viewW = input.viewWidth
  const target = (viewW > 0 ? viewW : COL_WIDTH * input.columnRenderCount) + COL_WIDTH * COLUMN_OVERSCAN
  let walked = 0
  let firstVisible = 0
  for (let col = 0; col < width; col += 1) {
    const next = walked + widthAt(col)
    if (input.scrollLeft < next) {
      firstVisible = col
      break
    }
    walked = next
    firstVisible = col
  }
  let covered = 0
  let visible = 0
  while (covered < Math.max(viewW, 1) && firstVisible + visible < width) {
    covered += widthAt(firstVisible + visible)
    visible += 1
  }
  visible = Math.max(1, visible)
  const need = Math.min(width, Math.max(visible + COLUMN_OVERSCAN * 2, columnsCovering(0, target, width, widthAt)))
  const start = input.windowStart
  const end = Math.min(width, start + need)
  const lastVisible = firstVisible + visible - 1
  if (firstVisible >= start + COLUMN_OVERSCAN && lastVisible < end - COLUMN_OVERSCAN) {
    return { columnRenderCount: need, windowStart: null as number | null }
  }
  const room = Math.max(0, width - need)
  const next = Math.min(room, Math.max(0, firstVisible - COLUMN_OVERSCAN))
  return { columnRenderCount: need, windowStart: next === start ? null : next }
}

export function columnsCovering(start: number, target: number, width: number, widthAt: (col: number) => number) {
  let covered = 0
  let count = 0
  while (count < width - start && covered < target) {
    covered += widthAt(start + count)
    count += 1
  }
  return Math.max(1, count)
}

/** 按格子宽度折行。中文按一字一宽，英文按半宽，和 11pt 宋体接近。 */
export function wrappedLineCount(text: string, widthPx: number, fontPx: number) {
  const usable = Math.max(fontPx, widthPx - CELL_PAD_X)
  let count = 0
  for (const part of text.split('\n')) {
    if (part.length === 0) {
      count += 1
      continue
    }
    let used = 0
    let lines = 1
    for (const ch of part) {
      const code = ch.codePointAt(0) ?? 0
      const width = code > 0xff ? fontPx : fontPx * 0.55
      if (used + width > usable && used > 0) {
        lines += 1
        used = width
      } else {
        used += width
      }
    }
    count += lines
  }
  return Math.max(1, count)
}

export function fitRowHeight(input: {
  sheet: CwExcelSheet | undefined
  row: number
  editing: boolean
  editAt: { row: number; col: number } | null
  draft: string
  widthAt: (col: number) => number
}) {
  const { sheet, row } = input
  const line = sheet?.cells[row]
  if (!sheet || !line) return SHEET_ROW_HEIGHT
  const merges = sheet.merges ?? []
  let needed = SHEET_ROW_HEIGHT
  for (let col = 0; col < line.length; col += 1) {
    const merge = mergeCovering(merges, row, col)
    if (merge && (merge.row !== row || merge.col !== col)) continue
    const editingHere = input.editing && input.editAt?.row === row && input.editAt.col === col
    const text = editingHere ? input.draft : formatCell(line[col] ?? null)
    if (!text) continue
    const fontPt = sheet.styles?.[row]?.[col]?.fontSize
    const fontPx = fontPt && fontPt > 0 ? fontPt * 96 / 72 : CELL_FONT_PX
    const width = merge
      ? sumWidths(merge.col, merge.col + merge.colspan, input.widthAt)
      : input.widthAt(col)
    const lines = wrappedLineCount(text, width, fontPx)
    const lineBox = fontPt ? Math.max(CELL_LINE_BOX, Math.ceil(fontPx * 1.2)) : CELL_LINE_BOX
    const box = lines * lineBox + CELL_PAD_Y
    if (!merge || merge.rowspan <= 1) {
      needed = Math.max(needed, box)
      continue
    }
    const otherRows = (merge.rowspan - 1) * SHEET_ROW_HEIGHT
    needed = Math.max(needed, Math.max(SHEET_ROW_HEIGHT, box - otherRows))
  }
  return needed
}

export { visibleCellBorders, visibleMergeBorders } from './borderPaint'

export function cellCss(style: CwExcelCellStyle | null | undefined) {
  if (!style) return undefined
  const css: Record<string, string> = {}
  if (style.fill) css.backgroundColor = style.fill
  if (style.color) css.color = style.color
  if (style.bold) css.fontWeight = '700'
  if (style.fontSize) {
    css.fontSize = `${Math.round(style.fontSize * 96 / 72)}px`
    css.lineHeight = '1.2'
  }
  return Object.keys(css).length ? css : undefined
}

export function anchorCell(headerRow: boolean, rowCount: number) {
  if (headerRow && rowCount > 1) return { row: 1, col: 0 }
  return { row: 0, col: 0 }
}

export function selectionLabel(row: number, col: number, merges: readonly CwExcelMerge[]) {
  const start = `${columnLetter(col)}${row + 1}`
  const merge = mergeCovering(merges, row, col)
  if (!merge) return start
  const endCol = merge.col + merge.colspan - 1
  const endRow = merge.row + merge.rowspan - 1
  if (endCol === merge.col && endRow === merge.row) return start
  return `${start}:${columnLetter(endCol)}${endRow + 1}`
}
