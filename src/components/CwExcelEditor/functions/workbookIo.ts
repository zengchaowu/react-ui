import type { CwExcelBorderEdge, CwExcelCellBorders, CwExcelCellStyle, CwExcelCellValue, CwExcelMerge, CwExcelSource, CwExcelWorkbook } from '../types'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'
import { patchXlsx, workbookContentSame, type ExcelSourcePackage } from './patchXlsx'
import { cloneWorkbook, normalizeCell, normalizeWorkbook } from './workbook'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

async function loadXlsx() {
  return import('xlsx')
}

function isCsvName(name: string): boolean {
  return (name.split('?')[0] ?? '').toLowerCase().endsWith('.csv')
}

function sourceName(src: CwExcelSource, fileName?: string): string {
  if (fileName) return fileName
  if (typeof File !== 'undefined' && src instanceof File) return src.name
  if (typeof src === 'string') return src
  return ''
}

async function readWorkbook(src: CwExcelSource, fileName?: string) {
  const XLSX = await loadXlsx()
  const name = sourceName(src, fileName)
  const csv = isCsvName(name)

  if (typeof src === 'string') {
    const response = await fetch(src)
    if (!response.ok) throw new Error('fetch failed')
    if (csv || isCsvName(src)) {
      return XLSX.read(await response.text(), { type: 'string', cellDates: true })
    }
    const buffer = await response.arrayBuffer()
    try {
      return XLSX.read(buffer, { type: 'array', cellDates: true, cellStyles: true })
    } catch {
      return XLSX.read(buffer, { type: 'array', cellDates: true })
    }
  }

  const buffer = src instanceof ArrayBuffer ? src : await src.arrayBuffer()
  if (csv) {
    return XLSX.read(new TextDecoder().decode(buffer), { type: 'string', cellDates: true })
  }
  try {
    return XLSX.read(buffer, { type: 'array', cellDates: true, cellStyles: true })
  } catch {
    return XLSX.read(buffer, { type: 'array', cellDates: true })
  }
}

const SS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
const DRAW = 'http://schemas.openxmlformats.org/drawingml/2006/main'
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
const PKG = 'http://schemas.openxmlformats.org/package/2006/relationships'
const THEME_COLOR = ['lt1', 'dk1', 'lt2', 'dk2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink']

function childByName(el: Element | null | undefined, name: string) {
  if (!el) return null
  return [...el.children].find((child) => child.localName === name) ?? null
}

function childrenByName(el: Element | null | undefined, name: string) {
  if (!el) return []
  return [...el.children].filter((child) => child.localName === name)
}

function hexToHsl(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16) / 255
  const g = parseInt(value.slice(2, 4), 16) / 255
  const b = parseInt(value.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const light = (max + min) / 2
  if (max === min) return [0, 0, light]
  const delta = max - min
  const sat = light > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  let hue = 0
  if (max === r) hue = (g - b) / delta + (g < b ? 6 : 0)
  else if (max === g) hue = (b - r) / delta + 2
  else hue = (r - g) / delta + 4
  return [hue / 6, sat, light]
}

function hslToHex(hue: number, sat: number, light: number) {
  const channel = (p: number, q: number, t: number) => {
    let next = t
    if (next < 0) next += 1
    if (next > 1) next -= 1
    if (next < 1 / 6) return p + (q - p) * 6 * next
    if (next < 1 / 2) return q
    if (next < 2 / 3) return p + (q - p) * (2 / 3 - next) * 6
    return p
  }
  let red = light
  let green = light
  let blue = light
  if (sat !== 0) {
    const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat
    const p = 2 * light - q
    red = channel(p, q, hue + 1 / 3)
    green = channel(p, q, hue)
    blue = channel(p, q, hue - 1 / 3)
  }
  const byte = (value: number) => Math.max(0, Math.min(255, Math.round(value * 255))).toString(16).padStart(2, '0')
  return `${byte(red)}${byte(green)}${byte(blue)}`.toUpperCase()
}

function tintHex(hex: string, tint: number) {
  if (!tint) return hex.replace('#', '').slice(-6).toUpperCase()
  const [hue, sat, light] = hexToHsl(hex)
  const next = tint < 0 ? light * (1 + tint) : light * (1 - tint) + tint
  return hslToHex(hue, sat, Math.max(0, Math.min(1, next)))
}

