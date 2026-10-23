import type { CwExcelCellValue, CwExcelSheet, CwExcelWorkbook } from '../types'
import {
  allocateSheetName,
  cloneWorkbook,
  dropMergesOverlapping,
  mergeCovering,
  parseCellDraft,
  parseClipboardGrid,
} from './workbook'

export function ensureCell(sheet: { cells: CwExcelCellValue[][] }, row: number, col: number) {
  const width = Math.max(sheet.cells[0]?.length ?? 0, col + 1, 1)
  while (sheet.cells.length <= row) sheet.cells.push(Array(width).fill(null))
  for (const line of sheet.cells) {
    while (line.length < width) line.push(null)
  }
}

/** 把草稿写入格子。内容没变时返回 false。 */
export function writeCellDraft(sheet: CwExcelSheet, row: number, col: number, draft: string) {
  const inside = row < sheet.cells.length && col < (sheet.cells[row]?.length ?? 0)
  const previous = inside ? (sheet.cells[row]?.[col] ?? null) : null
  const value = parseCellDraft(draft, previous)
  if (inside ? value === previous : value == null) return false
  ensureCell(sheet, row, col)
  const line = sheet.cells[row]
  if (line) line[col] = value
  return true
}

export function applyClipboardGrid(sheet: CwExcelSheet, originRow: number, originCol: number, text: string) {
  const grid = parseClipboardGrid(text)
  if (grid.length === 0) return null
  const single = grid.length === 1 && (grid[0]?.length ?? 0) <= 1
  const originMerge = mergeCovering(sheet.merges, originRow, originCol)
  const writeOrigin = single && originMerge
    ? { row: originMerge.row, col: originMerge.col }
    : { row: originRow, col: originCol }
  let changed = false
  if (!single) {
    const widest = grid.reduce((max, line) => Math.max(max, line.length), 0)
    const cleared = dropMergesOverlapping(sheet.merges, originRow, originCol, grid.length, widest)
    if (cleared.length !== sheet.merges.length) {
      sheet.merges = cleared
      changed = true
    }
  }
  for (let rowOffset = 0; rowOffset < grid.length; rowOffset += 1) {
    const line = grid[rowOffset] ?? []
    for (let colOffset = 0; colOffset < line.length; colOffset += 1) {
      const row = writeOrigin.row + rowOffset
      const col = writeOrigin.col + colOffset
      if (writeCellDraft(sheet, row, col, line[colOffset] ?? '')) changed = true
    }
  }
  const cols = grid.reduce((max, line) => Math.max(max, line.length), 0)
  return { changed, rows: grid.length, cols }
}

function blankSheet(name: string): CwExcelSheet {
  return {
    name,
    cells: [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ],
    merges: [],
  }
}

function usedNames(workbook: CwExcelWorkbook, except?: number) {
  return new Set(
    workbook.sheets.flatMap((sheet, index) => (index === except ? [] : [sheet.name])),
  )
}

export function insertSheetAt(workbook: CwExcelWorkbook, at: number) {
  const next = cloneWorkbook(workbook)
  const name = allocateSheetName(`Sheet${next.sheets.length + 1}`, usedNames(next))
  next.sheets.splice(at, 0, blankSheet(name))
  return { workbook: next, index: at }
}

export function deleteSheetAt(workbook: CwExcelWorkbook, index: number) {
  const next = cloneWorkbook(workbook)
  if (next.sheets.length <= 1 || !next.sheets[index]) return null
  next.sheets.splice(index, 1)
  return { workbook: next, index: Math.min(index, next.sheets.length - 1) }
}

export function duplicateSheetAt(workbook: CwExcelWorkbook, index: number) {
  const next = cloneWorkbook(workbook)
  const source = next.sheets[index]
  if (!source) return null
  const base = source.name.replace(/ \(\d+\)$/, '')
  const used = usedNames(next)
  let name = ''
  for (let copy = 2; copy < 100; copy += 1) {
    const suffix = ` (${copy})`
    const candidate = `${base.slice(0, 31 - suffix.length)}${suffix}`
    if (!used.has(candidate)) {
      name = candidate
      break
    }
  }
  if (!name) name = allocateSheetName(base, used)
  next.sheets.splice(index + 1, 0, {
    name,
    cells: source.cells.map((row) => row.slice()),
    merges: source.merges.map((merge) => ({ ...merge })),
  })
  return { workbook: next, index: index + 1 }
}

export function renameSheetAt(workbook: CwExcelWorkbook, index: number, rawName: string) {
  const name = allocateSheetName(rawName, usedNames(workbook, index))
  if (!name || name === workbook.sheets[index]?.name) return null
  const next = cloneWorkbook(workbook)
  const sheet = next.sheets[index]
  if (!sheet) return null
  sheet.name = name
  return next
}

export function appendSheet(workbook: CwExcelWorkbook) {
  const next = cloneWorkbook(workbook)
  const used = new Set(next.sheets.map((sheet) => sheet.name))
  let number = next.sheets.length + 1
  let name = `Sheet${number}`
  while (used.has(name)) {
    number += 1
    name = `Sheet${number}`
  }
  next.sheets.push(blankSheet(name))
  return { workbook: next, index: next.sheets.length - 1 }
}
