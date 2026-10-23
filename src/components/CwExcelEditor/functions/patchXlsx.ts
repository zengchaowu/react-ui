import type { CwExcelCellValue, CwExcelMerge, CwExcelSheet, CwExcelWorkbook } from '../types'
import { columnLetter } from './workbook'

export interface ExcelSourcePackage {
  buffer: ArrayBuffer
  workbook: CwExcelWorkbook
}

function sameMetrics(a?: number[], b?: number[]) {
  const count = Math.max(a?.length ?? 0, b?.length ?? 0)
  for (let index = 0; index < count; index += 1) {
    if ((a?.[index] ?? 0) !== (b?.[index] ?? 0)) return false
  }
  return true
}

function sameCells(a: CwExcelCellValue[][], b: CwExcelCellValue[][]) {
  if (a.length !== b.length) return false
  for (let row = 0; row < a.length; row += 1) {
    const left = a[row] ?? []
    const right = b[row] ?? []
    if (left.length !== right.length) return false
    for (let col = 0; col < left.length; col += 1) {
      if (left[col] !== right[col]) return false
    }
  }
  return true
}

function sameMerges(a: CwExcelMerge[], b: CwExcelMerge[]) {
  if (a.length !== b.length) return false
  return a.every((item, index) => {
    const other = b[index]
    return !!other
      && item.row === other.row
      && item.col === other.col
      && item.rowspan === other.rowspan
      && item.colspan === other.colspan
  })
}

export function workbookContentSame(a: CwExcelWorkbook, b: CwExcelWorkbook) {
  if (a.sheets.length !== b.sheets.length) return false
  return a.sheets.every((sheet, index) => {
    const other = b.sheets[index]
    if (!other || sheet.name !== other.name) return false
    return sameCells(sheet.cells, other.cells)
      && sameMerges(sheet.merges, other.merges)
      && sameMetrics(sheet.colWidths, other.colWidths)
      && sameMetrics(sheet.rowHeights, other.rowHeights)
  })
}

function sameShape(a: CwExcelWorkbook, b: CwExcelWorkbook) {
  if (a.sheets.length !== b.sheets.length) return false
  return a.sheets.every((sheet, index) => {
    const other = b.sheets[index]
    if (!other) return false
    if (sheet.cells.length !== other.cells.length) return false
    return (sheet.cells[0]?.length ?? 0) === (other.cells[0]?.length ?? 0)
  })
}

function cellRef(row: number, col: number) {
  return `${columnLetter(col)}${row + 1}`
}

function escapeXml(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttr(value: string) {
  return escapeXml(value).replace(/"/g, '&quot;')
}

function numberText(value: number) {
  return Number.isFinite(value) ? String(value) : '0'
}

function pxToExcelWidth(px: number) {
  const mdw = 7
  const padding = Math.round(128 / mdw) / 256
  return Math.round((px / mdw - padding) * 100) / 100
}

function pxToPoints(px: number) {
  return Math.round(px * 72 / 96 * 100) / 100
}

function tagPrefix(tag: string, name: string) {
  return tag.match(new RegExp(`^<((?:[\\w-]+:)?)${name}\\b`))?.[1] ?? ''
}

function openingAttrs(tag: string) {
  const head = tag.match(/^<[^>]+>/)?.[0] ?? tag
  return [...head.matchAll(/([\w:-]+)="([^"]*)"/g)].map((match) => ({
    name: match[1] || '',
    value: match[2] || '',
  }))
}

function matchElement(xml: string, name: string, attr: string, value: string) {
  const pattern = new RegExp(
    `<(?:[\\w-]+:)?${name}\\b(?=[^>]*\\b${attr}="${value}")[^>]*/>|<(?:[\\w-]+:)?${name}\\b(?=[^>]*\\b${attr}="${value}")[^>]*>[\\s\\S]*?</(?:[\\w-]+:)?${name}>`,
  )
  const found = pattern.exec(xml)
  if (!found || found.index == null) return null
  return { start: found.index, end: found.index + found[0].length, text: found[0] }
}

function renderValue(value: CwExcelCellValue, prefix: string) {
  if (typeof value === 'number') return `<${prefix}v>${numberText(value)}</${prefix}v>`
  if (typeof value === 'boolean') return `<${prefix}v>${value ? 1 : 0}</${prefix}v>`
  const space = /[\n\r]|^\s|\s$/.test(value ?? '') ? ' xml:space="preserve"' : ''
  return `<${prefix}is><${prefix}t${space}>${escapeXml(value ?? '')}</${prefix}t></${prefix}is>`
}