function readTheme(doc: Document) {
  const scheme = doc.getElementsByTagNameNS(DRAW, 'clrScheme')[0]
  const colors: Record<string, string> = {}
  if (!scheme) return colors
  for (const node of [...scheme.children]) {
    const srgb = childByName(node, 'srgbClr')
    const sys = childByName(node, 'sysClr')
    const value = srgb?.getAttribute('val') || sys?.getAttribute('lastClr')
    if (node.localName && value) colors[node.localName] = value.slice(-6).toUpperCase()
  }
  return colors
}

function colorOf(el: Element | null, theme: Record<string, string>) {
  if (!el) return ''
  const rgb = el.getAttribute('rgb')
  if (rgb) {
    if (rgb.length === 8 && rgb.slice(0, 2).toUpperCase() === '00') return ''
    return `#${rgb.slice(-6).toUpperCase()}`
  }
  const themeIndex = el.getAttribute('theme')
  if (themeIndex == null) return ''
  const base = theme[THEME_COLOR[Number(themeIndex)] || '']
  if (!base) return ''
  return `#${tintHex(base, Number(el.getAttribute('tint') || 0))}`
}

const BORDER_STYLE: Record<string, CwExcelBorderEdge['style']> = {
  hair: 'hair',
  thin: 'thin',
  dashed: 'dashed',
  dotted: 'dotted',
  dashDot: 'dashed',
  dashDotDot: 'dashed',
  slantDashDot: 'dashed',
  medium: 'medium',
  mediumDashed: 'medium',
  mediumDashDot: 'medium',
  mediumDashDotDot: 'medium',
  thick: 'thick',
  double: 'double',
}

function readBorderEdge(el: Element | null, theme: Record<string, string>): CwExcelBorderEdge | undefined {
  const mapped = BORDER_STYLE[el?.getAttribute('style') || '']
  if (!mapped) return undefined
  return { style: mapped, color: colorOf(childByName(el, 'color'), theme) || tokenSolidColors.black }
}

function readBorders(doc: Document, theme: Record<string, string>): (CwExcelCellBorders | null)[] {
  return childrenByName(doc.getElementsByTagNameNS(SS, 'borders')[0], 'border').map((border) => {
    const edge: CwExcelCellBorders = {
      left: readBorderEdge(childByName(border, 'left'), theme),
      right: readBorderEdge(childByName(border, 'right'), theme),
      top: readBorderEdge(childByName(border, 'top'), theme),
      bottom: readBorderEdge(childByName(border, 'bottom'), theme),
    }
    return edge.left || edge.right || edge.top || edge.bottom ? edge : null
  })
}

function readStyleTable(xml: string, theme: Record<string, string>) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const borders = readBorders(doc, theme)
  const fonts = childrenByName(doc.getElementsByTagNameNS(SS, 'fonts')[0], 'font').map((font) => {
    const size = Number(childByName(font, 'sz')?.getAttribute('val') || 0)
    const color = colorOf(childByName(font, 'color'), theme)
    const bold = childByName(font, 'b') != null
    return {
      bold,
      color: color && color !== tokenSolidColors.black ? color : '',
      fontSize: size > 0 && size !== 11 ? size : 0,
    }
  })
  const fills = childrenByName(doc.getElementsByTagNameNS(SS, 'fills')[0], 'fill').map((fill) => {
    const pattern = childByName(fill, 'patternFill')
    if (pattern?.getAttribute('patternType') !== 'solid') return ''
    return colorOf(childByName(pattern, 'fgColor'), theme)
  })
  return childrenByName(doc.getElementsByTagNameNS(SS, 'cellXfs')[0], 'xf').map((xf) => {
    const font = fonts[Number(xf.getAttribute('fontId') || 0)]
    const fill = fills[Number(xf.getAttribute('fillId') || 0)] || ''
    const horizontal = childByName(xf, 'alignment')?.getAttribute('horizontal')
    const align = horizontal === 'center' || horizontal === 'right' || horizontal === 'left' ? horizontal : undefined
    const border = xf.getAttribute('applyBorder') === '0'
      ? null
      : borders[Number(xf.getAttribute('borderId') || 0)]
    const style: CwExcelCellStyle = {}
    if (font?.bold) style.bold = true
    if (font?.color) style.color = font.color
    if (font?.fontSize) style.fontSize = font.fontSize
    if (fill) style.fill = fill
    if (align) style.align = align
    if (border) style.border = border
    return style.bold || style.color || style.fontSize || style.fill || style.align || style.border ? style : null
  })
}

