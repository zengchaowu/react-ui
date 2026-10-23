import type { Color, PDFDocument, PDFFont, PDFPage } from 'pdf-lib'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'
import type { CwPdfDocument, CwPdfNote, CwPdfPage, CwPdfRotation, CwPdfSource, CwPdfTextRun } from '../types'

const A4_WIDTH = 595.28
const A4_HEIGHT = 841.89

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function createBlankPdfDocument(): CwPdfDocument {
  return { pages: [blankPage()] }
}

export function blankPage(): CwPdfPage {
  return { sourceIndex: -1, rotation: 0, notes: [], runs: [] }
}

export function identityPdfDocument(pageCount: number): CwPdfDocument {
  return {
    pages: Array.from({ length: Math.max(pageCount, 1) }, (_, sourceIndex) => ({
      sourceIndex: pageCount > 0 ? sourceIndex : -1,
      rotation: 0 as CwPdfRotation,
      notes: [],
      runs: [],
    })),
  }
}

export function clonePdfDocument(document: CwPdfDocument): CwPdfDocument {
  return {
    pages: document.pages.map((page) => ({
      ...page,
      notes: page.notes.map((note) => ({ ...note })),
      runs: (page.runs ?? []).map((run) => ({ ...run, transform: [...run.transform] as CwPdfTextRun['transform'] })),
    })),
  }
}

export function samePdfDocument(left: CwPdfDocument, right: CwPdfDocument) {
  return JSON.stringify(left) === JSON.stringify(right)
}

export async function readPdfSource(src: CwPdfSource): Promise<Uint8Array> {
  if (typeof src === 'string') {
    const response = await fetch(src)
    if (!response.ok) throw new Error('fetch failed')
    return new Uint8Array(await response.arrayBuffer())
  }
  if (src instanceof Blob) return new Uint8Array(await src.arrayBuffer())
  return new Uint8Array(src)
}

async function loadPdfjs() {
  const pdfjs = await import('pdfjs-dist')
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default
  }
  return pdfjs
}

export async function openPdfDocument(bytes: Uint8Array) {
  const pdfjs = await loadPdfjs()
  const task = pdfjs.getDocument({ data: bytes.slice(), fontExtraProperties: true })
  return task.promise
}

export interface CwPdfViewport {
  width: number
  height: number
  transform: number[]
}

export interface CwPdfRunBox {
  x: number
  y: number
  w: number
  h: number
  fontPx: number
  angle: number
  /** 基线在当前视口里的比例 */
  baselineX: number
  baselineY: number
}

type PdfTextItem = {
  str?: string
  transform?: number[]
  width?: number
  height?: number
  hasEOL?: boolean
  dir?: string
  fontName?: string
}

type PdfTextStyle = {
  ascent?: number
  fontFamily?: string
  fontSubstitution?: string
  fontSubstitutionLoadedName?: string
}

type PdfTextPage = {
  getTextContent: () => Promise<{ items: PdfTextItem[]; styles?: Record<string, PdfTextStyle> }>
  getOperatorList?: () => Promise<unknown>
  commonObjs?: {
    has: (id: string) => boolean
    get: (id: string, callback?: (font: { name?: string }) => void) => { name?: string } | null
  }
}

function pdfFontName(page: PdfTextPage, fontName: string | undefined, cache: Map<string, Promise<string>>) {
  const fonts = page.commonObjs
  if (!fontName || !fonts) return Promise.resolve('')
  const cached = cache.get(fontName)
  if (cached) return cached
  const read = () => {
    if (!fonts.has(fontName)) return ''
    try {
      const name = fonts.get(fontName)?.name
      return typeof name === 'string' ? name : ''
    } catch {
      return ''
    }
  }
  if (fonts.has(fontName)) {
    const ready = Promise.resolve(read())
    cache.set(fontName, ready)
    return ready
  }
  const pending = new Promise<string>((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve(read())
    }
    try {
      fonts.get(fontName, finish)
    } catch {
      finish()
    }
    setTimeout(finish, 400)
  })
  cache.set(fontName, pending)
  return pending
}

function asTransform(value: number[] | undefined): [number, number, number, number, number, number] | null {
  if (!value || value.length < 6) return null
  const transform = value.slice(0, 6).map((item) => Number(item))
  if (transform.some((item) => !Number.isFinite(item))) return null
  return transform as [number, number, number, number, number, number]
}

function multiplyTransform(left: number[], right: number[]) {
  return [
    left[0] * right[0] + left[2] * right[1],
    left[1] * right[0] + left[3] * right[1],
    left[0] * right[2] + left[2] * right[3],
    left[1] * right[2] + left[3] * right[3],
    left[0] * right[4] + left[2] * right[5] + left[4],
    left[1] * right[4] + left[3] * right[5] + left[5],
  ]
}

interface GlyphRun {
  text: string
  transform: [number, number, number, number, number, number]
  x: number
  baseline: number
  end: number
  height: number
  dir: string
  eol: boolean
  ascent: number
  fontFamily: string
  fontFace: string
  pdfFont: string
}