function renderCell(existing: string | null, ref: string, value: CwExcelCellValue) {
  if (value == null) {
    if (!existing) return null
    const attrs = openingAttrs(existing).filter((attr) => attr.name !== 't')
    if (!attrs.some((attr) => attr.name === 's')) return ''
    const prefix = tagPrefix(existing, 'c')
    return `<${prefix}c ${attrs.map((attr) => `${attr.name}="${attr.value}"`).join(' ')}/>`
  }
  const attrs = (existing ? openingAttrs(existing) : [{ name: 'r', value: ref }]).filter((attr) => attr.name !== 't')
  if (!attrs.some((attr) => attr.name === 'r')) attrs.unshift({ name: 'r', value: ref })
  const prefix = existing ? tagPrefix(existing, 'c') : ''
  const type = typeof value === 'boolean' ? ' t="b"' : typeof value === 'number' ? '' : ' t="inlineStr"'
  const head = attrs.map((attr) => `${attr.name}="${attr.value}"`).join(' ')
  return `<${prefix}c ${head}${type}>${renderValue(value, prefix)}</${prefix}c>`
}

function columnIndex(letters: string) {
  let col = 0
  for (const char of letters) col = col * 26 + char.charCodeAt(0) - 64
  return col
}

function insertIntoRow(rowXml: string, col: number, cellXml: string) {
  const cells = [...rowXml.matchAll(/<(?:[\w-]+:)?c\b(?=[^>]*\br="([A-Z]+)\d+")[^>]*(?:\/>|>[\s\S]*?<\/(?:[\w-]+:)?c>)/g)]
  const later = cells.find((match) => columnIndex(match[1] || 'A') > col + 1)
  if (later && later.index != null) return `${rowXml.slice(0, later.index)}${cellXml}${rowXml.slice(later.index)}`
  if (rowXml.endsWith('/>')) {
    const prefix = tagPrefix(rowXml, 'row')
    return `${rowXml.replace(/\s*\/>$/, '>')}${cellXml}</${prefix}row>`
  }
  return rowXml.replace(/<\/(?:[\w-]+:)?row>\s*$/, `${cellXml}$&`)
}

function upsertCell(xml: string, row: number, col: number, value: CwExcelCellValue) {
  const ref = cellRef(row, col)
  const current = matchElement(xml, 'c', 'r', ref)
  const rendered = renderCell(current?.text ?? null, ref, value)
  if (current) {
    if (rendered == null) return xml
    return `${xml.slice(0, current.start)}${rendered}${xml.slice(current.end)}`
  }
  if (rendered == null || rendered === '') return xml
  const rowNumber = String(row + 1)
  const rowMatch = matchElement(xml, 'row', 'r', rowNumber)
  if (rowMatch) {
    const nextRow = insertIntoRow(rowMatch.text, col, rendered)
    return `${xml.slice(0, rowMatch.start)}${nextRow}${xml.slice(rowMatch.end)}`
  }
  const rowXml = `<row r="${rowNumber}">${rendered}</row>`
  const rows = [...xml.matchAll(/<(?:[\w-]+:)?row\b(?=[^>]*\br="(\d+)")[^>]*(?:\/>|>[\s\S]*?<\/(?:[\w-]+:)?row>)/g)]
  const later = rows.find((match) => Number(match[1]) > row + 1)
  if (later && later.index != null) return `${xml.slice(0, later.index)}${rowXml}${xml.slice(later.index)}`
  return xml.replace(/<\/(?:[\w-]+:)?sheetData>/, `${rowXml}$&`)
}

function patchCells(xml: string, before: CwExcelCellValue[][], after: CwExcelCellValue[][]) {
  let next = xml
  const rows = Math.max(before.length, after.length)
  for (let row = 0; row < rows; row += 1) {
    const cols = Math.max(before[row]?.length ?? 0, after[row]?.length ?? 0)
    for (let col = 0; col < cols; col += 1) {
      const previous = before[row]?.[col] ?? null
      const value = after[row]?.[col] ?? null
      if (previous === value) continue
      next = upsertCell(next, row, col, value)
    }
  }
  return next
}

function renderMerges(merges: CwExcelMerge[]) {
  if (!merges.length) return ''
  const items = merges.map((merge) => {
    const start = cellRef(merge.row, merge.col)
    const end = cellRef(merge.row + merge.rowspan - 1, merge.col + merge.colspan - 1)
    return `<mergeCell ref="${start}:${end}"/>`
  }).join('')
  return `<mergeCells count="${merges.length}">${items}</mergeCells>`
}