function decodeCell(ref: string) {
  const match = /^([A-Z]+)(\d+)$/.exec(ref.toUpperCase())
  if (!match) return null
  let col = 0
  for (const char of match[1] || '') col = col * 26 + char.charCodeAt(0) - 64
  return { row: Number(match[2]) - 1, col: col - 1 }
}

function stylesFromSheetXml(xml: string, table: (CwExcelCellStyle | null)[]) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const styles: (CwExcelCellStyle | null)[][] = []
  for (const cell of doc.getElementsByTagNameNS(SS, 'c')) {
    const index = Number(cell.getAttribute('s') || 0)
    const style = table[index]
    if (!style) continue
    const at = decodeCell(cell.getAttribute('r') || '')
    if (!at || at.row < 0 || at.col < 0) continue
    while (styles.length <= at.row) styles.push([])
    const row = styles[at.row]
    if (!row) continue
    while (row.length <= at.col) row.push(null)
    row[at.col] = style
  }
  return styles
}

function sheetFormat(xml: string) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const format = doc.getElementsByTagNameNS(SS, 'sheetFormatPr')[0]
  return {
    defaultRowHeight: Number(format?.getAttribute('defaultRowHeight') || 0),
    defaultColWidth: Number(format?.getAttribute('defaultColWidth') || format?.getAttribute('baseColWidth') || 0),
  }
}

/** Excel 列宽（字符）→ 像素；与 SheetJS / Excel 默认 MDW 一致，仅作 !cols 无 wpx 时的兜底 */
function excelColWidthToPx(charWidth: number, mdw = 7) {
  if (!(charWidth > 0) || !(mdw > 0)) return 0
  return Math.round((charWidth + Math.round(128 / mdw) / 256) * mdw)
}

function pointsToPx(points: number) {
  return Math.round(points * 96 / 72)
}

interface SheetLayout {
  styles: (CwExcelCellStyle | null)[][]
  defaultRowPx: number
  defaultColPx: number
  colWidthsPx: number[]
  rowHeightsPx: number[]
}

function colWidthsFromSheetXml(xml: string): number[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const cols = doc.getElementsByTagNameNS(SS, 'cols')[0]
  if (!cols) return []
  const widths: number[] = []
  for (const col of cols.getElementsByTagNameNS(SS, 'col')) {
    const min = Number(col.getAttribute('min') || 1)
    const max = Number(col.getAttribute('max') || min)
    const width = Number(col.getAttribute('width') || 0)
    const px = width > 0 ? excelColWidthToPx(width) : 0
    for (let index = min; index <= max; index += 1) {
      const at = index - 1
      while (widths.length <= at) widths.push(0)
      if (px > 0) widths[at] = px
    }
  }
  return widths
}

function rowsFromSheetXml(xml: string): number[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const heights: number[] = []
  for (const row of doc.getElementsByTagNameNS(SS, 'row')) {
    const index = Number(row.getAttribute('r') || heights.length + 1) - 1
    const ht = Number(row.getAttribute('ht') || 0)
    while (heights.length <= index) heights.push(0)
    if (ht > 0) heights[index] = pointsToPx(ht)
  }
  return heights
}

type ColMeta = { wpx?: number; width?: number; wch?: number; MDW?: number; hidden?: boolean }

function colMetaToPx(item: ColMeta | undefined): number {
  if (!item) return 0
  if (item.hidden) return 1
  if (item.wpx != null && item.wpx > 0) return Math.round(item.wpx)
  const mdw = item.MDW != null && item.MDW > 0 ? item.MDW : 7
  if (item.width != null && item.width > 0) return excelColWidthToPx(item.width, mdw)
  if (item.wch != null && item.wch > 0) return excelColWidthToPx(item.wch, mdw)
  return 0
}