/** pdf.js 按 ToUnicode 解出的串；缺表时会是控制符/符号，不是页面上看到的中文。 */
export function isBrokenPdfExtractedText(text: string): boolean {
  if (!text) return false
  if (/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(text)) return false
  if (/[A-Za-z]{4,}/.test(text)) return false
  for (const ch of text) {
    const cp = ch.codePointAt(0)!
    if (cp < 0x20 && ch !== '\t' && ch !== '\n' && ch !== '\r') return true
    if (cp >= 0x7f && cp <= 0x9f) return true
    if (cp >= 0xe000 && cp <= 0xf8ff) return true
  }
  const compact = text.replace(/\s/g, '')
  if (compact.length >= 3 && /^[\x21-\x7e*#()]+$/.test(compact) && !/[a-zA-Z]{2,}/.test(text)) return true
  return false
}

function embeddedCjkPdfFont(pdfFont?: string) {
  const base = (pdfFont || '').replace(/^[\w]{6}\+/, '').toLowerCase()
  return /simhei|simsun|songti|song|heiti|hei|mingliu|ming|fangsong|kaiti|stkaiti|stzhongsong|dengxian|fzshu|fzhei/.test(
    base,
  )
}

/** 嵌入宋黑体但 pdf.js 解不出汉字时，常剩拉丁扩展/符号串。 */
function isLikelyCjkFontMojibake(text: string, pdfFont?: string) {
  if (!embeddedCjkPdfFont(pdfFont)) return false
  const trimmed = text.trim()
  if (!trimmed) return false
  if (/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(trimmed)) return false
  if (/^[A-Za-z0-9][A-Za-z0-9\s.,\-()/+%#*:;'"]*$/.test(trimmed) && /[A-Za-z]{3,}/.test(trimmed)) return false
  return true
}

function normalizeExtractedRunText(text: string, pdfFont?: string) {
  if (isBrokenPdfExtractedText(text) || isLikelyCjkFontMojibake(text, pdfFont)) {
    return { text: '', source: '', decodeFailed: true as const }
  }
  return { text, source: text, decodeFailed: false as const }
}

/** 把同一行上挨着的字形收成一段，方便整段改。 */
export async function readPageRuns(page: PdfTextPage): Promise<CwPdfTextRun[]> {
  const content = await page.getTextContent()
  await page.getOperatorList?.().catch(() => undefined)
  const fontNames = new Map<string, Promise<string>>()
  const glyphs: GlyphRun[] = []
  for (const item of content.items) {
    if (!item.str) continue
    const transform = asTransform(item.transform)
    if (!transform) continue
    const height = Math.hypot(transform[2], transform[3]) || item.height || 0
    const width = item.width || 0
    if (height < 0.5 && width < 0.5) continue
    const style = content.styles?.[item.fontName || '']
    glyphs.push({
      text: item.str,
      transform,
      x: transform[4],
      baseline: transform[5],
      end: transform[4] + width,
      height: height || 12,
      dir: item.dir || 'ltr',
      eol: Boolean(item.hasEOL),
      ascent: style?.ascent && style.ascent > 0 ? style.ascent : 0.8,
      fontFamily: style?.fontSubstitution || style?.fontFamily || 'sans-serif',
      fontFace: item.fontName || style?.fontSubstitutionLoadedName || '',
      pdfFont: await pdfFontName(page, item.fontName, fontNames),
    })
  }

  glyphs.sort((left, right) => {
    const height = Math.min(left.height, right.height) || 1
    if (Math.abs(left.baseline - right.baseline) > height * 0.45) return right.baseline - left.baseline
    return left.x - right.x
  })

  const merged: GlyphRun[] = []
  for (const glyph of glyphs) {
    const previous = merged[merged.length - 1]
    const height = Math.max(previous?.height ?? 0, glyph.height)
    const sameLine = previous != null && Math.abs(glyph.baseline - previous.baseline) <= height * 0.35
    const gap = previous ? glyph.x - previous.end : Number.POSITIVE_INFINITY
    const close = gap >= -height * 0.25 && gap <= height * 0.8
    const canMerge =
      previous != null &&
      !previous.eol &&
      glyph.dir !== 'ttb' &&
      previous.dir !== 'ttb' &&
      sameLine &&
      close &&
      glyph.dir === previous.dir &&
      glyph.fontFamily === previous.fontFamily &&
      glyph.fontFace === previous.fontFace &&
      glyph.pdfFont === previous.pdfFont
    if (!previous || !canMerge) {
      merged.push({ ...glyph })
      continue
    }
    if (gap > height * 0.18 && !previous.text.endsWith(' ') && !glyph.text.startsWith(' ')) previous.text += ' '
    previous.text += glyph.text
    previous.end = Math.max(previous.end, glyph.end)
    previous.height = height
    previous.eol = glyph.eol
  }

  const compacted: GlyphRun[] = []
  for (let index = 0; index < merged.length; index += 1) {
    const glyph = merged[index]!
    const next = merged[index + 1]
    if (/^\s+$/.test(glyph.text) && next) {
      const height = Math.max(glyph.height, next.height)
      if (Math.abs(next.baseline - glyph.baseline) <= height * 0.35 && next.x - glyph.end <= height * 0.2) {
        next.text = glyph.text + next.text
        next.x = glyph.x
        next.transform = glyph.transform
        continue
      }
    }
    compacted.push(glyph)
  }

  return compacted
    .filter((run) => run.text.trim() || !/^\s+$/.test(run.text))
    .map((run) => {
      const advance = Math.max(run.end - run.x, 0)
      const whitespaceOnly = /^\s+$/.test(run.text)
      const width = whitespaceOnly ? Math.max(advance, 1) : Math.max(advance, run.height * 0.4)
      const normalized = normalizeExtractedRunText(run.text, run.pdfFont)
      return {
        id: createId('run'),
        source: normalized.source,
        text: normalized.text,
        decodeFailed: normalized.decodeFailed,
        transform: run.transform,
        width,
        height: run.height,
        ascent: run.ascent,
        fontFamily: run.fontFamily,
        fontFace: run.fontFace || undefined,
        pdfFont: run.pdfFont || undefined,
      }
    })
}

/** 把用户空间的文字块投到当前视口。x/y/w/h 是这一页的比例。 */
export function placeRun(run: CwPdfTextRun, viewport: CwPdfViewport): CwPdfRunBox {
  const tx = multiplyTransform(viewport.transform, run.transform)
  const fontHeight = Math.hypot(tx[2], tx[3]) || 1
  const angle = Math.atan2(tx[1], tx[0])
  const baseScale = Math.hypot(run.transform[0], run.transform[1]) || 1
  const viewScale = Math.hypot(tx[0], tx[1]) || 1
  const widthPx = Math.max(run.width * (viewScale / baseScale), fontHeight * 0.4)
  const left = Math.abs(angle) > 0.01 ? tx[4] + fontHeight * Math.sin(angle) : tx[4]
  const top = Math.abs(angle) > 0.01 ? tx[5] - fontHeight * Math.cos(angle) : tx[5] - fontHeight
  const boxHeight = fontHeight * 1.25
  return {
    x: left / viewport.width,
    y: top / viewport.height,
    w: widthPx / viewport.width,
    h: boxHeight / viewport.height,
    fontPx: fontHeight,
    angle,
    baselineX: tx[4] / viewport.width,
    baselineY: tx[5] / viewport.height,
  }
}

const CJK_FONT = '"Microsoft YaHei", "微软雅黑"'

/** 编辑只改文字。CSS 字体按 PDF 的字体族来，缺字再落到中文黑体。 */
export function cssFontForPdf(family?: string) {
  const raw = (family || 'sans-serif').replace(/["']/g, '')
  const lower = raw.toLowerCase()
  if (/mono|courier|consolas|menlo/.test(lower)) return `"Courier New", Courier, ${CJK_FONT}, monospace`
  if (/times|song|simsun|ming|georgia|roman/.test(lower) || (lower.includes('serif') && !lower.includes('sans'))) {
    return `"Times New Roman", Times, SimSun, ${CJK_FONT}, serif`
  }
  if (lower && lower !== 'sans-serif' && !/helvetica|arial|sans/.test(lower)) {
    return `"${raw}", Helvetica, Arial, ${CJK_FONT}, sans-serif`
  }
  return `Helvetica, Arial, ${CJK_FONT}, sans-serif`
}

function isPdfJsInjectedFontName(part: string) {
  const name = part.replace(/^["']|["']$/g, '').trim()
  if (/^g_d\d+_f\d+$/i.test(name)) return true
  if (/^g_d\d+_sf\d+$/i.test(name)) return true
  if (/_[sf]\d+$/i.test(name)) return true
  return false
}

function overlayFontHint(family?: string, pdfFont?: string) {
  const raw = (family || '').trim()
  if (raw.includes(',')) {
    for (const part of raw.split(',')) {
      const name = part.trim().replace(/^["']|["']$/g, '')
      if (!name || isPdfJsInjectedFontName(part)) continue
      if (name === 'sans-serif' || name === 'serif' || name === 'monospace') continue
      return name
    }
  } else if (raw) {
    return raw.replace(/["']/g, '')
  }
  const base = (pdfFont || '').replace(/^[\w]{6}\+/, '').trim()
  return base
}

/**
 * 编辑叠层 / 失焦 canvas 预览用系统字体栈（含雅黑回退）。
 * 系统字体在前、内嵌 @font-face 在最后：键盘输入走系统字，PDF 内嵌码位缺字时回退内嵌字体。
 */
export function cssFontStackForOverlay(family?: string, pdfFont?: string, fontFace?: string) {
  const base = cssFontForPdf(overlayFontHint(family, pdfFont) || 'sans-serif')
  const face = fontFace?.trim()
  if (!face || base.includes(face)) return base
  return `${base}, "${face}"`
}

export function readRunEditorText(element: HTMLElement) {
  return (element.innerText ?? element.textContent ?? '').replace(/\n/g, '')
}

/** @deprecated 叠层请用 cssFontStackForOverlay；保留签名避免旧引用。 */
export function cssFontStackForRun(family?: string, fontFace?: string) {
  return cssFontStackForOverlay(family, undefined, fontFace)
}

export function cssFontWeight(family?: string) {
  return /bold|black|heavy|semibold/.test((family || '').toLowerCase()) ? 700 : 400
}

export function cssFontStyle(family?: string) {
  return /italic|oblique/.test((family || '').toLowerCase()) ? 'italic' : 'normal'
}

function canvasFont(fontPx: number, family?: string, pdfFont?: string, fontFace?: string) {
  return `${cssFontStyle(family)} ${cssFontWeight(family)} ${fontPx}px ${cssFontStackForOverlay(family, pdfFont, fontFace)}`
}

export interface CwPdfFontMetrics {
  /** 字体包围盒在基线以上的高度，用来摆放行框 */
  ascent: number
  descent: number
  width: number
}

let fontMeasureCtx: CanvasRenderingContext2D | null | undefined

/** 行高等于 ascent + descent 时，基线就在距顶 ascent 的位置。字号仍是原文的 em。 */
export interface CwPdfRunLayout {
  left: number
  top: number
  width: number
  height: number
  rise: number
  fontCss: number
  angle: number
}

/** 编辑叠层与 canvas 预览共用的文字框，坐标在 scale=1 的视口里。 */
export function layoutPdfRun(run: CwPdfTextRun, viewport: CwPdfViewport, pageCssHeight: number): CwPdfRunLayout {
  const box = placeRun(run, viewport)
  const scale = pageCssHeight / viewport.height
  const fontCss = box.fontPx * scale
  const measureText = run.text || run.source || '\u3000'
  const metrics = measurePdfRunFont(measureText, fontCss, run.fontFamily, run.pdfFont, run.fontFace)
  const rise = metrics.ascent / scale
  let left = box.baselineX * viewport.width
  let top = box.baselineY * viewport.height
  if (Math.abs(box.angle) > 0.01) {
    left += rise * Math.sin(box.angle)
    top -= rise * Math.cos(box.angle)
  } else {
    top -= rise
  }
  const width = Math.max(box.w * viewport.width, metrics.width / scale)
  const height = (metrics.ascent + metrics.descent) / scale
  return { left, top, width, height, rise, fontCss, angle: box.angle }
}

/** 编辑态在已有页面上铺白底，不触发 pdf.js 整页重绘。 */
export function paintPdfRunEditBackdrop(
  ctx: CanvasRenderingContext2D,
  run: CwPdfTextRun,
  viewport: CwPdfViewport,
  pageCssHeight: number,
  pageCssWidth: number,
  canvasWidth: number,
) {
  const layout = layoutPdfRun(run, viewport, pageCssHeight)
  const positionScale = canvasWidth / viewport.width
  const pad = 3 * (canvasWidth / Math.max(pageCssWidth, 1))
  const { left, top, width, height, angle } = layout
  ctx.save()
  ctx.fillStyle = tokenSolidColors.white
  if (Math.abs(angle) > 0.01) {
    ctx.translate(left * positionScale, top * positionScale)
    ctx.rotate(angle)
    ctx.fillRect(-pad, -pad, width * positionScale + pad * 2, height * positionScale + pad * 2)
  } else {
    ctx.fillRect(
      left * positionScale - pad,
      top * positionScale - pad,
      width * positionScale + pad * 2,
      height * positionScale + pad * 2,
    )
  }
  ctx.restore()
}

/** 把已改文字画回 canvas，避免叠层长期铺白底。仅在非编辑态绘制对应 run。 */
export function paintEditedRunsOnCanvas(
  ctx: CanvasRenderingContext2D,
  runs: CwPdfTextRun[],
  viewport: CwPdfViewport,
  pageCssHeight: number,
  pageCssWidth: number,
  canvasWidth: number,
) {
  const positionScale = canvasWidth / viewport.width
  const fontScale = canvasWidth / Math.max(pageCssWidth, 1)
  for (const run of runs) {
    if (run.text === run.source) continue
    const layout = layoutPdfRun(run, viewport, pageCssHeight)
    const { left, top, width, height, rise, fontCss, angle } = layout
    const fontPx = fontCss * fontScale
    ctx.save()
    ctx.fillStyle = tokenSolidColors.white
    if (Math.abs(angle) > 0.01) {
      ctx.translate(left * positionScale, top * positionScale)
      ctx.rotate(angle)
      ctx.fillRect(0, 0, width * positionScale, height * positionScale)
      ctx.font = canvasFont(fontPx, run.fontFamily, run.pdfFont, run.fontFace)
      ctx.fillStyle = tokenSolidColors.docInk
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(run.text, 0, rise * positionScale)
    } else {
      ctx.fillRect(left * positionScale, top * positionScale, width * positionScale, height * positionScale)
      ctx.font = canvasFont(fontPx, run.fontFamily, run.pdfFont, run.fontFace)
      ctx.fillStyle = tokenSolidColors.docInk
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(run.text, left * positionScale, (top + rise) * positionScale)
    }
    ctx.restore()
  }
}

export function measurePdfRunFont(
  text: string,
  fontPx: number,
  family?: string,
  pdfFont?: string,
  fontFace?: string,
): CwPdfFontMetrics {
  const safe = Math.max(fontPx, 1)
  if (fontMeasureCtx === undefined && typeof document !== 'undefined') {
    fontMeasureCtx = document.createElement('canvas').getContext('2d')
  }
  if (!fontMeasureCtx) {
    return { ascent: safe * 0.8, descent: safe * 0.2, width: Math.max(text.length, 1) * safe * 0.5 }
  }
  fontMeasureCtx.font = canvasFont(safe, family, pdfFont, fontFace)
  const metrics = fontMeasureCtx.measureText(text || 'Hg')
  return {
    ascent: metrics.fontBoundingBoxAscent || safe * 0.8,
    descent: Math.abs(metrics.fontBoundingBoxDescent || safe * 0.2),
    width: metrics.width,
  }
}

function quarterTurn(rotation: number) {
  const turn = ((Math.round(rotation) % 360) + 360) % 360
  if (turn === 90 || turn === 180 || turn === 270) return turn
  return 0
}

function visualPageSize(width: number, height: number, rotation: number) {
  const turn = quarterTurn(rotation)
  return turn === 90 || turn === 270 ? { width: height, height: width } : { width, height }
}

/** 屏幕比例坐标（左上角为原点）转到 PDF 用户空间。 */
function visualToUser(fx: number, fy: number, width: number, height: number, rotation: number) {
  const turn = quarterTurn(rotation)
  if (turn === 90) return { x: fy * width, y: fx * height }
  if (turn === 180) return { x: (1 - fx) * width, y: fy * height }
  if (turn === 270) return { x: (1 - fy) * width, y: (1 - fx) * height }
  return { x: fx * width, y: (1 - fy) * height }
}

function visualAxes(rotation: number) {
  const turn = quarterTurn(rotation)
  if (turn === 90) return { right: { x: 0, y: 1 }, down: { x: 1, y: 0 } }
  if (turn === 180) return { right: { x: -1, y: 0 }, down: { x: 0, y: 1 } }
  if (turn === 270) return { right: { x: 0, y: -1 }, down: { x: -1, y: 0 } }
  return { right: { x: 1, y: 0 }, down: { x: 0, y: -1 } }
}

function pickStandardFont(fonts: typeof import('pdf-lib').StandardFonts, family?: string) {
  const lower = (family || '').toLowerCase()
  const bold = /bold|black|heavy|semibold/.test(lower)
  const italic = /italic|oblique/.test(lower)
  if (/mono|courier/.test(lower)) {
    if (bold && italic) return fonts.CourierBoldOblique
    if (bold) return fonts.CourierBold
    if (italic) return fonts.CourierOblique
    return fonts.Courier
  }
  if (/times|song|simsun|ming|georgia|roman/.test(lower) || (lower.includes('serif') && !lower.includes('sans'))) {
    if (bold && italic) return fonts.TimesRomanBoldItalic
    if (bold) return fonts.TimesRomanBold
    if (italic) return fonts.TimesRomanItalic
    return fonts.TimesRoman
  }
  if (bold && italic) return fonts.HelveticaBoldOblique
  if (bold) return fonts.HelveticaBold
  if (italic) return fonts.HelveticaOblique
  return fonts.Helvetica
}

function fontCanEncode(font: PDFFont, text: string) {
  try {
    font.encodeText(text)
    return true
  } catch {
    return false
  }
}

interface ExportKit {
  pdf: PDFDocument
  white: Color
  ink: Color
  fonts: Map<string, PDFFont>
  standardFonts: typeof import('pdf-lib').StandardFonts
  pushGraphicsState: typeof import('pdf-lib').pushGraphicsState
  popGraphicsState: typeof import('pdf-lib').popGraphicsState
  concatTransformationMatrix: typeof import('pdf-lib').concatTransformationMatrix
  beginText: typeof import('pdf-lib').beginText
  endText: typeof import('pdf-lib').endText
  setFontAndSize: typeof import('pdf-lib').setFontAndSize
  setFillingColor: typeof import('pdf-lib').setFillingColor
  showText: typeof import('pdf-lib').showText
  PDFHexString: typeof import('pdf-lib').PDFHexString
  PDFDict: typeof import('pdf-lib').PDFDict
  PDFName: typeof import('pdf-lib').PDFName
  PDFRawStream: typeof import('pdf-lib').PDFRawStream
  decodePDFRawStream: typeof import('pdf-lib').decodePDFRawStream
}

interface EmbeddedFontUse {
  resourceName: string
  baseFont: string
  bytesPerChar: number
  unicodeToCode: Map<string, number>
}

function fontBaseName(value: string) {
  return value.replace(/^[A-Z]{6}\+/, '')
}

function cmapSource(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => String.fromCharCode(byte))
    .join('')
    .split('\n')
    .map((line) => {
      const comment = line.indexOf('%')
      return comment >= 0 ? line.slice(0, comment) : line
    })
    .join('\n')
}

function unicodeFromHex(hex: string) {
  const chars: string[] = []
  const width = hex.length <= 2 ? 2 : 4
  for (let index = 0; index + width <= hex.length; index += width) {
    chars.push(String.fromCharCode(Number.parseInt(hex.slice(index, index + width), 16)))
  }
  return chars.join('')
}

function rememberCode(map: Map<string, number>, unicode: string, code: number) {
  if (unicode && !map.has(unicode)) map.set(unicode, code)
}

/** 从字体自带的 ToUnicode 反查：这个字原来用哪个编码。 */
function parseToUnicode(bytes: Uint8Array) {
  const text = cmapSource(bytes)
  const map = new Map<string, number>()
  let bytesPerChar = 1
  const takeWidth = (hex: string) => {
    bytesPerChar = Math.max(bytesPerChar, hex.length / 2)
  }
  for (const block of text.split('beginbfchar').slice(1)) {
    const body = block.split('endbfchar')[0] || ''
    for (const match of body.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      const src = match[1] || ''
      const dst = match[2] || ''
      takeWidth(src)
      rememberCode(map, unicodeFromHex(dst), Number.parseInt(src, 16))
    }
  }
  for (const block of text.split('beginbfrange').slice(1)) {
    const body = block.split('endbfrange')[0] || ''
    for (const match of body.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[([^\]]+)\]/g)) {
      const startHex = match[1] || ''
      const start = Number.parseInt(startHex, 16)
      takeWidth(startHex)
      const values = [...(match[3] || '').matchAll(/<([0-9A-Fa-f]+)>/g)]
      values.forEach((item, index) => rememberCode(map, unicodeFromHex(item[1] || ''), start + index))
    }
    for (const match of body.matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      const startHex = match[1] || ''
      const start = Number.parseInt(startHex, 16)
      const end = Number.parseInt(match[2] || '', 16)
      let unicode = Number.parseInt(match[3] || '', 16)
      takeWidth(startHex)
      for (let code = start; code <= end; code += 1) {
        rememberCode(map, String.fromCodePoint(unicode), code)
        unicode += 1
      }
    }
  }
  return { map, bytesPerChar: bytesPerChar >= 2 ? 2 : 1 }
}

const pageFontCache = new WeakMap<PDFPage, EmbeddedFontUse[]>()

function embeddedFonts(page: PDFPage, kit: ExportKit) {
  const cached = pageFontCache.get(page)
  if (cached) return cached
  const found: EmbeddedFontUse[] = []
  const resources = page.node.Resources()
  const fonts = resources?.lookup(kit.PDFName.of('Font'))
  if (fonts instanceof kit.PDFDict) {
    for (const [key, value] of fonts.entries()) {
      const font = page.doc.context.lookup(value)
      if (!(font instanceof kit.PDFDict)) continue
      const base = font.lookup(kit.PDFName.of('BaseFont'))
      const unicode = font.lookup(kit.PDFName.of('ToUnicode'))
      if (!(base instanceof kit.PDFName) || !(unicode instanceof kit.PDFRawStream)) continue
      const decoded = parseToUnicode(kit.decodePDFRawStream(unicode).decode())
      if (!decoded.map.size) continue
      found.push({
        resourceName: key.decodeText(),
        baseFont: base.decodeText(),
        bytesPerChar: decoded.bytesPerChar,
        unicodeToCode: decoded.map,
      })
    }
  }
  pageFontCache.set(page, found)
  return found
}

function matchEmbeddedFont(fonts: EmbeddedFontUse[], pdfFont?: string) {
  if (!pdfFont) return fonts.length === 1 ? fonts[0] : undefined
  const exact = fonts.find((font) => font.baseFont === pdfFont)
  if (exact) return exact
  const plain = fontBaseName(pdfFont)
  const loose = fonts.filter((font) => fontBaseName(font.baseFont) === plain)
  return loose.length === 1 ? loose[0] : undefined
}

function fontCovers(font: EmbeddedFontUse, text: string) {
  for (const char of text) {
    if (!font.unicodeToCode.has(char)) return false
  }
  return true
}

function encodeWithEmbeddedFont(page: PDFPage, kit: ExportKit, pdfFont: string | undefined, text: string, source: string) {
  const fonts = embeddedFonts(page, kit)
  let font = matchEmbeddedFont(fonts, pdfFont)
  if (!font && !pdfFont) {
    const owners = fonts.filter((item) => fontCovers(item, source))
    font = owners.length === 1 ? owners[0] : undefined
  }
  if (!font || !text || !fontCovers(font, text)) return null
  const codes: number[] = []
  for (const char of text) {
    const code = font.unicodeToCode.get(char)
    if (code == null) return null
    codes.push(code)
  }
  const bytes = new Uint8Array(codes.length * font.bytesPerChar)
  codes.forEach((code, index) => {
    for (let byte = 0; byte < font.bytesPerChar; byte += 1) {
      const shift = (font.bytesPerChar - 1 - byte) * 8
      bytes[index * font.bytesPerChar + byte] = (code >> shift) & 0xff
    }
  })
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return { resourceName: font.resourceName, hex }
}

async function fontFor(kit: ExportKit, family?: string) {
  const name = pickStandardFont(kit.standardFonts, family)
  let font = kit.fonts.get(name)
  if (!font) {
    font = await kit.pdf.embedFont(name)
    kit.fonts.set(name, font)
  }
  return font
}

async function withAxes(
  page: PDFPage,
  kit: ExportKit,
  originX: number,
  originY: number,
  axisX: { x: number; y: number },
  axisY: { x: number; y: number },
  draw: () => Promise<void>,
) {
  page.pushOperators(kit.pushGraphicsState(), kit.concatTransformationMatrix(axisX.x, axisX.y, axisY.x, axisY.y, originX, originY))
  try {
    await draw()
  } finally {
    page.pushOperators(kit.popGraphicsState())
  }
}

/** 标准字体写不了的字（例如中文）才画成小图，避免整页栅格化。 */
async function replacementImage(text: string, fontSize: number, family?: string) {
  const probe = measurePdfRunFont(text, 100, family)
  const ascentRatio = probe.ascent / 100
  const descentRatio = probe.descent / 100
  const fontPx = 96
  const scale = 2
  const measured = Math.max((probe.width / 100) * fontPx, fontPx * 0.25)
  const widthPt = (measured / fontPx) * fontSize
  const heightPt = fontSize * (ascentRatio + descentRatio)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.ceil(measured * scale))
  canvas.height = Math.max(1, Math.ceil((ascentRatio + descentRatio) * fontPx * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  ctx.fillStyle = tokenSolidColors.white
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = tokenSolidColors.docInk
  ctx.font = canvasFont(fontPx * scale, family)
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(text, 0, ascentRatio * fontPx * scale)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('png'))), 'image/png')
  })
  return {
    bytes: new Uint8Array(await blob.arrayBuffer()),
    widthPt,
    heightPt,
    ascentPt: fontSize * ascentRatio,
    descentPt: fontSize * descentRatio,
  }
}

async function stampEditedRuns(page: PDFPage, kit: ExportKit, runs: CwPdfTextRun[]) {
  for (const run of runs) {
    if (run.text === run.source) continue
    const fontSize = Math.hypot(run.transform[2], run.transform[3]) || run.height || 12
    const dirLen = Math.hypot(run.transform[0], run.transform[1]) || fontSize
    const axisX = { x: run.transform[0] / dirLen, y: run.transform[1] / dirLen }
    const axisY = { x: -axisX.y, y: axisX.x }
    const rise = fontSize * (run.ascent || 0.8)
    const drop = fontSize * 0.25
    const pad = Math.max(0.4, fontSize * 0.06)
    const embedded = run.text ? encodeWithEmbeddedFont(page, kit, run.pdfFont, run.text, run.source) : null
    const font = !embedded && run.text ? await fontFor(kit, run.fontFamily) : null
    const useVector = Boolean(font && run.text && fontCanEncode(font, run.text))
    const textWidth = useVector && font ? font.widthOfTextAtSize(run.text, fontSize) : run.width
    const widthPt = Math.max(run.width, textWidth, run.width * (run.text.length / Math.max(run.source.length, 1)))
    await withAxes(page, kit, run.transform[4], run.transform[5], axisX, axisY, async () => {
      if (embedded) {
        page.drawRectangle({
          x: -pad,
          y: -drop - pad,
          width: widthPt + pad * 2,
          height: rise + drop + pad * 2,
          color: kit.white,
          borderWidth: 0,
        })
        page.pushOperators(
          kit.beginText(),
          kit.setFillingColor(kit.ink),
          kit.setFontAndSize(embedded.resourceName, fontSize),
          kit.showText(kit.PDFHexString.of(embedded.hex)),
          kit.endText(),
        )
        return
      }
      if (!useVector && run.text) {
        const image = await replacementImage(run.text, fontSize, run.fontFamily)
        const cover = Math.max(widthPt, image.widthPt)
        page.drawRectangle({
          x: -pad,
          y: -image.descentPt - pad,
          width: cover + pad * 2,
          height: image.heightPt + pad * 2,
          color: kit.white,
          borderWidth: 0,
        })
        const imageRef = await kit.pdf.embedPng(image.bytes)
        page.drawImage(imageRef, { x: 0, y: -image.descentPt, width: image.widthPt, height: image.heightPt })
        return
      }
      page.drawRectangle({
        x: -pad,
        y: -drop - pad,
        width: widthPt + pad * 2,
        height: rise + drop + pad * 2,
        color: kit.white,
        borderWidth: 0,
      })
      if (useVector && font && run.text) {
        page.drawText(run.text, { x: 0, y: 0, size: fontSize, font, color: kit.ink })
      }
    })
  }
}

function wrapByWidth(text: string, maxWidth: number, widthOf: (value: string) => number) {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    let line = ''
    for (const char of paragraph) {
      const next = line + char
      if (line && widthOf(next) > maxWidth) {
        lines.push(line)
        line = char
      } else {
        line = next
      }
    }
    lines.push(line)
  }
  return lines
}

async function noteImage(text: string, fontSize: number, maxWidthPt: number) {
  const fontPx = 32
  const scale = 2
  const pxPerPt = fontPx / Math.max(fontSize, 1)
  const maxWidthPx = Math.max(maxWidthPt * pxPerPt, fontPx)
  const probe = document.createElement('canvas').getContext('2d')
  if (!probe) throw new Error('canvas')
  probe.font = canvasFont(fontPx)
  const lines = wrapByWidth(text, maxWidthPx, (value) => probe.measureText(value).width)
  const lineHeight = fontPx * 1.25
  const widthPx = Math.max(...lines.map((line) => probe.measureText(line).width), fontPx * 0.25)
  const heightPx = Math.max(lines.length, 1) * lineHeight
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.ceil(widthPx * scale))
  canvas.height = Math.max(1, Math.ceil(heightPx * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  ctx.scale(scale, scale)
  ctx.font = canvasFont(fontPx)
  ctx.fillStyle = tokenSolidColors.docInk
  ctx.textBaseline = 'top'
  lines.forEach((line, index) => ctx.fillText(line, 0, index * lineHeight))
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('png'))), 'image/png')
  })
  return {
    bytes: new Uint8Array(await blob.arrayBuffer()),
    widthPt: widthPx / pxPerPt,
    heightPt: heightPx / pxPerPt,
  }
}