function patchMerges(xml: string, merges: CwExcelMerge[]) {
  const block = renderMerges(merges)
  const current = xml.match(/<(?:[\w-]+:)?mergeCells\b[^>]*(?:\/>|>[\s\S]*?<\/(?:[\w-]+:)?mergeCells>)/)
  if (current && current.index != null) {
    return `${xml.slice(0, current.index)}${block}${xml.slice(current.index + current[0].length)}`
  }
  if (!block) return xml
  return xml.replace(/<\/(?:[\w-]+:)?sheetData>/, `$&${block}`)
}

function parseCols(block: string) {
  return [...block.matchAll(/<(?:[\w-]+:)?col\b([^>]*)\/?>/g)].map((match) => {
    const raw = (match[1] || '').replace(/\/\s*$/, '')
    return {
      min: Number(raw.match(/\bmin="(\d+)"/)?.[1] || 0),
      max: Number(raw.match(/\bmax="(\d+)"/)?.[1] || 0),
      raw,
    }
  }).filter((entry) => entry.min > 0 && entry.max >= entry.min)
}

function withWidth(raw: string, width: number) {
  let next = /\bwidth="/.test(raw)
    ? raw.replace(/\bwidth="[^"]*"/, `width="${width}"`)
    : `${raw} width="${width}"`
  next = /\bcustomWidth="/.test(next)
    ? next.replace(/\bcustomWidth="[^"]*"/, 'customWidth="1"')
    : `${next} customWidth="1"`
  return next
}

function renderCols(entries: Array<{ min: number; max: number; raw: string }>) {
  const cols = entries.map((entry) => {
    const attrs = entry.raw
      .replace(/\bmin="[^"]*"/g, '')
      .replace(/\bmax="[^"]*"/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    return `<col min="${entry.min}" max="${entry.max}"${attrs ? ` ${attrs}` : ''}/>`
  }).join('')
  return `<cols>${cols}</cols>`
}

function splitColumn(entries: Array<{ min: number; max: number; raw: string }>, index: number, width: number) {
  const next: Array<{ min: number; max: number; raw: string }> = []
  let placed = false
  for (const entry of entries) {
    if (index < entry.min || index > entry.max) {
      next.push(entry)
      continue
    }
    placed = true
    if (index > entry.min) next.push({ ...entry, max: index - 1 })
    next.push({ min: index, max: index, raw: withWidth(entry.raw, width) })
    if (index < entry.max) next.push({ ...entry, min: index + 1 })
  }
  if (!placed) {
    next.push({
      min: index,
      max: index,
      raw: `min="${index}" max="${index}" width="${width}" customWidth="1"`,
    })
  }
  return next.sort((a, b) => a.min - b.min)
}

function patchColumnWidths(xml: string, before: number[] | undefined, after: number[] | undefined) {
  const count = Math.max(before?.length ?? 0, after?.length ?? 0)
  const changed: number[] = []
  for (let index = 0; index < count; index += 1) {
    if ((before?.[index] ?? 0) !== (after?.[index] ?? 0) && (after?.[index] ?? 0) > 0) changed.push(index + 1)
  }
  if (!changed.length) return xml
  const current = xml.match(/<(?:[\w-]+:)?cols\b[^>]*>[\s\S]*?<\/(?:[\w-]+:)?cols>/)
  let entries = current ? parseCols(current[0]) : []
  for (const index of changed) {
    const px = after?.[index - 1] ?? 0
    entries = splitColumn(entries, index, pxToExcelWidth(px))
  }
  const block = renderCols(entries)
  if (current && current.index != null) return `${xml.slice(0, current.index)}${block}${xml.slice(current.index + current[0].length)}`
  return xml.replace(/<(?:[\w-]+:)?sheetData\b/, `${block}$&`)
}