function mergeColWidths(
  colCount: number,
  fallbackPx: number,
  metaCols: ColMeta[],
  xmlCols: number[],
): number[] {
  if (colCount <= 0) return []
  const values = Array(colCount).fill(0)
  for (let index = 0; index < colCount; index += 1) {
    const fromMeta = colMetaToPx(metaCols[index])
    const fromXml = xmlCols[index] ?? 0
    const width = fromMeta || fromXml || fallbackPx
    if (width > 0) values[index] = width
  }
  return values.some((value) => value > 0) ? values : []
}

function resolveRowHeights(
  rowCount: number,
  fallbackPx: number,
  metaRows: Array<{ hpx?: number; hpt?: number; hidden?: boolean } | undefined>,
  xmlRows: number[],
): number[] {
  if (rowCount <= 0) return []
  const values = Array(rowCount).fill(0)
  for (let index = 0; index < rowCount; index += 1) {
    const item = metaRows[index]
    if (item?.hidden) {
      values[index] = 1
      continue
    }
    let height = 0
    if (item?.hpt != null && item.hpt > 0) height = pointsToPx(item.hpt)
    else if (item?.hpx != null && item.hpx > 0) height = Math.round(item.hpx)
    else if ((xmlRows[index] ?? 0) > 0) height = xmlRows[index]!
    else if (fallbackPx > 0) height = fallbackPx
    if (height > 0) values[index] = height
  }
  return values.some((value) => value > 0) ? values : []
}