async function stampNotes(page: PDFPage, kit: ExportKit, notes: CwPdfNote[], rotation: number) {
  const { width, height } = page.getSize()
  const visual = visualPageSize(width, height, rotation)
  const axes = visualAxes(rotation)
  const up = { x: -axes.down.x, y: -axes.down.y }
  for (const note of notes) {
    if (!note.text) continue
    const fontSize = Math.max(1, note.fontSize * (visual.height / A4_HEIGHT))
    const pad = 4 * (visual.height / A4_HEIGHT)
    const maxWidth = Math.max(note.w * visual.width - pad * 2, fontSize)
    const font = await fontFor(kit)
    const origin = visualToUser(note.x, note.y, width, height, rotation)
    await withAxes(page, kit, origin.x, origin.y, axes.right, up, async () => {
      if (!fontCanEncode(font, note.text)) {
        const image = await noteImage(note.text, fontSize, maxWidth)
        const embedded = await kit.pdf.embedPng(image.bytes)
        page.drawImage(embedded, { x: pad, y: -(pad + image.heightPt), width: image.widthPt, height: image.heightPt })
        return
      }
      const lines = wrapByWidth(note.text, maxWidth, (value) => font.widthOfTextAtSize(value, fontSize))
      const lineHeight = fontSize * 1.25
      lines.forEach((line, index) => {
        page.drawText(line, {
          x: pad,
          y: -(pad + fontSize * 0.8 + index * lineHeight),
          size: fontSize,
          font,
          color: kit.ink,
        })
      })
    })
  }
}