function setRowHeight(rowXml: string, points: number) {
  const open = rowXml.match(/^<(?:[\w-]+:)?row\b[^>]*>|^<(?:[\w-]+:)?row\b[^>]*\/>/)?.[0]
  if (!open) return rowXml
  let next = /\bht="/.test(open) ? open.replace(/\bht="[^"]*"/, `ht="${points}"`) : open.replace(/^<(?:[\w-]+:)?row\b/, `$& ht="${points}"`)
  if (!/\bcustomHeight="/.test(next)) next = next.replace(/^<(?:[\w-]+:)?row\b/, '$& customHeight="1"')
  return `${next}${rowXml.slice(open.length)}`
}

function patchRowHeights(xml: string, before: number[] | undefined, after: number[] | undefined) {
  let next = xml
  const count = Math.max(before?.length ?? 0, after?.length ?? 0)
  for (let index = 0; index < count; index += 1) {
    const previous = before?.[index] ?? 0
    const height = after?.[index] ?? 0
    if (previous === height || height <= 0) continue
    const rowNumber = String(index + 1)
    const row = matchElement(next, 'row', 'r', rowNumber)
    const points = pxToPoints(height)
    if (!row) {
      const rowXml = `<row r="${rowNumber}" ht="${points}" customHeight="1"/>`
      next = next.replace(/<\/(?:[\w-]+:)?sheetData>/, `${rowXml}$&`)
      continue
    }
    next = `${next.slice(0, row.start)}${setRowHeight(row.text, points)}${next.slice(row.end)}`
  }
  return next
}

function patchSheet(xml: string, before: CwExcelSheet, after: CwExcelSheet) {
  let next = patchCells(xml, before.cells, after.cells)
  if (!sameMerges(before.merges, after.merges)) next = patchMerges(next, after.merges)
  next = patchColumnWidths(next, before.colWidths, after.colWidths)
  next = patchRowHeights(next, before.rowHeights, after.rowHeights)
  return next
}

function sheetPaths(workbookXml: string, relsXml: string) {
  const tags = workbookXml.match(/<(?:[\w-]+:)?sheet\b[^>]*\/?>/g) ?? []
  return tags.map((tag) => {
    const id = tag.match(/[\w-]+:id="([^"]+)"/)?.[1]
    if (!id) return ''
    const rel = new RegExp(`<(?:[\\w-]+:)?Relationship\\b(?=[^>]*\\bId="${id}")[^>]*>`)
    const node = relsXml.match(rel)?.[0] ?? ''
    const target = node.match(/\bTarget="([^"]+)"/)?.[1] ?? ''
    if (!target) return ''
    const clean = target.replace(/^\//, '')
    return clean.startsWith('xl/') ? clean : `xl/${clean.replace(/^\.\//, '')}`
  })
}

function renameSheets(workbookXml: string, names: string[]) {
  let index = 0
  return workbookXml.replace(/<(?:[\w-]+:)?sheet\b[^>]*\/?>/g, (tag) => {
    const name = names[index]
    index += 1
    if (!name) return tag
    if (/\bname="/.test(tag)) return tag.replace(/\bname="[^"]*"/, `name="${escapeAttr(name)}"`)
    return tag.replace(/<(?:[\w-]+:)?sheet\b/, `$& name="${escapeAttr(name)}"`)
  })
}

function sheetDiffers(before: CwExcelSheet, after: CwExcelSheet) {
  return !sameCells(before.cells, after.cells)
    || !sameMerges(before.merges, after.merges)
    || !sameMetrics(before.colWidths, after.colWidths)
    || !sameMetrics(before.rowHeights, after.rowHeights)
}

/** 在原 xlsx 上改单元格、合并、行高列宽和表名，样式、图片和公式留在原包里。行列数量变了就返回 null。 */
export async function patchXlsx(buffer: ArrayBuffer, before: CwExcelWorkbook, after: CwExcelWorkbook): Promise<Uint8Array | null> {
  if (!sameShape(before, after)) return null
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const workbookXml = await zip.file('xl/workbook.xml')?.async('string')
  const relsXml = await zip.file('xl/_rels/workbook.xml.rels')?.async('string')
  if (!workbookXml || !relsXml) return null
  const paths = sheetPaths(workbookXml, relsXml)
  if (paths.length !== after.sheets.length || paths.some((path) => !path)) return null
  const namesChanged = before.sheets.some((sheet, index) => sheet.name !== after.sheets[index]?.name)
  if (namesChanged) zip.file('xl/workbook.xml', renameSheets(workbookXml, after.sheets.map((sheet) => sheet.name)))
  for (let index = 0; index < after.sheets.length; index += 1) {
    const previous = before.sheets[index]
    const next = after.sheets[index]
    const path = paths[index]
    if (!previous || !next || !path || !sheetDiffers(previous, next)) continue
    const xml = await zip.file(path)?.async('string')
    if (!xml || !xml.includes('sheetData')) return null
    zip.file(path, patchSheet(xml, previous, next))
  }
  if (!namesChanged && before.sheets.every((sheet, index) => !sheetDiffers(sheet, after.sheets[index]!))) {
    return new Uint8Array(buffer.slice(0))
  }
  const written = await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })
  return written
}