async function readSheetLayouts(buffer: ArrayBuffer, sheetCount: number): Promise<SheetLayout[]> {
  const empty = (): SheetLayout => ({
    styles: [],
    defaultRowPx: 0,
    defaultColPx: 0,
    colWidthsPx: [],
    rowHeightsPx: [],
  })
  try {
    const { default: JSZip } = await import('jszip')
    const zip = await JSZip.loadAsync(buffer)
    const stylesXml = await zip.file('xl/styles.xml')?.async('string')
    const themeFile = zip.file('xl/theme/theme1.xml') || zip.file(/^xl\/theme\/theme\d+\.xml$/)?.[0]
    const themeXml = themeFile ? await themeFile.async('string') : ''
    const theme = themeXml ? readTheme(new DOMParser().parseFromString(themeXml, 'application/xml')) : {}
    const table = stylesXml ? readStyleTable(stylesXml, theme) : []
    const workbookXml = await zip.file('xl/workbook.xml')?.async('string')
    const relsXml = await zip.file('xl/_rels/workbook.xml.rels')?.async('string')
    if (!workbookXml || !relsXml) return Array.from({ length: sheetCount }, empty)
    const workbook = new DOMParser().parseFromString(workbookXml, 'application/xml')
    const rels = new DOMParser().parseFromString(relsXml, 'application/xml')
    const targets = new Map<string, string>()
    for (const node of rels.getElementsByTagNameNS(PKG, 'Relationship')) {
      const id = node.getAttribute('Id')
      const target = node.getAttribute('Target')
      if (id && target) targets.set(id, target.replace(/^\//, ''))
    }
    const paths = [...workbook.getElementsByTagNameNS(SS, 'sheet')].map((node) => {
      const id = node.getAttributeNS(REL, 'id') || node.getAttribute('r:id') || ''
      const target = targets.get(id) || ''
      if (!target) return ''
      if (target.startsWith('xl/')) return target
      return `xl/${target.replace(/^\.\//, '')}`
    })
    const layouts: SheetLayout[] = []
    for (let index = 0; index < sheetCount; index += 1) {
      const path = paths[index]
      const xml = path ? await zip.file(path)?.async('string') : ''
      if (!xml) {
        layouts.push(empty())
        continue
      }
      const format = sheetFormat(xml)
      layouts.push({
        styles: stylesFromSheetXml(xml, table),
        defaultRowPx: format.defaultRowHeight > 0 ? pointsToPx(format.defaultRowHeight) : 0,
        defaultColPx: format.defaultColWidth > 0 ? excelColWidthToPx(format.defaultColWidth) : 0,
        colWidthsPx: colWidthsFromSheetXml(xml),
        rowHeightsPx: rowsFromSheetXml(xml),
      })
    }
    return layouts
  } catch {
    return Array.from({ length: sheetCount }, empty)
  }
}

function metricList(length: number, fallback: number, explicit: Array<{ wpx?: number; hpx?: number; hpt?: number; hidden?: boolean } | undefined>, kind: 'col' | 'row') {
  const values = Array(length).fill(0)
  for (let index = 0; index < length; index += 1) {
    const item = explicit[index]
    if (item?.hidden) {
      values[index] = 1
      continue
    }
    if (kind === 'col') {
      const px = colMetaToPx(item as ColMeta | undefined)
      if (px > 0) values[index] = px
      else if (fallback > 0) values[index] = fallback
    } else if (kind === 'row' && item?.hpt) values[index] = pointsToPx(item.hpt)
    else if (kind === 'row' && item?.hpx) values[index] = Math.round(item.hpx)
    else if (fallback > 0) values[index] = fallback
  }
  return values.some((value) => value > 0) ? values : []
}

type WorksheetCell = { v?: unknown; w?: unknown }

/** 按 Excel 坐标落格。有效区域如果从 B2、G9 开始，前面的空行空列也要留着。 */
function cellsFromWorksheet(
  XLSX: Awaited<ReturnType<typeof loadXlsx>>,
  sheet: Record<string, unknown> | undefined,
): CwExcelCellValue[][] {
  if (!sheet) return [[null]]
  const ref = typeof sheet['!ref'] === 'string' ? sheet['!ref'] : ''
  const range = ref
    ? XLSX.utils.decode_range(ref)
    : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }
  let maxRow = range.e.r
  let maxCol = range.e.c
  const placed: { row: number; col: number; value: CwExcelCellValue }[] = []
  for (const key of Object.keys(sheet)) {
    if (key.startsWith('!')) continue
    const cell = sheet[key] as WorksheetCell | null
    if (!cell || (cell.v == null && cell.w == null)) continue
    const at = XLSX.utils.decode_cell(key)
    if (at.r > maxRow) maxRow = at.r
    if (at.c > maxCol) maxCol = at.c
    placed.push({ row: at.r, col: at.c, value: normalizeCell(cell.v ?? cell.w) })
  }
  if (maxRow < 0 || maxCol < 0) return [[null]]
  const cells = Array.from({ length: maxRow + 1 }, () => Array<CwExcelCellValue>(maxCol + 1).fill(null))
  for (const item of placed) {
    const line = cells[item.row]
    if (line) line[item.col] = item.value
  }
  return cells
}

export async function parseExcelSource(src: CwExcelSource, fileName?: string): Promise<CwExcelWorkbook> {
  const XLSX = await loadXlsx()
  const name = sourceName(src, fileName)
  const book = await readWorkbook(src, fileName)
  const layouts = isCsvName(name) ? [] : await readSheetLayouts(await readExcelBytes(src), book.SheetNames.length)
  const sheets = book.SheetNames.map((sheetName, index) => {
    const sheet = book.Sheets[sheetName] as {
      '!merges'?: { s: { r: number; c: number }; e: { r: number; c: number } }[]
      '!cols'?: ColMeta[]
      '!rows'?: { hpx?: number; hpt?: number; hidden?: boolean }[]
    } | undefined
    const merges: CwExcelMerge[] = (sheet?.['!merges'] ?? []).map((range) => ({
      row: range.s.r,
      col: range.s.c,
      rowspan: range.e.r - range.s.r + 1,
      colspan: range.e.c - range.s.c + 1,
    }))
    const cells = cellsFromWorksheet(XLSX, sheet as Record<string, unknown> | undefined)
    const layout = layouts[index]
    const metaCols = sheet?.['!cols'] ?? []
    const colCount = Math.max(cells[0]?.length ?? 0, metaCols.length)
    const metaRows = sheet?.['!rows'] ?? []
    const rowCount = Math.max(cells.length, metaRows.length, layout?.rowHeightsPx.length ?? 0)
    const colWidths = mergeColWidths(
      colCount,
      layout?.defaultColPx ?? 0,
      metaCols,
      (layout?.colWidthsPx ?? []).slice(0, colCount),
    )
    const rowHeights = resolveRowHeights(
      rowCount,
      layout?.defaultRowPx ?? 0,
      metaRows,
      layout?.rowHeightsPx ?? [],
    )
    return {
      name: sheetName,
      cells,
      merges,
      colWidths,
      rowHeights,
      styles: layout?.styles ?? [],
    }
  })
  if (!sheets.length) return normalizeWorkbook({ sheets: [] })
  return normalizeWorkbook({ sheets })
}

const excelSources = new WeakMap<CwExcelWorkbook, ExcelSourcePackage>()

function isZip(buffer: ArrayBuffer) {
  if (buffer.byteLength < 4) return false
  const head = new Uint8Array(buffer, 0, 4)
  return head[0] === 0x50 && head[1] === 0x4b
}

function sourceKey(workbook: CwExcelWorkbook) {
  // Vue 侧需要 toRaw 剥掉响应式代理；React 状态不是代理，原对象即可作为 WeakMap 键。
  return workbook
}

/** 记住导入的 xlsx。之后的导出沿用这份压缩包，而不是整本重写。 */
export function attachExcelSource(workbook: CwExcelWorkbook, buffer: ArrayBuffer) {
  if (!isZip(buffer)) return
  excelSources.set(sourceKey(workbook), { buffer, workbook: cloneWorkbook(workbook) })
}

export function carryExcelSource(from: CwExcelWorkbook, to: CwExcelWorkbook) {
  const packed = excelSources.get(sourceKey(to)) ?? excelSources.get(sourceKey(from))
  if (packed) excelSources.set(sourceKey(to), packed)
}

export async function readExcelBytes(src: CwExcelSource) {
  if (typeof src === 'string') {
    const response = await fetch(src)
    if (!response.ok) throw new Error('fetch failed')
    return response.arrayBuffer()
  }
  return src instanceof ArrayBuffer ? src : src.arrayBuffer()
}

function uniqueSheetName(name: string, used: Set<string>): string {
  const base = (name || 'Sheet').replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 31) || 'Sheet'
  if (!used.has(base)) {
    used.add(base)
    return base
  }
  for (let index = 2; index < 100; index += 1) {
    const suffix = ` ${index}`
    const next = `${base.slice(0, 31 - suffix.length)}${suffix}`
    if (!used.has(next)) {
      used.add(next)
      return next
    }
  }
  return base
}