function pageHasEdits(page: CwPdfPage) {
  return (page.runs ?? []).some((run) => run.text !== run.source)
}

/** 按页面顺序导出。原文页原样复制；改过的字优先写回原来的字体。原字体里没有的字才换标准字体，标准字体也写不了才贴一小张图。 */
export async function pdfDocumentToArrayBuffer(source: Uint8Array, document: CwPdfDocument): Promise<ArrayBuffer> {
  const {
    PDFDocument,
    PDFHexString,
    PDFDict,
    PDFName,
    PDFRawStream,
    decodePDFRawStream,
    degrees,
    rgb,
    StandardFonts,
    pushGraphicsState,
    popGraphicsState,
    concatTransformationMatrix,
    beginText,
    endText,
    setFontAndSize,
    setFillingColor,
    showText,
  } = await import('pdf-lib')
  const out = await PDFDocument.create()
  const editable = source.byteLength ? await PDFDocument.load(source) : null
  const kit: ExportKit = {
    pdf: out,
    white: rgb(1, 1, 1), // design-token-check: ignore — pdf-lib 色彩对象，非 CSS 色值
    ink: rgb(34 / 255, 34 / 255, 34 / 255), // design-token-check: ignore — pdf-lib 色彩对象，非 CSS 色值
    fonts: new Map(),
    standardFonts: StandardFonts,
    pushGraphicsState,
    popGraphicsState,
    concatTransformationMatrix,
    beginText,
    endText,
    setFontAndSize,
    setFillingColor,
    showText,
    PDFHexString,
    PDFDict,
    PDFName,
    PDFRawStream,
    decodePDFRawStream,
  }

  for (const page of document.pages) {
    let copied: PDFPage
    if (page.sourceIndex >= 0 && editable) {
      const [pageCopy] = await out.copyPages(editable, [page.sourceIndex])
      if (!pageCopy) continue
      copied = pageCopy
      out.addPage(copied)
    } else {
      copied = out.addPage([A4_WIDTH, A4_HEIGHT])
    }
    const angle = ((copied.getRotation().angle || 0) + page.rotation) % 360
    if (angle) copied.setRotation(degrees(angle))
    if (pageHasEdits(page)) await stampEditedRuns(copied, kit, page.runs ?? [])
    if (page.notes.some((note) => note.text)) await stampNotes(copied, kit, page.notes, copied.getRotation().angle || 0)
  }

  if (!out.getPageCount()) out.addPage([A4_WIDTH, A4_HEIGHT])
  const bytes = await out.save({ updateFieldAppearances: false })
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}
