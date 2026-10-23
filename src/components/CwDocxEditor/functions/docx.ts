import type {
  CwDocxAlign,
  CwDocxBlock,
  CwDocxDocument,
  CwDocxImage,
  CwDocxInlineParagraph,
  CwDocxParagraph,
  CwDocxRun,
  CwDocxSource,
  CwDocxTable,
  CwDocxTableCell,
} from '../types'

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
const A = 'http://schemas.openxmlformats.org/drawingml/2006/main'
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
const RELS = 'http://schemas.openxmlformats.org/package/2006/relationships'
const WP = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
const PIC = 'http://schemas.openxmlformats.org/drawingml/2006/picture'

const DEFAULT_SECT_PR =
  '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>'

const DOCUMENT_OPEN = `<w:document xmlns:w="${W}" xmlns:r="${R}" xmlns:wp="${WP}" xmlns:a="${A}" xmlns:pic="${PIC}" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="w14 w15 wp14">`

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function createBlankDocument(): CwDocxDocument {
  return {
    blocks: [
      paragraph('标题', 1),
      paragraph('正文', 0),
    ],
  }
}

export function paragraph(
  text: string,
  level = 0,
  options?: Partial<Omit<CwDocxParagraph, 'id' | 'kind' | 'level' | 'runs'>>,
  runStyle?: Partial<CwDocxRun>,
): CwDocxParagraph {
  return {
    id: createId('p'),
    kind: 'paragraph',
    level,
    runs: [{ text, ...runStyle }],
    ...options,
  }
}

function cloneInlineParagraph(p: CwDocxInlineParagraph): CwDocxInlineParagraph {
  return { ...p, runs: p.runs.map((run) => ({ ...run })) }
}

export function cloneDocument(document: CwDocxDocument): CwDocxDocument {
  return {
    blocks: document.blocks.map((block) => {
      if (block.kind === 'table') {
        return {
          ...block,
          rows: block.rows.map((row) =>
            row.map((cell) => ({
              ...cell,
              paragraphs: cell.paragraphs.map((p) => cloneInlineParagraph(p)),
            })),
          ),
        }
      }
      if (block.kind === 'paragraph') return { ...block, runs: block.runs.map((run) => ({ ...run })) }
      return { ...block }
    }),
    originalPackage: document.originalPackage ? document.originalPackage.slice(0) : undefined,
    sectPrXml: document.sectPrXml,
    numberingXml: document.numberingXml,
  }
}

export function sameDocument(left: CwDocxDocument, right: CwDocxDocument) {
  const snapshot = (doc: CwDocxDocument) =>
    JSON.stringify({
      blocks: doc.blocks,
      sectPrXml: doc.sectPrXml,
      numberingXml: doc.numberingXml,
    })
  return snapshot(left) === snapshot(right)
}

export async function readDocxSource(src: CwDocxSource): Promise<ArrayBuffer> {
  if (typeof src === 'string') {
    const response = await fetch(src)
    if (!response.ok) throw new Error('fetch failed')
    return response.arrayBuffer()
  }
  if (src instanceof Blob) return src.arrayBuffer()
  return src
}

function sanitizeXmlText(value: string) {
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\uFFFE\uFFFF]/g, '')
}

function escapeXml(value: string) {
  return sanitizeXmlText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function serializeElement(element: Element) {
  return new XMLSerializer().serializeToString(element)
}

function parseXml(xml: string) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.querySelector('parsererror')) throw new Error('xml')
  return doc
}

function attr(el: Element | undefined, name: string) {
  if (!el) return ''
  return el.getAttributeNS(W, name) || el.getAttribute(`w:${name}`) || el.getAttribute(name) || ''
}

function headingLevel(style: string) {
  const match = /heading\s*(\d+)/i.exec(style) || /标题\s*(\d+)/.exec(style)
  if (match) return Math.min(9, Number(match[1]) || 1)
  if (/^title$/i.test(style)) return 1
  return 0
}