export async function workbookToUint8Array(workbook: CwExcelWorkbook): Promise<Uint8Array> {
  const packed = excelSources.get(sourceKey(workbook))
  if (packed && workbookContentSame(packed.workbook, workbook)) return new Uint8Array(packed.buffer.slice(0))
  if (packed) {
    try {
      const patched = await patchXlsx(packed.buffer, packed.workbook, workbook)
      if (patched) return patched
    } catch {
      // 原文件补不上时再整本重写
    }
  }
  return writeWorkbook(workbook)
}

async function writeWorkbook(workbook: CwExcelWorkbook): Promise<Uint8Array> {
  const XLSX = await loadXlsx()
  const book = XLSX.utils.book_new()
  const normalized = normalizeWorkbook(workbook)
  const used = new Set<string>()
  normalized.sheets.forEach((sheet) => {
    const name = uniqueSheetName(sheet.name, used)
    const aoa = sheet.cells.map((row) => row.map((cell) => (cell == null ? null : cell)))
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    if (sheet.merges.length > 0) {
      ws['!merges'] = sheet.merges.map((merge) => ({
        s: { r: merge.row, c: merge.col },
        e: { r: merge.row + merge.rowspan - 1, c: merge.col + merge.colspan - 1 },
      }))
    }
    const cols = (sheet.colWidths ?? []).map((width) => (width > 0 ? { wpx: width } : {}))
    if (cols.some((col) => 'wpx' in col)) ws['!cols'] = cols
    const rows = (sheet.rowHeights ?? []).map((height) => (height > 0 ? { hpt: height * 72 / 96 } : {}))
    if (rows.some((row) => 'hpt' in row)) ws['!rows'] = rows
    XLSX.utils.book_append_sheet(book, ws, name)
  })
  const written = XLSX.write(book, { bookType: 'xlsx', type: 'array', compression: true }) as ArrayBuffer | Uint8Array
  return written instanceof Uint8Array ? written : new Uint8Array(written)
}

export async function workbookToBlob(workbook: CwExcelWorkbook): Promise<Blob> {
  const buffer = await workbookToArrayBuffer(workbook)
  return new Blob([buffer], { type: XLSX_MIME })
}

export async function workbookToArrayBuffer(workbook: CwExcelWorkbook): Promise<ArrayBuffer> {
  const bytes = await workbookToUint8Array(workbook)
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}