function readRels(xml: string) {
  const doc = parseXml(xml)
  const map = new Map<string, string>()
  for (const node of doc.getElementsByTagName('Relationship')) {
    const id = node.getAttribute('Id')
    const target = node.getAttribute('Target')
    if (id && target) map.set(id, target)
  }
  return map
}

function resolveTarget(basePath: string, target: string) {
  if (target.startsWith('/')) return target.replace(/^\//, '')
  const parts = basePath.split('/').slice(0, -1)
  for (const bit of target.split('/')) {
    if (bit === '..') parts.pop()
    else if (bit && bit !== '.') parts.push(bit)
  }
  return parts.join('/')
}

function mimeOf(path: string) {
  const lower = path.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.gif')) return 'image/gif'
  if (lower.endsWith('.webp')) return 'image/webp'
  return ''
}

function bytesToDataUrl(bytes: Uint8Array, mime: string) {
  let binary = ''
  const size = 0x8000
  for (let index = 0; index < bytes.length; index += size) {
    binary += String.fromCharCode(...bytes.subarray(index, index + size))
  }
  return `data:${mime};base64,${btoa(binary)}`
}

async function readImage(zip: import('jszip'), target: string): Promise<string> {
  const path = target.startsWith('word/') ? target : `word/${target.replace(/^\//, '')}`
  const mime = mimeOf(path)
  const file = zip.file(path) || zip.file(target.replace(/^\//, ''))
  if (!mime || !file) return ''
  return bytesToDataUrl(await file.async('uint8array'), mime)
}

function isBold(el: Element) {
  const mark = el.getElementsByTagNameNS(W, 'b')[0]
  if (!mark) return false
  const value = attr(mark, 'val')
  return value !== '0' && value !== 'false'
}

function isItalic(el: Element) {
  const mark = el.getElementsByTagNameNS(W, 'i')[0]
  if (!mark) return false
  const value = attr(mark, 'val')
  return value !== '0' && value !== 'false'
}

function readRunProperties(rPr: Element | undefined): Partial<CwDocxRun> {
  if (!rPr) return {}
  const sz = rPr.getElementsByTagNameNS(W, 'sz')[0]
  const fontSize = sz ? Number(attr(sz, 'val')) || undefined : undefined
  return {
    bold: isBold(rPr) || undefined,
    italic: isItalic(rPr) || undefined,
    fontSize,
  }
}

function readRunText(run: Element) {
  let text = ''
  for (const child of [...run.children]) {
    const name = child.localName
    if (name === 't') text += child.textContent || ''
    else if (name === 'tab') text += '\t'
    else if (name === 'br' || name === 'cr') text += '\n'
  }
  return text
}

function readRun(run: Element): CwDocxRun {
  const rPr = run.getElementsByTagNameNS(W, 'rPr')[0]
  const props = readRunProperties(rPr)
  const runBlock: CwDocxRun = { text: readRunText(run) }
  if (props.bold) runBlock.bold = true
  if (props.italic) runBlock.italic = true
  if (props.fontSize) runBlock.fontSize = props.fontSize
  return runBlock
}

type ParagraphMeta = Omit<CwDocxInlineParagraph, 'id' | 'runs' | 'level'>

function readParagraphMeta(paragraphNode: Element): ParagraphMeta {
  const pPr = paragraphNode.getElementsByTagNameNS(W, 'pPr')[0]
  const styleId = pPr ? attr(pPr.getElementsByTagNameNS(W, 'pStyle')[0], 'val') : ''
  const meta: ParagraphMeta = {}
  if (styleId) meta.styleId = styleId

  if (!pPr) return meta

  const jcVal = attr(pPr.getElementsByTagNameNS(W, 'jc')[0], 'val')
  if (jcVal === 'center') meta.align = 'center'
  else if (jcVal === 'right') meta.align = 'right'
  else if (jcVal === 'both') meta.align = 'both'

  const ind = pPr.getElementsByTagNameNS(W, 'ind')[0]
  if (ind) {
    meta.indentLeft = Number(attr(ind, 'left')) || undefined
    let indentFirstLine = Number(attr(ind, 'firstLine')) || undefined
    if (!indentFirstLine) {
      const chars = Number(attr(ind, 'firstLineChars'))
      if (chars) indentFirstLine = Math.round((chars * 210) / 100)
    }
    meta.indentFirstLine = indentFirstLine
  }

  const spacing = pPr.getElementsByTagNameNS(W, 'spacing')[0]
  if (spacing) {
    meta.spaceBefore = Number(attr(spacing, 'before')) || undefined
    meta.spaceAfter = Number(attr(spacing, 'after')) || undefined
    meta.line = Number(attr(spacing, 'line')) || undefined
    const lineRule = attr(spacing, 'lineRule')
    if (lineRule === 'exact' || lineRule === 'atLeast' || lineRule === 'auto') meta.lineRule = lineRule
  }

  const numPr = pPr.getElementsByTagNameNS(W, 'numPr')[0]
  if (numPr) {
    meta.numId = Number(attr(numPr.getElementsByTagNameNS(W, 'numId')[0], 'val')) || undefined
    meta.ilvl = Number(attr(numPr.getElementsByTagNameNS(W, 'ilvl')[0], 'val')) || 0
  }

  return meta
}

function blipEmbedId(el: Element): string {
  const blips = el.getElementsByTagNameNS(A, 'blip')
  for (const blip of blips) {
    const id =
      blip.getAttributeNS(R, 'embed')
      || blip.getAttribute('r:embed')
      || blip.getAttributeNS(R, 'link')
      || ''
    if (id) return id
  }
  const legacy = el.getElementsByTagNameNS(W, 'imagedata')[0]
  if (legacy) {
    return legacy.getAttributeNS(R, 'id') || legacy.getAttribute('r:id') || ''
  }
  return ''
}

function runsFromParagraphNode(paragraphNode: Element) {
  const runs: CwDocxRun[] = []
  const walk = (el: Element) => {
    for (const child of [...el.children]) {
      if (child.localName === 'r') {
        if (blipEmbedId(child)) continue
        const run = readRun(child)
        if (run.text) runs.push(run)
      } else if (child.localName === 'hyperlink') walk(child)
    }
  }
  walk(paragraphNode)
  return runs
}

function inlineParagraphFromNode(paragraphNode: Element): CwDocxInlineParagraph {
  const style = attr(paragraphNode.getElementsByTagNameNS(W, 'pStyle')[0], 'val')
  const level = headingLevel(style)
  const meta = readParagraphMeta(paragraphNode)
  const runs = runsFromParagraphNode(paragraphNode)
  return {
    id: createId('p'),
    level,
    runs: runs.length ? runs : [{ text: '' }],
    ...meta,
    styleId: meta.styleId || style || undefined,
  }
}

function readTableCell(cell: Element): CwDocxTableCell {
  const tcPr = cell.getElementsByTagNameNS(W, 'tcPr')[0]
  const colSpan = tcPr ? Number(attr(tcPr.getElementsByTagNameNS(W, 'gridSpan')[0], 'val')) || undefined : undefined
  const vMerge = tcPr ? attr(tcPr.getElementsByTagNameNS(W, 'vMerge')[0], 'val') : ''
  const paragraphs: CwDocxInlineParagraph[] = []
  for (const child of [...cell.children]) {
    if (child.localName === 'p') paragraphs.push(inlineParagraphFromNode(child))
  }
  if (!paragraphs.length) paragraphs.push({ id: createId('p'), level: 0, runs: [{ text: '' }] })
  return {
    paragraphs,
    colSpan: colSpan && colSpan > 1 ? colSpan : undefined,
    vMergeContinue: vMerge === 'continue' ? true : undefined,
  }
}

function readTable(table: Element): CwDocxTable {
  const rows: CwDocxTableCell[][] = []
  for (const row of [...table.children].filter((child) => child.localName === 'tr')) {
    const cells = [...row.children]
      .filter((child) => child.localName === 'tc')
      .map((cell) => readTableCell(cell))
    if (cells.length) rows.push(cells)
  }
  return { id: createId('table'), kind: 'table', rows }
}

function makeParagraphBlock(
  runs: CwDocxRun[],
  level: number,
  meta: ParagraphMeta,
): CwDocxParagraph {
  return {
    id: createId('p'),
    kind: 'paragraph',
    level,
    runs: runs.length ? runs : [{ text: '' }],
    ...meta,
  }
}

async function blocksFromParagraph(
  paragraphNode: Element,
  rels: Map<string, string>,
  zip: import('jszip'),
): Promise<CwDocxBlock[]> {
  const style = attr(paragraphNode.getElementsByTagNameNS(W, 'pStyle')[0], 'val')
  const level = headingLevel(style)
  const meta = readParagraphMeta(paragraphNode)
  if (style && !meta.styleId) meta.styleId = style

  const blocks: CwDocxBlock[] = []
  let runs: CwDocxRun[] = []

  const flush = () => {
    blocks.push(makeParagraphBlock(runs, level, meta))
    runs = []
  }

  const pushImage = async (embed: string) => {
    if (runs.length) flush()
    const target = rels.get(embed)
    if (!target) return
    const dataUrl = await readImage(zip, resolveTarget('word/document.xml', target))
    if (dataUrl) {
      blocks.push({
        id: createId('image'),
        kind: 'image',
        dataUrl,
        sourceRelId: embed,
        sourceMediaTarget: target,
      })
    }
  }

  for (const child of [...paragraphNode.children]) {
    if (child.localName === 'r') {
      const embed = blipEmbedId(child)
      if (embed) {
        await pushImage(embed)
        continue
      }
      const run = readRun(child)
      if (run.text) runs.push(run)
      continue
    }
    if (child.localName === 'hyperlink') {
      for (const runNode of [...child.children].filter((node) => node.localName === 'r')) {
        const embed = blipEmbedId(runNode)
        if (embed) {
          await pushImage(embed)
          continue
        }
        const run = readRun(runNode)
        if (run.text) runs.push(run)
      }
    }
  }

  if (runs.length) flush()
  if (!blocks.length) blocks.push(makeParagraphBlock([], level, meta))

  return blocks
}

async function walkContainer(
  container: Element,
  blocks: CwDocxBlock[],
  rels: Map<string, string>,
  zip: import('jszip'),
) {
  for (const child of [...container.children]) {
    if (child.localName === 'p') {
      blocks.push(...await blocksFromParagraph(child, rels, zip))
    } else if (child.localName === 'tbl') {
      const table = readTable(child)
      if (table.rows.length) blocks.push(table)
    } else if (child.localName === 'sdt') {
      const content = [...child.children].find((node) => node.localName === 'sdtContent')
      if (content) await walkContainer(content, blocks, rels, zip)
    }
  }
}

export async function parseDocx(buffer: ArrayBuffer): Promise<CwDocxDocument> {
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(buffer)
  const xml = await zip.file('word/document.xml')?.async('string')
  if (!xml) throw new Error('docx')
  const relsXml = await zip.file('word/_rels/document.xml.rels')?.async('string')
  const rels = relsXml ? readRels(relsXml) : new Map<string, string>()
  const doc = parseXml(xml)
  const body = doc.getElementsByTagNameNS(W, 'body')[0]
  const blocks: CwDocxBlock[] = []
  if (body) await walkContainer(body, blocks, rels, zip)
  let sectPrXml: string | undefined
  if (body) {
    const children = [...body.children]
    const last = children[children.length - 1]
    if (last?.localName === 'sectPr') sectPrXml = serializeElement(last)
  }
  const numberingXml = await zip.file('word/numbering.xml')?.async('string')
  return {
    blocks: blocks.length ? blocks : [paragraph('', 0)],
    originalPackage: buffer.slice(0),
    sectPrXml,
    numberingXml: numberingXml || undefined,
  }
}

function dataUrlBytes(dataUrl: string) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl)
  if (!match) return null
  const mime = match[1] || ''
  let ext = 'jpeg'
  if (mime.includes('png')) ext = 'png'
  else if (mime.includes('gif')) ext = 'gif'
  else if (mime.includes('webp')) ext = 'webp'
  const binary = atob(match[2] || '')
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return { bytes, ext, mime }
}

const IMAGE_REL_TYPE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image'

interface PackageRelationship {
  id: string
  type: string
  target: string
}

function parseDocumentRelationships(xml: string): PackageRelationship[] {
  const doc = parseXml(xml)
  const relationships: PackageRelationship[] = []
  const nodes = doc.getElementsByTagNameNS(RELS, 'Relationship')
  const list = nodes.length ? nodes : doc.getElementsByTagName('Relationship')
  for (const node of list) {
    const id = node.getAttribute('Id')
    const type = node.getAttribute('Type')
    const target = node.getAttribute('Target')
    if (id && type && target) relationships.push({ id, type, target })
  }
  return relationships
}

function serializeDocumentRelationships(relationships: PackageRelationship[]) {
  const items = relationships
    .map(
      (rel) =>
        `<Relationship Id="${rel.id}" Type="${rel.type}" Target="${escapeXml(rel.target)}"/>`,
    )
    .join('')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${RELS}">${items}</Relationships>`
}

function createRelationshipIdAllocator(relationships: PackageRelationship[]) {
  let max = 0
  for (const rel of relationships) {
    const match = /^rId(\d+)$/i.exec(rel.id)
    if (match) max = Math.max(max, Number(match[1]))
  }
  let next = max + 1
  return () => `rId${next++}`
}

function mediaZipPath(target: string) {
  const normalized = target.replace(/^\//, '')
  return normalized.startsWith('word/') ? normalized : `word/${normalized}`
}

function zipHasMedia(zip: import('jszip'), target: string) {
  const path = mediaZipPath(target)
  return Boolean(zip.file(path) || zip.file(target.replace(/^\//, '')))
}

interface BodyBuildState {
  zip: import('jszip') | null
  relationships: PackageRelationship[]
  allocRelId: () => string
  mediaIndex: number
  shapeId: number
}

function ensureImageRelationship(state: BodyBuildState, relId: string, target: string) {
  const exists = state.relationships.some((rel) => rel.id === relId)
  if (!exists) {
    state.relationships.push({ id: relId, type: IMAGE_REL_TYPE, target })
  }
}

function appendImageBlock(state: BodyBuildState, block: CwDocxImage, parts: string[]) {
  if (state.zip && block.sourceRelId && block.sourceMediaTarget && zipHasMedia(state.zip, block.sourceMediaTarget)) {
    ensureImageRelationship(state, block.sourceRelId, block.sourceMediaTarget)
    parts.push(imageXml(block.sourceRelId, state.shapeId))
    state.shapeId += 1
    return
  }

  const file = dataUrlBytes(block.dataUrl)
  if (!file) return

  const mediaName = `cwdocx_export_${state.mediaIndex}.${file.ext}`
  state.mediaIndex += 1
  if (state.zip) state.zip.file(`word/media/${mediaName}`, file.bytes)

  const relId = state.allocRelId()
  state.relationships.push({
    id: relId,
    type: IMAGE_REL_TYPE,
    target: `media/${mediaName}`,
  })
  parts.push(imageXml(relId, state.shapeId))
  state.shapeId += 1
}

function buildDocumentBody(blocks: CwDocxBlock[], state: BodyBuildState) {
  const parts: string[] = []
  for (const block of blocks) {
    if (block.kind === 'paragraph') parts.push(paragraphXml(block))
    else if (block.kind === 'table') parts.push(tableXml(block))
    else if (block.kind === 'image') appendImageBlock(state, block, parts)
  }
  return parts.join('')
}

function runPropertiesXml(run: CwDocxRun) {
  const parts: string[] = []
  if (run.bold) parts.push('<w:b/>')
  if (run.italic) parts.push('<w:i/>')
  if (run.fontSize) parts.push(`<w:sz w:val="${run.fontSize}"/>`)
  return parts.length ? `<w:rPr>${parts.join('')}</w:rPr>` : ''
}

function runXml(run: CwDocxRun) {
  const rPr = runPropertiesXml(run)
  const lines = run.text.split('\n')
  return lines
    .map((line, index) => {
      const br = index > 0 ? '<w:br/>' : ''
      const content = line ? `<w:t xml:space="preserve">${escapeXml(line)}</w:t>` : ''
      return `<w:r>${rPr}${br}${content}</w:r>`
    })
    .join('')
}

function paragraphPropsXml(block: CwDocxInlineParagraph | CwDocxParagraph) {
  const parts: string[] = []
  const level = block.level > 0 ? Math.min(block.level, 9) : 0
  if (block.styleId) parts.push(`<w:pStyle w:val="${escapeXml(block.styleId)}"/>`)
  else if (level) parts.push(`<w:pStyle w:val="Heading${level}"/>`)
  if (block.align && block.align !== 'left') parts.push(`<w:jc w:val="${block.align}"/>`)
  if (block.indentLeft || block.indentFirstLine) {
    const left = block.indentLeft ? ` w:left="${block.indentLeft}"` : ''
    const first = block.indentFirstLine ? ` w:firstLine="${block.indentFirstLine}"` : ''
    parts.push(`<w:ind${left}${first}/>`)
  }
  if (block.spaceBefore || block.spaceAfter || block.line) {
    const before = block.spaceBefore ? ` w:before="${block.spaceBefore}"` : ''
    const after = block.spaceAfter ? ` w:after="${block.spaceAfter}"` : ''
    const line = block.line ? ` w:line="${block.line}"` : ''
    const lineRule = block.lineRule ? ` w:lineRule="${block.lineRule}"` : ''
    parts.push(`<w:spacing${before}${after}${line}${lineRule}/>`)
  }
  if (block.numId != null) {
    const ilvl = block.ilvl ?? 0
    parts.push(`<w:numPr><w:ilvl w:val="${ilvl}"/><w:numId w:val="${block.numId}"/></w:numPr>`)
  }
  return parts.length ? `<w:pPr>${parts.join('')}</w:pPr>` : ''
}

function paragraphXml(block: CwDocxInlineParagraph | CwDocxParagraph) {
  const runs = block.runs.length ? block.runs : [{ text: '' }]
  return `<w:p>${paragraphPropsXml(block)}${runs.map((run) => runXml(run)).join('')}</w:p>`
}

function tableCellXml(cell: CwDocxTableCell) {
  const tcPr: string[] = []
  if (cell.colSpan && cell.colSpan > 1) tcPr.push(`<w:gridSpan w:val="${cell.colSpan}"/>`)
  if (cell.vMergeContinue) tcPr.push('<w:vMerge w:val="continue"/>')
  const tcPrBlock = tcPr.length ? `<w:tcPr>${tcPr.join('')}</w:tcPr>` : '<w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr>'
  const paragraphs = cell.paragraphs.length ? cell.paragraphs : [{ id: 'x', level: 0, runs: [{ text: '' }] }]
  return `<w:tc>${tcPrBlock}${paragraphs.map((p) => paragraphXml(p)).join('')}</w:tc>`
}

function tableXml(block: CwDocxTable) {
  const border =
    '<w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="E3E3E3"/><w:left w:val="single" w:sz="4" w:space="0" w:color="E3E3E3"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="E3E3E3"/><w:right w:val="single" w:sz="4" w:space="0" w:color="E3E3E3"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="E3E3E3"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="E3E3E3"/></w:tblBorders>'
  const rows = block.rows
    .map((row) => {
      const cells = row.map((cell) => tableCellXml(cell)).join('')
      return `<w:tr>${cells}</w:tr>`
    })
    .join('')
  return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>${border}</w:tblPr>${rows}</w:tbl>`
}

function imageXml(relId: string, id: number) {
  const cx = 5486400
  const cy = 3200400
  return `<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${id}" name="Picture ${id}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="${PIC}"><pic:pic><pic:nvPicPr><pic:cNvPr id="${id}" name="image"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`
}

function stylesXml() {
  const heading = (level: number, size: number) =>
    `<w:style w:type="paragraph" w:styleId="Heading${level}"><w:name w:val="heading ${level}"/><w:basedOn w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="${size}"/></w:rPr></w:style>`
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="${W}">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:rPr><w:sz w:val="21"/></w:rPr></w:style>
  ${heading(1, 32)}${heading(2, 28)}${heading(3, 24)}${heading(4, 22)}
</w:styles>`
}

function buildDocumentXml(bodyInner: string, document: CwDocxDocument) {
  const sect = document.sectPrXml || DEFAULT_SECT_PR
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${DOCUMENT_OPEN}<w:body>${bodyInner}${sect}</w:body></w:document>`
}

async function exportWithOriginalPackage(document: CwDocxDocument): Promise<ArrayBuffer> {
  const { default: JSZip } = await import('jszip')
  const zip = await JSZip.loadAsync(document.originalPackage!)
  const relsXml = await zip.file('word/_rels/document.xml.rels')?.async('string')
  const relationships = relsXml ? parseDocumentRelationships(relsXml) : []
  const relationshipCountBefore = relationships.length
  const state: BodyBuildState = {
    zip,
    relationships,
    allocRelId: createRelationshipIdAllocator(relationships),
    mediaIndex: 1,
    shapeId: 1,
  }
  const bodyInner = buildDocumentBody(document.blocks, state)
  zip.file('word/document.xml', buildDocumentXml(bodyInner, document))
  if (state.relationships.length > relationshipCountBefore) {
    zip.file('word/_rels/document.xml.rels', serializeDocumentRelationships(state.relationships))
  }
  return zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' })
}

export async function documentToArrayBuffer(document: CwDocxDocument): Promise<ArrayBuffer> {
  if (document.originalPackage) return exportWithOriginalPackage(document)

  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const blocks = document.blocks.length ? document.blocks : [paragraph('')]
  const relationships: PackageRelationship[] = [
    {
      id: 'rId1',
      type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
      target: 'styles.xml',
    },
  ]
  const state: BodyBuildState = {
    zip,
    relationships,
    allocRelId: createRelationshipIdAllocator(relationships),
    mediaIndex: 1,
    shapeId: 1,
  }
  const bodyInner = buildDocumentBody(blocks, state)
  const body = `${bodyInner}${DEFAULT_SECT_PR}`
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`,
  )
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${RELS}"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`,
  )
  zip.file(
    'docProps/core.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>文档</dc:title></cp:coreProperties>',
  )
  zip.file(
    'docProps/app.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>CwDocxEditor</Application></Properties>',
  )
  zip.file('word/_rels/document.xml.rels', serializeDocumentRelationships(state.relationships))
  zip.file('word/styles.xml', stylesXml())
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${W}" xmlns:r="${R}" xmlns:wp="${WP}" xmlns:a="${A}" xmlns:pic="${PIC}"><w:body>${body}</w:body></w:document>`,
  )
  return zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' })
}
