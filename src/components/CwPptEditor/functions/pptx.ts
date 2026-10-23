import type {
  CwPptAlign,
  CwPptBorderSide,
  CwPptBox,
  CwPptCellBorders,
  CwPptDeck,
  CwPptEmbeddedFont,
  CwPptImage,
  CwPptLine,
  CwPptSlide,
  CwPptSource,
  CwPptTextFit,
  CwPptTextPadding,
  CwPptTextParagraph,
  CwPptTextRun,
} from '../types'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'
import {
  buildArchivePayload,
  type PptxArchivePayload,
} from './archiveEntries'
import {
  axisAlignedLinePolyline100,
  connectorPolyline100,
  custGeomPolyline100,
  isAxisAlignedStrokeBox,
  isConnectorPreset,
  linePresetInBox,
  linePresetPolyline100,
} from './connectorGeometry'
import { hexagonPoints100, roundRectRadiusPercent, rtTrianglePoints100 } from './presetGeometry'

const P = 'http://schemas.openxmlformats.org/presentationml/2006/main'
const A = 'http://schemas.openxmlformats.org/drawingml/2006/main'
const PIC = 'http://schemas.openxmlformats.org/drawingml/2006/picture'
const TABLE_URI = 'http://schemas.openxmlformats.org/drawingml/2006/table'
const PPT_FONT_FALLBACK = '"Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif'
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
const RELS = 'http://schemas.openxmlformats.org/package/2006/relationships'
const EMU_CX = 12192000
const EMU_CY = 6858000
/** OOXML：1pt = 12700 EMU */
export const EMU_PER_PT = 12700

export function slideSizePt(slideCx: number, slideCy: number) {
  return {
    width: Math.round(slideCx / EMU_PER_PT) || 960,
    height: Math.round(slideCy / EMU_PER_PT) || 540,
  }
}

interface Space {
  x: number
  y: number
  sx: number
  sy: number
}

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function createBlankDeck(): CwPptDeck {
  return {
    width: 960,
    height: 540,
    slideCx: EMU_CX,
    slideCy: EMU_CY,
    slides: [blankSlide(1)],
  }
}

function textBox(text: string, fontSize: number, y: number, h: number, z: number): CwPptBox {
  return {
    id: createId('box'),
    x: 0.08,
    y,
    w: 0.84,
    h,
    text,
    fontSize,
    color: tokenSolidColors.docInk,
    fill: '',
    align: 'left',
    z,
  }
}

export function blankSlide(index: number): CwPptSlide {
  return {
    name: `幻灯片 ${index}`,
    background: tokenSolidColors.white,
    boxes: [textBox('标题', 32, 0.16, 0.16, 0), textBox('正文', 18, 0.4, 0.4, 1)],
    images: [],
    lines: [],
  }
}

export function cloneDeck(deck: CwPptDeck): CwPptDeck {
  return {
    width: deck.width,
    height: deck.height,
    slideCx: deck.slideCx || EMU_CX,
    slideCy: deck.slideCy || EMU_CY,
    slides: deck.slides.map((slide) => ({
      name: slide.name,
      background: slide.background || tokenSolidColors.white,
      boxes: slide.boxes.map((box, index) => ({
        ...box,
        color: box.color || tokenSolidColors.docInk,
        fill: box.fill || '',
        align: box.align || 'left',
        z: box.z ?? index,
      })),
      images: slide.images.map((image, index) => ({ ...image, z: image.z ?? index })),
      lines: (slide.lines ?? []).map((line, index) => ({
        ...line,
        color: line.color || tokenSolidColors.docInk,
        widthPt: line.widthPt || 1,
        z: line.z ?? index,
      })),
    })),
    fonts: deck.fonts?.map((font) => ({ ...font })),
  }
}

export function sameDeck(left: CwPptDeck, right: CwPptDeck) {
  // fonts 存的是内嵌字体原始字节（可达十几 MB），不参与比较，避免无谓的序列化开销
  const { fonts: _leftFonts, ...leftRest } = left
  const { fonts: _rightFonts, ...rightRest } = right
  return JSON.stringify(leftRest) === JSON.stringify(rightRest)
}

export async function readPptSource(src: CwPptSource): Promise<ArrayBuffer> {
  if (typeof src === 'string') {
    const response = await fetch(src)
    if (!response.ok) throw new Error('fetch failed')
    return response.arrayBuffer()
  }
  if (src instanceof Blob) return src.arrayBuffer()
  return src
}

/**
 * pptx 解压 Worker：创建一次复用。pako 解压和图片 base64 都是同步重活，放主线程会卡住渲染，
 * 统一交给 Worker；Node 脚本 / 无 Worker 宿主退回主线程原地解压（行为一致）。
 */
let unzipWorker: Worker | null = null
let unzipWorkerBroken = false
let unzipTaskSeq = 0
const unzipTasks = new Map<number, { resolve: (payload: PptxArchivePayload) => void; reject: (error: Error) => void }>()

function failUnzipTasks(error: Error) {
  for (const task of unzipTasks.values()) task.reject(error)
  unzipTasks.clear()
}

async function getUnzipWorker() {
  if (unzipWorkerBroken || typeof Worker === 'undefined') return null
  if (unzipWorker) return unzipWorker
  try {
    const { default: PptxUnzipWorker } = await import('./pptx.worker?worker&inline')
    const worker = new PptxUnzipWorker()
    worker.onmessage = (event: MessageEvent<{ id: number; payload?: PptxArchivePayload; message?: string }>) => {
      const task = unzipTasks.get(event.data.id)
      if (!task) return
      unzipTasks.delete(event.data.id)
      if (event.data.payload) task.resolve(event.data.payload)
      else task.reject(new Error(event.data.message || '解压失败'))
    }
    // Worker 脚本加载失败：中断在途任务并整体降级，避免每次解析都白等一次超时
    worker.onerror = () => {
      failUnzipTasks(new Error('解压 Worker 加载失败'))
      worker.terminate()
      unzipWorker = null
      unzipWorkerBroken = true
    }
    unzipWorker = worker
    return worker
  } catch (error) {
    console.warn('[CwPptEditor] 无法创建解压 Worker，将退回主线程解压', error)
    unzipWorkerBroken = true
    return null
  }
}

/** 主线程兜底：与 Worker 内完全同一份解压实现，只是跑在主线程 */
async function unzipOnMainThread(buffer: ArrayBuffer) {
  const { default: JSZip } = await import('jszip')
  return buildArchivePayload(await JSZip.loadAsync(buffer))
}

/** 解压 pptx：Worker 优先，失败时退回主线程，保证功能不因宿主差异缺失 */
export async function loadPptxArchive(buffer: ArrayBuffer): Promise<PptxArchivePayload> {
  const worker = await getUnzipWorker()
  if (!worker) return unzipOnMainThread(buffer)
  return new Promise<PptxArchivePayload>((resolve, reject) => {
    const id = ++unzipTaskSeq
    unzipTasks.set(id, { resolve, reject })
    worker.postMessage({ id, buffer })
  }).catch(async (error) => {
    console.warn('[CwPptEditor] Worker 解压失败，退回主线程解压', error)
    return unzipOnMainThread(buffer)
  })
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function parseXml(xml: string) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.querySelector('parsererror')) throw new Error('xml')
  return doc
}

function readPair(xfrm: Element, name: string) {
  const el = [...xfrm.children].find((child) => child.localName === name)
  if (!el) return { x: 0, y: 0 }
  return {
    x: Number(el.getAttribute('x') || el.getAttribute('cx') || 0),
    y: Number(el.getAttribute('y') || el.getAttribute('cy') || 0),
  }
}

function enterGroup(parent: Space, xfrm: Element): Space {
  const off = readPair(xfrm, 'off')
  const ext = readPair(xfrm, 'ext')
  const chOff = readPair(xfrm, 'chOff')
  const chExt = readPair(xfrm, 'chExt')
  return {
    x: parent.x + (off.x - chOff.x) * parent.sx,
    y: parent.y + (off.y - chOff.y) * parent.sy,
    sx: chExt.x ? (ext.x / chExt.x) * parent.sx : parent.sx,
    sy: chExt.y ? (ext.y / chExt.y) * parent.sy : parent.sy,
  }
}

const LINE_MIN_NORM = 0.0008

function frameRaw(xfrm: Element, space: Space, slideCx: number, slideCy: number) {
  const off = readPair(xfrm, 'off')
  const ext = readPair(xfrm, 'ext')
  return {
    x: (space.x + off.x * space.sx) / slideCx,
    y: (space.y + off.y * space.sy) / slideCy,
    w: (ext.x * space.sx) / slideCx,
    h: (ext.y * space.sy) / slideCy,
  }
}

function frameOf(xfrm: Element, space: Space, slideCx: number, slideCy: number) {
  const raw = frameRaw(xfrm, space, slideCx, slideCy)
  return {
    x: raw.x,
    y: raw.y,
    w: raw.w || 0.2,
    h: raw.h || 0.1,
  }
}

function frameOfLine(xfrm: Element, space: Space, slideCx: number, slideCy: number) {
  const raw = frameRaw(xfrm, space, slideCx, slideCy)
  return {
    x: raw.x,
    y: raw.y,
    w: raw.w > 0 ? raw.w : LINE_MIN_NORM,
    h: raw.h > 0 ? raw.h : LINE_MIN_NORM,
  }
}

/** 文字/色块：零宽或零高时保持细条，避免被当成 20% 宽色块 */
function frameOfBox(xfrm: Element, space: Space, slideCx: number, slideCy: number) {
  return frameOfLine(xfrm, space, slideCx, slideCy)
}

function childEl(el: Element | null | undefined, name: string) {
  if (!el) return null
  return [...el.children].find((child) => child.localName === name || child.localName === `a:${name}`) ?? null
}

function spPrHasNoFill(spPr: Element) {
  return [...spPr.children].some((child) => child.localName === 'noFill' || child.localName === 'a:noFill')
}

function symChar(sym: Element) {
  const raw = (sym.getAttribute('char') || '').trim()
  if (!raw) return ''
  const code = parseInt(raw, 16)
  if (!Number.isNaN(code) && code > 0) {
    try {
      return String.fromCodePoint(code)
    } catch {
      return ''
    }
  }
  return raw
}

function runPlainText(run: Element) {
  const parts: string[] = []
  for (const child of [...run.children]) {
    if (child.localName === 't') parts.push(child.textContent || '')
    else if (child.localName === 'sym') parts.push(symChar(child))
  }
  return parts.join('')
}

function fldPlainText(fld: Element) {
  const parts: string[] = []
  for (const child of [...fld.children]) {
    if (child.localName === 'r') parts.push(runPlainText(child))
    else if (child.localName === 't') parts.push(child.textContent || '')
    else if (child.localName === 'sym') parts.push(symChar(child))
    else if (child.localName === 'fld') parts.push(fldPlainText(child))
  }
  return parts.join('')
}

function extractDeepText(container: Element) {
  const parts: string[] = []
  const walk = (el: Element) => {
    for (const child of [...el.children]) {
      if (child.localName === 't') parts.push(child.textContent || '')
      else if (child.localName === 'sym') parts.push(symChar(child))
      else walk(child)
    }
  }
  walk(container)
  return parts.join('')
}

function paragraphPlainText(paragraph: Element) {
  const parts: string[] = []
  for (const child of [...paragraph.children]) {
    if (child.localName === 'pPr') continue
    if (child.localName === 'br') {
      parts.push('\n')
      continue
    }
    if (child.localName === 'r') {
      parts.push(runPlainText(child))
      continue
    }
    if (child.localName === 'fld') {
      parts.push(fldPlainText(child))
      continue
    }
    if (child.localName === 't') {
      parts.push(child.textContent || '')
      continue
    }
    if (child.localName === 'sym') parts.push(symChar(child))
  }
  const joined = parts.join('')
  if (joined) return joined
  return extractDeepText(paragraph)
}

function shapeFontSize(txBody: Element) {
  for (const paragraph of [...txBody.children].filter((child) => child.localName === 'p')) {
    for (const child of [...paragraph.children]) {
      if (child.localName !== 'r') continue
      const rPr = childEl(child, 'rPr')
      const sz = rPr?.getAttribute('sz')
      if (sz) return Number(sz) / 100
    }
    const endPara = paragraph.getElementsByTagNameNS(A, 'endParaRPr')[0]
    const endSz = endPara?.getAttribute('sz')
    if (endSz) return Number(endSz) / 100
    const pPr = childEl(paragraph, 'pPr')
    const pDef = childEl(pPr, 'defRPr')
    const pSz = pDef?.getAttribute('sz')
    if (pSz) return Number(pSz) / 100
  }
  const defRPr = txBody.getElementsByTagNameNS(A, 'defRPr')[0]
  const defSz = defRPr?.getAttribute('sz')
  if (defSz) return Number(defSz) / 100
  return 18
}

function mapAlgn(algn: string | null | undefined): CwPptAlign | undefined {
  if (!algn) return undefined
  if (algn === 'ctr' || algn === 'center') return 'center'
  if (algn === 'r' || algn === 'right') return 'right'
  if (algn === 'l' || algn === 'left') return 'left'
  if (algn === 'just') return 'left'
  return undefined
}

function lstStyleAlignForParagraph(paragraph: Element, txBody: Element) {
  const lst = childEl(txBody, 'lstStyle')
  if (!lst) return undefined
  const lvlAttr = childEl(paragraph, 'pPr')?.getAttribute('lvl')
  const lvlNum = Math.max(1, Number(lvlAttr || 1))
  const lvlPr =
    [...lst.children].find((node) => node.localName === `lvl${lvlNum}pPr`) ||
    childEl(lst, 'lvl1pPr')
  return mapAlgn(lvlPr?.getAttribute('algn'))
}

function paragraphAlign(
  paragraph: Element,
  txBody?: Element | null,
  styleFallback?: CwPptAlign,
): CwPptAlign {
  const fromPPr = mapAlgn(childEl(paragraph, 'pPr')?.getAttribute('algn'))
  if (fromPPr) return fromPPr
  if (txBody) {
    const fromLst = lstStyleAlignForParagraph(paragraph, txBody)
    if (fromLst) return fromLst
  }
  if (styleFallback) return styleFallback
  return 'left'
}

function paragraphLineHeight(paragraph: Element) {
  const lnSpc = childEl(childEl(paragraph, 'pPr'), 'lnSpc')
  const pct = lnSpc ? childEl(lnSpc, 'spcPct') : null
  if (pct) {
    const val = Number(pct.getAttribute('val') || 100000)
    if (val > 0) return val / 100000
  }
  return undefined
}

function isBoldRPr(rPr: Element | null | undefined) {
  if (!rPr) return false
  const attr = rPr.getAttribute('b')
  if (attr !== null) return attr === '1' || attr === 'true'
  const bold = childEl(rPr, 'b')
  if (bold) {
    const val = bold.getAttribute('val')
    return val !== '0' && val !== 'false'
  }
  return false
}

function readTypefaceName(rPr: Element | null, fonts: ThemeFonts) {
  if (!rPr) return ''
  const ea = childEl(rPr, 'ea')?.getAttribute('typeface') || ''
  const latin = childEl(rPr, 'latin')?.getAttribute('typeface') || ''
  const raw = ea || latin
  if (!raw) return ''
  if (raw.startsWith('+')) return resolveThemeTypeface(raw, fonts) || ''
  return raw
}

/** PPT 内常见字体名 → 浏览器可回退的 font-family 栈（内嵌 .fntdata 经 EOT 解压后由栈首精确名命中）
 *  注意：别名里不要重复出现 key 本身，cssFontFamily 会自行把精确名前置 */
const FONT_ALIASES: Record<string, string> = {
  'Muyao-Softbrush': '"STKaiti", "KaiTi", "FangSong", serif',
  'Source Han Sans CN Regular': '"Source Han Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
  'Source Han Sans CN': '"Source Han Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
  'Source Han Sans SC': '"Noto Sans SC", "Microsoft YaHei", sans-serif',
  '思源黑体': '"Source Han Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
  '微软雅黑': '"Microsoft YaHei", "PingFang SC", sans-serif',
  'Microsoft YaHei': '"PingFang SC", sans-serif',
  'PingFang SC': '"Microsoft YaHei", sans-serif',
  'SimSun': '"Songti SC", serif',
  '宋体': '"SimSun", "Songti SC", serif',
}

function cssFontFamily(name: string) {
  const clean = name.replace(/["']/g, '').trim()
  if (!clean) return PPT_FONT_FALLBACK
  const alias = FONT_ALIASES[clean]
  // 精确名放栈首：系统已装该字体或已注册内嵌字体（FontFace）时优先命中
  if (alias) return `"${clean}", ${alias}`
  return `"${clean}", ${PPT_FONT_FALLBACK}`
}

function fontMetaFromRPr(
  rPr: Element | null,
  fonts: ThemeFonts,
  boldChain: Element[],
) {
  // 顺序为「最具体 → 最笼统」：run 自身 rPr 最优先，其后依次是占位符/段落/大纲/母版/形状继承的样式
  const nodes = [rPr, ...boldChain].filter(Boolean) as Element[]
  let bold = false
  for (const node of nodes) {
    if (isBoldRPr(node)) bold = true
  }
  // 字体名取第一个命中项：显式声明必须压过继承样式，不可让最笼统的一层覆盖
  let family = ''
  for (const node of nodes) {
    const name = readTypefaceName(node, fonts)
    if (name) {
      family = name
      if (/bold|粗体|加粗/i.test(name)) bold = true
      break
    }
  }
  return { fontFamily: family ? cssFontFamily(family) : PPT_FONT_FALLBACK, bold }
}

function lstLevelDefRPr(txBody: Element, paragraph: Element) {
  const lstStyle = childEl(txBody, 'lstStyle')
  if (!lstStyle) return null
  const lvl = Number(childEl(paragraph, 'pPr')?.getAttribute('lvl') || 0)
  const lvlPr = childEl(lstStyle, `lvl${lvl + 1}pPr`)
  return lvlPr ? childEl(lvlPr, 'defRPr') : null
}

function presentationLevelDefRPr(masterStyles: MasterTextStyles, paragraph: Element) {
  const lvl = Number(childEl(paragraph, 'pPr')?.getAttribute('lvl') || 0)
  return masterStyles.presentation[lvl] ?? masterStyles.presentation[0] ?? null
}

function textStyleChain(
  paragraph: Element,
  txBody: Element,
  sp: Element | null,
  masterStyles: MasterTextStyles,
) {
  return [
    placeholderDefRPr(sp, masterStyles),
    childEl(childEl(paragraph, 'pPr'), 'defRPr'),
    lstLevelDefRPr(txBody, paragraph),
    presentationLevelDefRPr(masterStyles, paragraph),
    txBody.getElementsByTagNameNS(A, 'defRPr')[0],
  ].filter(Boolean) as Element[]
}

function resolvePhClr(sp: Element | null, theme: ThemeColors, clrMap: ReturnType<typeof defaultClrMap>): string {
  if (!sp) return ''
  const style = childEl(sp, 'style')
  if (!style) return ''
  for (const name of ['fontRef', 'fillRef', 'lnRef']) {
    const ref = childEl(style, name)
    if (!ref || Number(ref.getAttribute('idx') || 0) === 0) continue
    const painted = paintColor(ref, theme, clrMap, sp) || fillRefThemePaint(ref, theme, clrMap, sp)
    if (painted) return painted
  }
  return ''
}

function rPrColor(
  rPr: Element | null,
  chain: Element[],
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  fallback: string,
  sp: Element | null = null,
) {
  if (rPr) {
    const painted = paintColor(rPr, theme, clrMap, sp)
    if (painted) return painted
  }
  for (const node of chain) {
    const painted = paintColor(node, theme, clrMap, sp)
    if (painted) return painted
  }
  if (sp) {
    const fromPh = resolvePhClr(sp, theme, clrMap)
    if (fromPh) return fromPh
    const fontRef = childEl(childEl(sp, 'style'), 'fontRef')
    const fromRef = fontRef ? paintColor(fontRef, theme, clrMap, sp) : ''
    if (fromRef) return fromRef
  }
  return fallback
}

function runStyleFromRPr(
  rPr: Element | null,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  fallbackSize: number,
  fallbackColor: string,
  boldChain: Element[] = [],
  sp: Element | null = null,
) {
  const fontSize = Number(rPr?.getAttribute('sz') || Math.round(fallbackSize * 100)) / 100
  const color = rPrColor(rPr, boldChain, theme, clrMap, fallbackColor, sp)
  const fontMeta = fontMetaFromRPr(rPr, theme.fonts, boldChain)
  return {
    fontSize: fontSize || fallbackSize,
    color: color || fallbackColor,
    bold: fontMeta.bold,
    fontFamily: fontMeta.fontFamily,
  }
}

function paragraphRuns(
  paragraph: Element,
  txBody: Element,
  sp: Element | null,
  masterStyles: MasterTextStyles,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  fallbackSize: number,
  fallbackColor: string,
): CwPptTextRun[] {
  const boldChain = textStyleChain(paragraph, txBody, sp, masterStyles)
  const runs: CwPptTextRun[] = []
  for (const child of [...paragraph.children]) {
    if (child.localName === 'r') {
      const text = runPlainText(child)
      if (!text) continue
      const style = runStyleFromRPr(childEl(child, 'rPr'), theme, clrMap, fallbackSize, fallbackColor, boldChain, sp)
      runs.push({
        text,
        fontSize: style.fontSize,
        color: style.color,
        bold: style.bold || undefined,
        fontFamily: style.fontFamily,
      })
    } else if (child.localName === 'fld') {
      const text = fldPlainText(child)
      if (!text) continue
      const fontMeta = fontMetaFromRPr(null, theme.fonts, boldChain)
      runs.push({
        text,
        fontSize: fallbackSize,
        color: rPrColor(null, boldChain, theme, clrMap, fallbackColor, sp),
        bold: fontMeta.bold || undefined,
        fontFamily: fontMeta.fontFamily,
      })
    }
  }
  return runs
}

function shapeParagraphsFromTxBody(
  txBody: Element,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  masterStyles: MasterTextStyles,
  sp: Element | null,
  defaultColor: string,
  tableStyleAlign?: CwPptAlign,
): CwPptTextParagraph[] {
  const defaultSize = shapeFontSize(txBody)
  const result: CwPptTextParagraph[] = []
  for (const paragraph of [...txBody.children].filter((child) => child.localName === 'p')) {
    const text = paragraphPlainText(paragraph)
    if (!text.trim()) continue
    const runs = paragraphRuns(paragraph, txBody, sp, masterStyles, theme, clrMap, defaultSize, defaultColor)
    const endPara = paragraph.getElementsByTagNameNS(A, 'endParaRPr')[0]
    const boldChain = textStyleChain(paragraph, txBody, sp, masterStyles)
    const base = runStyleFromRPr(endPara, theme, clrMap, defaultSize, defaultColor, boldChain, sp)
    const first = runs[0]
    const fontSize = first?.fontSize || base.fontSize
    const color = first?.color || base.color
    const bold = runs.some((run) => run.bold) || base.bold
    const fontFamily = first?.fontFamily || base.fontFamily
    const sizes = new Set(runs.map((run) => run.fontSize))
    const colors = new Set(runs.map((run) => run.color))
    const bolds = new Set(runs.map((run) => Boolean(run.bold)))
    const families = new Set(runs.map((run) => run.fontFamily))
    result.push({
      text,
      fontSize,
      color,
      align: paragraphAlign(paragraph, txBody, tableStyleAlign),
      lineHeight: paragraphLineHeight(paragraph),
      bold: bold || undefined,
      fontFamily,
      runs:
        runs.length > 1 && (sizes.size > 1 || colors.size > 1 || bolds.size > 1 || families.size > 1)
          ? runs
          : runs.length === 1 && (runs[0].bold || runs[0].color !== color)
            ? runs
            : undefined,
    })
  }
  return result
}

function shapeParagraphs(
  sp: Element,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  masterStyles: MasterTextStyles,
): CwPptTextParagraph[] {
  const txBody = childEl(sp, 'txBody')
  if (!txBody) return []
  return shapeParagraphsFromTxBody(txBody, theme, clrMap, masterStyles, sp, textColor(sp, theme, clrMap, masterStyles))
}

function readTextBodyMeta(sp: Element, slideCx: number, slideCy: number) {
  const txBody = childEl(sp, 'txBody')
  const bodyPr = txBody ? childEl(txBody, 'bodyPr') : null
  let textFit: CwPptTextFit = 'none'
  if (bodyPr) {
    if (childEl(bodyPr, 'normAutofit')) textFit = 'norm'
    else if (childEl(bodyPr, 'spAutoFit')) textFit = 'shape'
  }
  let padding: CwPptTextPadding | undefined
  if (bodyPr) {
    padding = {
      left: Number(bodyPr.getAttribute('lIns') || 0) / slideCx,
      top: Number(bodyPr.getAttribute('tIns') || 0) / slideCy,
      right: Number(bodyPr.getAttribute('rIns') || 0) / slideCx,
      bottom: Number(bodyPr.getAttribute('bIns') || 0) / slideCy,
    }
  }
  const anchor = bodyPr?.getAttribute('anchor') || 't'
  const vAnchor: 'top' | 'center' | 'bottom' =
    anchor === 'ctr' ? 'center' : anchor === 'b' ? 'bottom' : 'top'
  return { textFit, padding, vAnchor }
}

function shapeText(
  sp: Element,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  masterStyles: MasterTextStyles,
) {
  const paragraphs = shapeParagraphs(sp, theme, clrMap, masterStyles)
  if (!paragraphs.length) return null
  const text = paragraphs.map((paragraph) => paragraph.text).join('\n')
  const fontSize = paragraphs[0]?.fontSize || 18
  return { text, fontSize, paragraphs }
}

function tcFill(tc: Element, theme: ThemeColors, clrMap: ReturnType<typeof defaultClrMap>) {
  const tcPr = childEl(tc, 'tcPr')
  if (!tcPr || spPrHasNoFill(tcPr)) return { fill: '', fillOpacity: undefined }
  const solid = childEl(tcPr, 'solidFill')
  const painted = solid ? paintColorWithAlpha(solid, theme, clrMap) : paintColorWithAlpha(tcPr, theme, clrMap)
  if (!painted) return { fill: '', fillOpacity: undefined }
  return {
    fill: painted.color,
    fillOpacity: painted.opacity < 0.999 ? painted.opacity : undefined,
  }
}

function tcPadding(tc: Element, slideCx: number, slideCy: number): CwPptTextPadding | undefined {
  const tcPr = childEl(tc, 'tcPr')
  if (!tcPr) return undefined
  const marL = Number(tcPr.getAttribute('marL') || 0)
  const marR = Number(tcPr.getAttribute('marR') || 0)
  const marT = Number(tcPr.getAttribute('marT') || 0)
  const marB = Number(tcPr.getAttribute('marB') || 0)
  if (!marL && !marR && !marT && !marB) return undefined
  return {
    left: marL / slideCx,
    right: marR / slideCx,
    top: marT / slideCy,
    bottom: marB / slideCy,
  }
}

function lnBorderSide(
  ln: Element | null,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  defaultWidthEmu = EMU_PER_PT,
): CwPptBorderSide | null {
  if (!ln || childEl(ln, 'noFill')) return null
  const painted = paintColorWithAlpha(ln, theme, clrMap)
  if (!painted) return null
  const widthPt = Math.max(0.25, Number(ln.getAttribute('w') || defaultWidthEmu) / EMU_PER_PT)
  return {
    color: painted.color,
    widthPt,
    opacity: painted.opacity < 0.999 ? painted.opacity : undefined,
    dash: lnDashStyle(ln),
  }
}

function tcBdrRaw(tcBdr: Element, theme: ThemeColors, clrMap: ReturnType<typeof defaultClrMap>) {
  const raw: Record<string, CwPptBorderSide | undefined> = {}
  for (const key of ['left', 'right', 'top', 'bottom', 'insideH', 'insideV']) {
    const wrapper = childEl(tcBdr, key)
    if (!wrapper) continue
    const ln = childEl(wrapper, 'ln') || (wrapper.localName === 'ln' ? wrapper : null)
    const side = lnBorderSide(ln, theme, clrMap, 9525)
    if (side) raw[key] = side
  }
  return raw
}

function tcBdrForCellPosition(
  raw: Record<string, CwPptBorderSide | undefined>,
  rowIndex: number,
  colIndex: number,
  rowCount: number,
  colCount: number,
): CwPptCellBorders {
  const top = rowIndex === 0 ? raw.top : raw.insideH
  const bottom = rowIndex === rowCount - 1 ? raw.bottom : raw.insideH
  const left = colIndex === 0 ? raw.left : raw.insideV
  const right = colIndex === colCount - 1 ? raw.right : raw.insideV
  const borders: CwPptCellBorders = {}
  if (top) borders.top = top
  if (right) borders.right = right
  if (bottom) borders.bottom = bottom
  if (left) borders.left = left
  return borders
}

function mergeCellBorders(base: CwPptCellBorders, overlay: CwPptCellBorders): CwPptCellBorders {
  return {
    top: overlay.top ?? base.top,
    right: overlay.right ?? base.right,
    bottom: overlay.bottom ?? base.bottom,
    left: overlay.left ?? base.left,
  }
}

/** 相邻单元格共享的 inside 线只画一次，避免双边框叠成粗线 */
function collapseTableCellBorders(
  borders: CwPptCellBorders,
  rowIndex: number,
  colIndex: number,
  span: number,
  rowCount: number,
): CwPptCellBorders {
  const out: CwPptCellBorders = {}
  if (borders.top) out.top = borders.top
  if (rowIndex === rowCount - 1 && borders.bottom) out.bottom = borders.bottom
  if (colIndex === 0 && borders.left) out.left = borders.left
  if (borders.right) out.right = borders.right
  return out
}

function bordersFromStylePart(
  part: Element | null,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  rowIndex: number,
  colIndex: number,
  rowCount: number,
  colCount: number,
): CwPptCellBorders {
  if (!part) return {}
  const tcStyle = childEl(part, 'tcStyle')
  const tcBdr = tcStyle ? childEl(tcStyle, 'tcBdr') : null
  if (!tcBdr) return {}
  return tcBdrForCellPosition(tcBdrRaw(tcBdr, theme, clrMap), rowIndex, colIndex, rowCount, colCount)
}

function tableStyleParts(
  tbl: Element,
  styleRoot: Element,
  rowIndex: number,
  colIndex: number,
  rowCount: number,
  colCount: number,
) {
  const tblPr = childEl(tbl, 'tblPr')
  const firstRow = tblPr?.getAttribute('firstRow') === '1'
  const lastRow = tblPr?.getAttribute('lastRow') === '1'
  const firstCol = tblPr?.getAttribute('firstCol') === '1'
  const lastCol = tblPr?.getAttribute('lastCol') === '1'
  const bandRow = tblPr?.getAttribute('bandRow') === '1'
  const bandCol = tblPr?.getAttribute('bandCol') === '1'
  const parts: Element[] = []
  const whole = childEl(styleRoot, 'wholeTbl')
  if (whole) parts.push(whole)
  if (bandRow && rowIndex > 0) {
    const band = rowIndex % 2 === 1 ? childEl(styleRoot, 'band1H') : childEl(styleRoot, 'band2H')
    if (band) parts.push(band)
  }
  if (bandCol && colIndex > 0) {
    const band = colIndex % 2 === 1 ? childEl(styleRoot, 'band1V') : childEl(styleRoot, 'band2V')
    if (band) parts.push(band)
  }
  if (firstRow && rowIndex === 0) {
    const part = childEl(styleRoot, 'firstRow')
    if (part) parts.push(part)
  }
  if (lastRow && rowIndex === rowCount - 1) {
    const part = childEl(styleRoot, 'lastRow')
    if (part) parts.push(part)
  }
  if (firstCol && colIndex === 0) {
    const part = childEl(styleRoot, 'firstCol')
    if (part) parts.push(part)
  }
  if (lastCol && colIndex === colCount - 1) {
    const part = childEl(styleRoot, 'lastCol')
    if (part) parts.push(part)
  }
  const corner =
    rowIndex === 0 && colIndex === 0
      ? 'nwCell'
      : rowIndex === 0 && colIndex === colCount - 1
        ? 'neCell'
        : rowIndex === rowCount - 1 && colIndex === 0
          ? 'swCell'
          : rowIndex === rowCount - 1 && colIndex === colCount - 1
            ? 'seCell'
            : ''
  if (corner) {
    const part = childEl(styleRoot, corner)
    if (part) parts.push(part)
  }
  return parts
}

function alignFromTableStylePart(part: Element | null): CwPptAlign | undefined {
  if (!part) return undefined
  let tcTx = childEl(part, 'tcTxStyle')
  if (!tcTx) {
    const tcStyle = childEl(part, 'tcStyle')
    tcTx = tcStyle ? childEl(tcStyle, 'tcTxStyle') : null
  }
  if (!tcTx) return undefined
  const fromPPr = mapAlgn(childEl(tcTx, 'pPr')?.getAttribute('algn'))
  if (fromPPr) return fromPPr
  return undefined
}

function resolveTableStyleAlign(
  tbl: Element,
  theme: ThemeColors,
  rowIndex: number,
  colIndex: number,
  rowCount: number,
  colCount: number,
): CwPptAlign | undefined {
  const tblPr = childEl(tbl, 'tblPr')
  const styleId = childEl(tblPr, 'tableStyleId')?.textContent?.trim()
  if (!styleId) return undefined
  const styleRoot = theme.tableStyles.get(styleId)
  if (!styleRoot) return undefined
  let align: CwPptAlign | undefined
  for (const part of tableStyleParts(tbl, styleRoot, rowIndex, colIndex, rowCount, colCount)) {
    const next = alignFromTableStylePart(part)
    if (next) align = next
  }
  return align
}

function readTcTextMeta(tc: Element, slideCx: number, slideCy: number) {
  const txBody = childEl(tc, 'txBody')
  const bodyPr = txBody ? childEl(txBody, 'bodyPr') : null
  const tcPr = childEl(tc, 'tcPr')
  let padding = tcPadding(tc, slideCx, slideCy)
  if (bodyPr) {
    const fromBody: CwPptTextPadding = {
      left: Number(bodyPr.getAttribute('lIns') || 0) / slideCx,
      right: Number(bodyPr.getAttribute('rIns') || 0) / slideCx,
      top: Number(bodyPr.getAttribute('tIns') || 0) / slideCy,
      bottom: Number(bodyPr.getAttribute('bIns') || 0) / slideCy,
    }
    if (fromBody.left || fromBody.right || fromBody.top || fromBody.bottom) {
      padding = padding
        ? {
            left: padding.left || fromBody.left,
            right: padding.right || fromBody.right,
            top: padding.top || fromBody.top,
            bottom: padding.bottom || fromBody.bottom,
          }
        : fromBody
    }
  }
  const anchor = tcPr?.getAttribute('anchor') || bodyPr?.getAttribute('anchor') || 't'
  const vAnchor = anchor === 'ctr' ? 'center' : anchor === 'b' ? 'bottom' : 'top'
  return { padding, vAnchor: vAnchor as 'top' | 'center' | 'bottom' }
}

function resolveTableStyleBorders(
  tbl: Element,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  rowIndex: number,
  colIndex: number,
  rowCount: number,
  colCount: number,
): CwPptCellBorders {
  const tblPr = childEl(tbl, 'tblPr')
  const styleId = childEl(tblPr, 'tableStyleId')?.textContent?.trim()
  if (!styleId) return {}
  const styleRoot = theme.tableStyles.get(styleId)
  if (!styleRoot) return {}
  let merged: CwPptCellBorders = {}
  for (const part of tableStyleParts(tbl, styleRoot, rowIndex, colIndex, rowCount, colCount)) {
    merged = mergeCellBorders(
      merged,
      bordersFromStylePart(part, theme, clrMap, rowIndex, colIndex, rowCount, colCount),
    )
  }
  return merged
}

function tcPrDirectBorders(
  tcPr: Element | null,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
): CwPptCellBorders {
  if (!tcPr) return {}
  const borders: CwPptCellBorders = {}
  const direct: Record<keyof CwPptCellBorders, string> = {
    left: 'lnL',
    right: 'lnR',
    top: 'lnT',
    bottom: 'lnB',
  }
  const tableBorderDefault = 9525
  for (const [side, tag] of Object.entries(direct) as [keyof CwPptCellBorders, string][]) {
    const painted = lnBorderSide(childEl(tcPr, tag), theme, clrMap, tableBorderDefault)
    if (painted) borders[side] = painted
  }
  const tcBdr = childEl(tcPr, 'tcBdr')
  if (tcBdr) {
    for (const [side, tag] of Object.entries(direct) as [keyof CwPptCellBorders, string][]) {
      const wrapper = childEl(tcBdr, tag)
      if (!wrapper) continue
      const painted = lnBorderSide(childEl(wrapper, 'ln') || wrapper, theme, clrMap, tableBorderDefault)
      if (painted) borders[side] = painted
    }
  }
  return borders
}

function cellHasBorders(borders: CwPptCellBorders) {
  return Boolean(borders.top || borders.right || borders.bottom || borders.left)
}

function walkTable(
  frameHost: Element,
  graphicData: Element,
  space: Space,
  slide: CwPptSlide,
  slideCx: number,
  slideCy: number,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  masterStyles: MasterTextStyles,
) {
  const tbl = graphicData.getElementsByTagNameNS(A, 'tbl')[0]
  if (!tbl) return
  const xfrm = shapeXfrm(frameHost)
  if (!xfrm) return
  const tableFrame = frameOfBox(xfrm, space, slideCx, slideCy)
  const colWidths = [...tbl.getElementsByTagNameNS(A, 'gridCol')].map((col) => Number(col.getAttribute('w') || 0))
  const totalW = colWidths.reduce((sum, width) => sum + width, 0) || slideCx
  const rows = [...tbl.getElementsByTagNameNS(A, 'tr')]
  const rowHeights = rows.map((tr) => Number(tr.getAttribute('h') || 0))
  const totalH = rowHeights.reduce((sum, height) => sum + height, 0) || slideCy
  const rowCount = rows.length
  const colCount = colWidths.length
  let rowTop = 0
  for (const [rowIndex, tr] of rows.entries()) {
    const rowH = rowHeights[rowIndex] || 0
    let colLeft = 0
    let colIndex = 0
    for (const tc of [...tr.children].filter((child) => child.localName === 'tc')) {
      const tcPr = childEl(tc, 'tcPr')
      if (tcPr && childEl(tcPr, 'hMerge')) continue
      const span = Number(childEl(tcPr, 'gridSpan')?.getAttribute('val') || 1)
      let cellW = 0
      for (let i = 0; i < span; i += 1) cellW += colWidths[colIndex + i] || 0
      if (tcPr && childEl(tcPr, 'vMerge')) {
        colIndex += span
        colLeft += cellW
        continue
      }
      const txBody = childEl(tc, 'txBody')
      const tableStyleAlign = resolveTableStyleAlign(tbl, theme, rowIndex, colIndex, rowCount, colCount)
      const tcMeta = readTcTextMeta(tc, slideCx, slideCy)
      const paragraphs = txBody
        ? shapeParagraphsFromTxBody(txBody, theme, clrMap, masterStyles, null, tokenSolidColors.docInk, tableStyleAlign)
        : []
      const text = paragraphs.map((paragraph) => paragraph.text).join('\n')
      const { fill, fillOpacity } = tcFill(tc, theme, clrMap)
      const styleBorders = resolveTableStyleBorders(tbl, theme, clrMap, rowIndex, colIndex, rowCount, colCount)
      const merged = mergeCellBorders(styleBorders, tcPrDirectBorders(tcPr, theme, clrMap))
      const borders = collapseTableCellBorders(merged, rowIndex, colIndex, span, rowCount)
      if (!text.trim() && !fill && !cellHasBorders(borders)) {
        colIndex += span
        colLeft += cellW
        continue
      }
      const z = slide.boxes.length + slide.images.length + (slide.lines?.length ?? 0)
      slide.boxes.push({
        id: createId('box'),
        x: tableFrame.x + (colLeft / totalW) * tableFrame.w,
        y: tableFrame.y + (rowTop / totalH) * tableFrame.h,
        w: (cellW / totalW) * tableFrame.w,
        h: (rowH / totalH) * tableFrame.h,
        text,
        fontSize: paragraphs[0]?.fontSize || 18,
        color: paragraphs[0]?.color || tokenSolidColors.docInk,
        fill,
        fillOpacity,
        borders: cellHasBorders(borders) ? borders : undefined,
        align: paragraphs[0]?.align || tableStyleAlign || 'left',
        padding: tcMeta.padding,
        vAnchor: tcMeta.vAnchor,
        paragraphs: paragraphs.length ? paragraphs : undefined,
        bold: paragraphs[0]?.bold,
        fontFamily: paragraphs[0]?.fontFamily,
        z,
      })
      colIndex += span
      colLeft += cellW
    }
    rowTop += rowH
  }
}

function textAlign(sp: Element): CwPptAlign {
  const algn = sp.getElementsByTagNameNS(A, 'pPr')[0]?.getAttribute('algn')
  if (algn === 'ctr' || algn === 'center') return 'center'
  if (algn === 'r' || algn === 'right') return 'right'
  return 'left'
}

function isPlaceholder(sp: Element) {
  return [...sp.getElementsByTagNameNS(P, 'nvPr')].some((nvPr) => [...nvPr.children].some((child) => child.localName === 'ph'))
}

interface ZipRel {
  target: string
  type: string
}

function readRels(xml: string) {
  const doc = parseXml(xml)
  const map = new Map<string, ZipRel>()
  for (const node of doc.getElementsByTagNameNS(RELS, 'Relationship')) {
    const id = node.getAttribute('Id')
    const target = node.getAttribute('Target')
    if (id && target) map.set(id, { target, type: node.getAttribute('Type') || '' })
  }
  return map
}

function relByType(rels: Map<string, ZipRel>, kind: string) {
  for (const rel of rels.values()) {
    if (rel.type.split('/').pop() === kind) return rel.target
  }
  return ''
}

interface ThemeFonts {
  majorLatin: string
  majorEa: string
  minorLatin: string
  minorEa: string
}

interface ThemeColors {
  colors: Record<string, string>
  fonts: ThemeFonts
  /** theme fmtScheme fillStyleLst 子节点，用于 fillRef@idx */
  fillStyles: Element[]
  /** theme tblStyleLst，styleId → a:tblStyle */
  tableStyles: Map<string, Element>
}

interface MasterTextStyles {
  title: (Element | null)[]
  body: (Element | null)[]
  other: (Element | null)[]
  /** presentation.xml defaultTextStyle lvl1–9 defRPr */
  presentation: (Element | null)[]
}

const EMPTY_MASTER_STYLES: MasterTextStyles = { title: [], body: [], other: [], presentation: [] }

function defaultClrMap() {
  return {
    bg1: 'lt1',
    tx1: 'dk1',
    bg2: 'lt2',
    tx2: 'dk2',
    accent1: 'accent1',
    accent2: 'accent2',
    accent3: 'accent3',
    accent4: 'accent4',
    accent5: 'accent5',
    accent6: 'accent6',
    hlink: 'hlink',
    folHlink: 'folHlink',
  }
}

function clampByte(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function hexToRgb(hex: string) {
  const value = hex.replace('#', '').padStart(6, '0').slice(0, 6)
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)]
}

function rgbToHex(r: number, g: number, b: number) {
  return [r, g, b].map((channel) => clampByte(channel).toString(16).padStart(2, '0')).join('').toUpperCase()
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const light = (max + min) / 2
  if (max === min) return [0, 0, light]
  const delta = max - min
  const sat = light > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  let hue = 0
  if (max === rn) hue = (gn - bn) / delta + (gn < bn ? 6 : 0)
  else if (max === gn) hue = (bn - rn) / delta + 2
  else hue = (rn - gn) / delta + 4
  return [hue / 6, sat, light]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l * 255, l * 255, l * 255]
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const hue = (t: number) => {
    let x = t
    if (x < 0) x += 1
    if (x > 1) x -= 1
    if (x < 1 / 6) return p + (q - p) * 6 * x
    if (x < 1 / 2) return q
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6
    return p
  }
  return [hue(h + 1 / 3) * 255, hue(h) * 255, hue(h - 1 / 3) * 255]
}

function applyColorMods(hex: string, node: Element) {
  let [r, g, b] = hexToRgb(hex)
  const shade = childEl(node, 'shade')
  const tint = childEl(node, 'tint')
  if (shade) {
    const scale = Number(shade.getAttribute('val') || 100000) / 100000
    r *= scale
    g *= scale
    b *= scale
  }
  if (tint) {
    const scale = Number(tint.getAttribute('val') || 100000) / 100000
    r = r * scale + 255 * (1 - scale)
    g = g * scale + 255 * (1 - scale)
    b = b * scale + 255 * (1 - scale)
  }
  const lumMod = childEl(node, 'lumMod')
  const lumOff = childEl(node, 'lumOff')
  if (lumMod || lumOff) {
    const hsl = rgbToHsl(r, g, b)
    const mod = lumMod ? Number(lumMod.getAttribute('val') || 100000) / 100000 : 1
    const off = lumOff ? Number(lumOff.getAttribute('val') || 0) / 100000 : 0
    hsl[2] = Math.max(0, Math.min(1, hsl[2] * mod + off))
    ;[r, g, b] = hslToRgb(hsl[0], hsl[1], hsl[2])
  }
  return rgbToHex(r, g, b)
}

function readClrMap(doc: Document) {
  const map = defaultClrMap()
  const node = doc.getElementsByTagNameNS(P, 'clrMap')[0]
  if (!node) return map
  for (const key of Object.keys(map)) {
    const value = node.getAttribute(key)
    if (value) map[key as keyof typeof map] = value
  }
  return map
}

function readClrOverride(doc: Document, base: ReturnType<typeof defaultClrMap>) {
  const override = doc.getElementsByTagNameNS(A, 'overrideClrMapping')[0]
  if (!override) return base
  const next = { ...base }
  for (const key of Object.keys(next)) {
    const value = override.getAttribute(key)
    if (value) next[key as keyof typeof next] = value
  }
  return next
}

function resolveScheme(value: string, theme: ThemeColors, clrMap: ReturnType<typeof defaultClrMap>) {
  const mapped = clrMap[value as keyof typeof clrMap] || value
  return theme.colors[mapped] || theme.colors[value] || '000000'
}

function colorAlpha(node: Element) {
  const alpha = childEl(node, 'alpha')
  if (!alpha) return 1
  const val = Number(alpha.getAttribute('val') || 100000)
  if (val <= 0) return 0
  return Math.min(1, val / 100000)
}

function colorOf(
  el: Element,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  phSp: Element | null = null,
): string {
  if (childEl(el, 'solidFill') || childEl(el, 'gradFill')) {
    const nested = paintColor(el, theme, clrMap, phSp)
    if (nested) return nested
  }
  const srgb = childEl(el, 'srgbClr')
  const scheme = childEl(el, 'schemeClr')
  const sys = childEl(el, 'sysClr')
  const prst = childEl(el, 'prstClr')
  const node = srgb || scheme || sys || prst
  if (!node) return ''
  if (colorAlpha(node) === 0) return ''
  let raw = ''
  if (srgb) raw = srgb.getAttribute('val') || ''
  else if (sys) raw = sys.getAttribute('lastClr') || ''
  else if (prst) raw = prst.getAttribute('val') || ''
  else if (scheme) {
    const val = scheme.getAttribute('val') || ''
    if (val === 'phClr') {
      const ph = resolvePhClr(phSp, theme, clrMap)
      if (ph) return ph
      raw = resolveScheme('tx1', theme, clrMap)
    } else {
      raw = resolveScheme(val, theme, clrMap)
    }
  }
  if (!raw) return ''
  return `#${applyColorMods(raw, node)}`
}

function paintColorWithAlpha(
  el: Element | null,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  phSp: Element | null = null,
) {
  if (!el) return null
  const hex = paintColor(el, theme, clrMap, phSp)
  if (!hex) return null
  const solid = childEl(el, 'solidFill')
  const paintRoot = solid || el
  const node =
    childEl(paintRoot, 'srgbClr') ||
    childEl(paintRoot, 'schemeClr') ||
    childEl(paintRoot, 'sysClr') ||
    childEl(paintRoot, 'prstClr')
  const opacity = node ? colorAlpha(node) : 1
  if (opacity === 0) return null
  return { color: hex, opacity }
}

function resolveShapeFill(sp: Element, theme: ThemeColors, clrMap: ReturnType<typeof defaultClrMap>) {
  const spPr = childEl(sp, 'spPr')
  if (spPr) {
    if (spPrHasNoFill(spPr)) return { fill: '', fillOpacity: undefined }
    const solid = childEl(spPr, 'solidFill')
    if (solid) {
      const painted = paintColorWithAlpha(solid, theme, clrMap, sp)
      if (painted) {
        return {
          fill: painted.color,
          fillOpacity: painted.opacity < 0.999 ? painted.opacity : undefined,
        }
      }
    }
    const grad = childEl(spPr, 'gradFill')
    if (grad) {
      const hex = gradientColor(grad, theme, clrMap, sp)
      if (hex) return { fill: hex, fillOpacity: undefined }
    }
  }
  const fillRef = childEl(childEl(sp, 'style'), 'fillRef')
  if (!fillRef || Number(fillRef.getAttribute('idx') || 0) === 0) return { fill: '', fillOpacity: undefined }
  const fromRef = paintColorWithAlpha(fillRef, theme, clrMap, sp)
  if (fromRef) {
    return {
      fill: fromRef.color,
      fillOpacity: fromRef.opacity < 0.999 ? fromRef.opacity : undefined,
    }
  }
  const idx = Number(fillRef.getAttribute('idx') || 0)
  const themeFill = idx > 0 ? theme.fillStyles[idx - 1] : null
  if (themeFill) {
    const fromTheme = paintColorWithAlpha(themeFill, theme, clrMap, sp)
    if (fromTheme) {
      return {
        fill: fromTheme.color,
        fillOpacity: fromTheme.opacity < 0.999 ? fromTheme.opacity : undefined,
      }
    }
  }
  const hex = colorOf(fillRef, theme, clrMap, sp)
  return { fill: hex, fillOpacity: undefined }
}

function gradientColor(
  grad: Element,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  phSp: Element | null = null,
) {
  const stops = [...grad.getElementsByTagNameNS(A, 'gs')]
  if (!stops.length) return ''
  const chosen = stops.reduce((best, stop) => {
    const pos = Number(stop.getAttribute('pos') || 0)
    return Math.abs(pos - 50000) < Math.abs(best.pos - 50000) ? { stop, pos } : best
  }, { stop: stops[0]!, pos: Number(stops[0]?.getAttribute('pos') || 0) })
  return colorOf(chosen.stop, theme, clrMap, phSp)
}

function paintColor(
  el: Element | null,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  phSp: Element | null = null,
): string {
  if (!el) return ''
  const solid = childEl(el, 'solidFill')
  if (solid) return colorOf(solid, theme, clrMap, phSp)
  const grad = childEl(el, 'gradFill')
  if (grad) return gradientColor(grad, theme, clrMap, phSp)
  return colorOf(el, theme, clrMap, phSp)
}

function readBackground(doc: Document, theme: ThemeColors, clrMap: ReturnType<typeof defaultClrMap>, fallback: string) {
  const bg = doc.getElementsByTagNameNS(P, 'bg')[0]
  if (!bg) return fallback
  const bgPr = childEl(bg, 'bgPr')
  if (bgPr) {
    if (childEl(bgPr, 'noFill')) return fallback
    return paintColor(bgPr, theme, clrMap) || fallback
  }
  return paintColor(childEl(bg, 'bgRef'), theme, clrMap) || fallback
}

function defaultThemeFonts(): ThemeFonts {
  return {
    majorLatin: 'Calibri Light',
    majorEa: 'Microsoft YaHei',
    minorLatin: 'Calibri',
    minorEa: 'Microsoft YaHei',
  }
}

function readThemeFonts(doc: Document): ThemeFonts {
  const fonts = defaultThemeFonts()
  const scheme = doc.getElementsByTagNameNS(A, 'fontScheme')[0]
  if (!scheme) return fonts
  const major = childEl(scheme, 'majorFont')
  const minor = childEl(scheme, 'minorFont')
  const majorLatin = childEl(major, 'latin')?.getAttribute('typeface')
  const majorEa = childEl(major, 'ea')?.getAttribute('typeface')
  const minorLatin = childEl(minor, 'latin')?.getAttribute('typeface')
  const minorEa = childEl(minor, 'ea')?.getAttribute('typeface')
  if (majorLatin) fonts.majorLatin = majorLatin
  if (majorEa) fonts.majorEa = majorEa
  if (minorLatin) fonts.minorLatin = minorLatin
  if (minorEa) fonts.minorEa = minorEa
  return fonts
}

function resolveThemeTypeface(token: string, fonts: ThemeFonts) {
  switch (token) {
    case '+mj-lt':
      return fonts.majorLatin
    case '+mj-ea':
      return fonts.majorEa
    case '+mn-lt':
      return fonts.minorLatin
    case '+mn-ea':
      return fonts.minorEa
    case '+mj-cs':
      return fonts.majorLatin
    case '+mn-cs':
      return fonts.minorLatin
    default:
      return ''
  }
}

function readStyleLevels(styleEl: Element | undefined) {
  if (!styleEl) return []
  const levels: (Element | null)[] = []
  for (let lvl = 1; lvl <= 9; lvl += 1) {
    const lvlPr = childEl(styleEl, `lvl${lvl}pPr`)
    levels.push(lvlPr ? childEl(lvlPr, 'defRPr') : null)
  }
  return levels
}

function readMasterTextStyles(masterDoc: Document | null): MasterTextStyles {
  if (!masterDoc) return EMPTY_MASTER_STYLES
  return {
    title: readStyleLevels(masterDoc.getElementsByTagNameNS(P, 'titleStyle')[0]),
    body: readStyleLevels(masterDoc.getElementsByTagNameNS(P, 'bodyStyle')[0]),
    other: readStyleLevels(masterDoc.getElementsByTagNameNS(P, 'otherStyle')[0]),
    presentation: [],
  }
}

function readPresentationTextStyles(presDoc: Document): (Element | null)[] {
  const styleEl = presDoc.getElementsByTagNameNS(P, 'defaultTextStyle')[0]
  return readStyleLevels(styleEl)
}

function placeholderDefRPr(sp: Element | null, masterStyles: MasterTextStyles) {
  if (!sp) return null
  const ph = sp.getElementsByTagNameNS(P, 'ph')[0]
  if (!ph) return null
  const type = ph.getAttribute('type') || 'body'
  const idx = Number(ph.getAttribute('idx') || 0)
  const pick = (list: (Element | null)[]) => list[idx] ?? list[0] ?? null
  if (type === 'title' || type === 'ctrTitle') return pick(masterStyles.title)
  if (type === 'body') return pick(masterStyles.body)
  return pick(masterStyles.other)
}

function fillRefThemePaint(
  fillRef: Element,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  phSp: Element | null,
) {
  if (fillRef.localName !== 'fillRef') return ''
  const idx = Number(fillRef.getAttribute('idx') || 0)
  if (idx <= 0) return ''
  const themeFill = theme.fillStyles[idx - 1]
  return themeFill ? paintColor(themeFill, theme, clrMap, phSp) : ''
}

async function loadTheme(zip: PptxArchivePayload): Promise<ThemeColors> {
  const colors: Record<string, string> = {
    dk1: '000000',
    lt1: 'FFFFFF',
    dk2: '1F4E79',
    lt2: 'EEEEEE',
    accent1: '5B9BD5',
    accent2: 'ED7D31',
    accent3: 'A9D08E',
    accent4: 'FFC000',
    accent5: '4472C4',
    accent6: '70AD47',
    hlink: '0563C1',
    folHlink: '954F72',
  }
  const fonts = defaultThemeFonts()
  const themePath =
    zip.text['ppt/theme/theme1.xml'] !== undefined
      ? 'ppt/theme/theme1.xml'
      : Object.keys(zip.text).find((path) => /^ppt\/theme\/theme\d+\.xml$/.test(path))
  const themeXml = themePath ? zip.text[themePath] : ''
  if (!themeXml) return { colors, fonts, fillStyles: [], tableStyles: new Map() }
  const doc = parseXml(themeXml)
  const scheme = doc.getElementsByTagNameNS(A, 'clrScheme')[0]
  if (scheme) {
    for (const node of [...scheme.children]) {
      const srgb = childEl(node, 'srgbClr')
      const sys = childEl(node, 'sysClr')
      const value = srgb?.getAttribute('val') || sys?.getAttribute('lastClr')
      if (node.localName && value) colors[node.localName] = value.toUpperCase()
    }
  }
  const fillLst = doc.getElementsByTagNameNS(A, 'fillStyleLst')[0]
  const fillStyles = fillLst ? [...fillLst.children] : []
  const tableStyles = new Map<string, Element>()
  const tblStyleLst = doc.getElementsByTagNameNS(A, 'tblStyleLst')[0]
  if (tblStyleLst) {
    for (const style of [...tblStyleLst.children]) {
      const id = style.getAttribute('styleId')
      if (id) tableStyles.set(id, style)
    }
  }
  return { colors, fonts: readThemeFonts(doc), fillStyles, tableStyles }
}

/** p:embeddedFont regular/bold/italic/boldItalic 变体 → 字重/斜体 */
const EMBED_FONT_VARIANTS: { tag: string; weight?: string; style?: 'italic' }[] = [
  { tag: 'regular', weight: '400' },
  { tag: 'bold', weight: '700' },
  { tag: 'italic', weight: '400', style: 'italic' },
  { tag: 'boldItalic', weight: '700', style: 'italic' },
]

/**
 * 读取 p:embeddedFontLst 内嵌字体，只取 .fntdata 的原始字节（EOT 容器）。
 * 解压是同步重活（单个中文字体可达数秒），统一交给 Worker，解析阶段绝不触碰。
 * 文稿里没引用到的字体直接跳过，省掉解压与 FontFace 解析的整份开销。
 */
async function readEmbeddedFonts(
  zip: PptxArchivePayload,
  pres: Document,
  presRels: Map<string, ZipRel>,
  usedFamilies: Set<string>,
): Promise<CwPptEmbeddedFont[]> {
  const lst = pres.getElementsByTagNameNS(P, 'embeddedFontLst')[0]
  if (!lst) {
    console.log('[CwPptEditor] 该 pptx 未声明内嵌字体（p:embeddedFontLst 不存在）')
    return []
  }
  const children = [...lst.children].filter((el) => el.localName === 'embeddedFont')
  console.log(`[CwPptEditor] 内嵌字体声明 ${children.length} 个：`, children.map((el) => childEl(el, 'font')?.getAttribute('typeface')))
  const fonts: CwPptEmbeddedFont[] = []
  for (const embedded of children) {
    const family = childEl(embedded, 'font')?.getAttribute('typeface')?.trim()
    if (!family) continue
    if (usedFamilies.size && !usedFamilies.has(family)) {
      console.log(`[CwPptEditor] 内嵌字体 ${family} 未被文稿引用，跳过解压`)
      continue
    }
    for (const variant of EMBED_FONT_VARIANTS) {
      const ref = childEl(embedded, variant.tag)
      const relId = ref?.getAttributeNS(R, 'id') || ref?.getAttribute('r:id') || ''
      const target = relId ? presRels.get(relId)?.target : ''
      if (!target) continue
      const path = resolveTarget('ppt/presentation.xml', target)
      // 字节由 Worker 解压并转移过来，这里只查表，不再触发任何解压
      const bytes = zip.binary[path]
      if (!bytes) {
        console.warn(`[CwPptEditor] 内嵌字体 ${family}(${variant.tag}) 指向的 ${path} 不存在，已跳过`)
        continue
      }
      fonts.push({
        family,
        weight: variant.weight,
        style: variant.style ?? 'normal',
        bytes,
      })
    }
  }
  return fonts
}

/** 文稿里实际写进 CSS font-family 栈的字体名，用于剔除未被引用的内嵌字体 */
function collectUsedFontFamilies(slides: CwPptSlide[]) {
  const used = new Set<string>()
  const bump = (stack?: string) => {
    for (const [, name] of (stack ?? '').matchAll(/"([^"]+)"/g)) {
      if (name) used.add(name)
    }
  }
  for (const slide of slides) {
    for (const box of slide.boxes) {
      bump(box.fontFamily)
      for (const para of box.paragraphs ?? []) {
        bump(para.fontFamily)
        for (const run of para.runs ?? []) bump(run.fontFamily)
      }
    }
  }
  return used
}

function presetName(sp: Element) {
  const spPr = childEl(sp, 'spPr')
  const geom = spPr ? childEl(spPr, 'prstGeom') || childEl(spPr, 'custGeom') : null
  return geom?.getAttribute('prst') || ''
}

function roundRectCornerRadius(sp: Element) {
  const spPr = childEl(sp, 'spPr')
  const geom = spPr ? childEl(spPr, 'prstGeom') : null
  if (geom?.getAttribute('prst') !== 'roundRect') return undefined
  return roundRectRadiusPercent(readPrstGeomAdjust(sp))
}

function lnDashStyle(ln: Element | null): 'solid' | 'dashed' | 'dotted' {
  const prstDash = ln ? childEl(ln, 'prstDash') : null
  const val = prstDash?.getAttribute('val') || 'solid'
  if (val === 'sysDot' || val === 'dot') return 'dotted'
  if (/dash/i.test(val)) return 'dashed'
  return 'solid'
}

function boxGeomFromSp(sp: Element) {
  const preset = presetName(sp)
  const adjust = readPrstGeomAdjust(sp)
  if (preset === 'ellipse') return { geomPreset: 'ellipse' as const }
  if (preset === 'roundRect') {
    return {
      geomPreset: 'roundRect' as const,
      roundRectRadius: roundRectCornerRadius(sp),
    }
  }
  if (preset === 'hexagon') {
    return {
      geomPreset: 'hexagon' as const,
      polygonPoints: hexagonPoints100(adjust),
    }
  }
  if (preset === 'rtTriangle') {
    return {
      geomPreset: 'rtTriangle' as const,
      polygonPoints: rtTrianglePoints100(),
    }
  }
  return {}
}

function lnHasVisiblePaint(
  ln: Element | null,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  sp: Element,
) {
  if (!ln || childEl(ln, 'noFill')) return false
  return Boolean(paintColorWithAlpha(ln, theme, clrMap, sp) || paintColor(ln, theme, clrMap, sp))
}

function shapeBorderFields(
  sp: Element,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  stroke: { color: string; widthPt: number; strokeOpacity?: number } | null,
) {
  if (!stroke?.color) return {}
  const spPr = childEl(sp, 'spPr')
  const ln = spPr ? childEl(spPr, 'ln') : null
  if (!lnHasVisiblePaint(ln, theme, clrMap, sp)) {
    const lnRef = childEl(childEl(sp, 'style'), 'lnRef')
    const idx = Number(lnRef?.getAttribute('idx') || 0)
    if (!lnRef || idx === 0) return {}
  }
  return {
    borderColor: stroke.color,
    borderWidthPt: stroke.widthPt,
    borderOpacity: stroke.strokeOpacity,
    borderDash: lnDashStyle(ln),
  }
}

/** 底部细条色块（产品特点等页），需在卡片描边之上 */
function isAccentBarBox(box: CwPptBox) {
  if (box.text.trim() || !box.fill || box.borderColor) return false
  const aspect = box.h / Math.max(box.w, 1e-6)
  return aspect > 0.002 && aspect < 0.14
}

function dedupeIdenticalBoxes(slide: CwPptSlide) {
  const seen = new Set<string>()
  slide.boxes = slide.boxes.filter((box) => {
    if (box.text.trim() || box.paragraphs?.length) return true
    const key = [
      box.x.toFixed(5),
      box.y.toFixed(5),
      box.w.toFixed(5),
      box.h.toFixed(5),
      box.fill,
      box.borderColor ?? '',
    ].join('|')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function normalizeSlideStacking(slide: CwPptSlide) {
  dedupeIdenticalBoxes(slide)
  let maxZ = Math.max(
    0,
    ...slide.boxes.map((box) => box.z),
    ...slide.images.map((image) => image.z),
    ...(slide.lines ?? []).map((line) => line.z),
  )
  const accents = slide.boxes.filter(isAccentBarBox)
  for (const bar of accents) {
    maxZ += 1
    bar.z = maxZ
  }
}

function isLineLike(sp: Element, raw: { w: number; h: number }) {
  if (sp.localName === 'cxnSp') return true
  const prst = presetName(sp)
  if (prst && /line|connector/i.test(prst)) return true
  const w = Math.abs(raw.w)
  const h = Math.abs(raw.h)
  const minDim = Math.min(w, h)
  const maxDim = Math.max(w, h)
  if (maxDim < 0.008) return false
  if (minDim === 0) return true
  return minDim < 0.004 && maxDim > 0.008
}

/** 细长条（纵向/横向分割线）：不宜走矩形描边，应按色条填充 */
function isThinBar(raw: { w: number; h: number }) {
  const w = Math.abs(raw.w)
  const h = Math.abs(raw.h)
  const minDim = Math.min(w, h)
  const maxDim = Math.max(w, h)
  if (maxDim < 0.02) return false
  if (minDim < 0.0005) return true
  return minDim / maxDim < 0.12
}

function pushThinBarBox(
  slide: CwPptSlide,
  frame: ReturnType<typeof frameOfBox>,
  fill: string,
  fillOpacity: number | undefined,
  z: number,
) {
  slide.boxes.push({
    id: createId('box'),
    ...frame,
    text: '',
    fontSize: 18,
    color: tokenSolidColors.docInk,
    fill,
    fillOpacity,
    align: 'left',
    z,
  })
}

function lineGeomPreset(sp: Element) {
  const prst = presetName(sp)
  return Boolean(prst && /^line/i.test(prst))
}

function readPrstGeomAdjust(sp: Element) {
  const spPr = childEl(sp, 'spPr')
  const geom = spPr ? childEl(spPr, 'prstGeom') : null
  const avLst = geom ? childEl(geom, 'avLst') : null
  const adjust: Record<string, number> = {}
  if (!avLst) return adjust
  for (const child of [...avLst.children]) {
    if (child.localName !== 'gd') continue
    const name = child.getAttribute('name')
    const fmla = child.getAttribute('fmla') || ''
    const match = /val\s+(-?\d+)/.exec(fmla)
    if (name && match) adjust[name] = Number(match[1])
  }
  return adjust
}

function isConnectorShape(sp: Element, hasText: boolean, rawFrame: { w: number; h: number }) {
  if (hasText) return false
  if (sp.localName === 'cxnSp') return true
  const prst = presetName(sp)
  if (prst && linePresetInBox(rawFrame, prst)) return true
  if (prst && isConnectorPreset(prst)) return true
  const spPr = childEl(sp, 'spPr')
  return Boolean(custGeomPolyline100(spPr))
}

function connectorStrokePaint(
  sp: Element,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  stroke: { color: string; widthPt: number; strokeOpacity?: number } | null,
  fill: string,
  fillOpacity: number | undefined,
) {
  if (stroke?.color) return stroke
  const spPr = childEl(sp, 'spPr')
  const ln = spPr ? childEl(spPr, 'ln') : null
  if (ln && !childEl(ln, 'noFill')) {
    const painted = paintColorWithAlpha(ln, theme, clrMap, sp)
    if (painted) {
      const widthPt = Math.max(0.25, Number(ln.getAttribute('w') || EMU_PER_PT) / EMU_PER_PT)
      return {
        color: painted.color,
        widthPt,
        strokeOpacity: painted.opacity < 0.999 ? painted.opacity : undefined,
      }
    }
  }
  if (fill) {
    return {
      color: fill,
      widthPt: 1,
      strokeOpacity: fillOpacity,
    }
  }
  return { color: tokenSolidColors.docLine, widthPt: 1 }
}

function pushAxisAlignedStrokeLine(
  slide: CwPptSlide,
  sp: Element,
  xfrm: Element,
  space: Space,
  slideCx: number,
  slideCy: number,
  stroke: { color: string; widthPt: number; strokeOpacity?: number },
  z: number,
) {
  const flip = xfrmFlip(xfrm)
  const rot = xfrmRotDeg(xfrm)
  const raw = frameRaw(xfrm, space, slideCx, slideCy)
  slide.lines.push({
    id: createId('line'),
    ...frameOfLine(xfrm, space, slideCx, slideCy),
    color: stroke.color,
    widthPt: stroke.widthPt,
    strokeOpacity: stroke.strokeOpacity,
    rot: rot || undefined,
    geomPreset: presetName(sp),
    polyline: axisAlignedLinePolyline100(raw, flip.flipH, flip.flipV),
    z,
  })
}

function pushConnectorLine(
  slide: CwPptSlide,
  sp: Element,
  xfrm: Element,
  space: Space,
  slideCx: number,
  slideCy: number,
  stroke: { color: string; widthPt: number; strokeOpacity?: number },
  z: number,
  polylineOverride?: { x: number; y: number }[] | null,
) {
  const prst = presetName(sp) || 'straightConnector1'
  const flip = xfrmFlip(xfrm)
  const rot = xfrmRotDeg(xfrm)
  const adjust = readPrstGeomAdjust(sp)
  const raw = frameRaw(xfrm, space, slideCx, slideCy)
  const spPr = childEl(sp, 'spPr')
  const polyline =
    polylineOverride && polylineOverride.length >= 2
      ? polylineOverride
      : linePresetInBox(raw, prst)
        ? linePresetPolyline100(prst, flip.flipH, flip.flipV, raw)
        : connectorPolyline100(prst, flip.flipH, flip.flipV, adjust)
  slide.lines.push({
    id: createId('line'),
    ...frameOfLine(xfrm, space, slideCx, slideCy),
    color: stroke.color,
    widthPt: stroke.widthPt,
    strokeOpacity: stroke.strokeOpacity,
    rot: rot || undefined,
    geomPreset: prst,
    polyline,
    z,
  })
}

/** 分割线/连接条：矩形细条优先 spPr 实心填充；line 几何以 a:ln 为准（常见白底 solidFill + 彩色描边） */
function barFillPaint(
  sp: Element,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  resolvedFill: string,
  resolvedOpacity: number | undefined,
  stroke: { color: string; widthPt: number; strokeOpacity?: number } | null,
) {
  if (lineGeomPreset(sp) && stroke?.color) {
    return { fill: stroke.color, fillOpacity: stroke.strokeOpacity }
  }
  if (resolvedFill) return { fill: resolvedFill, fillOpacity: resolvedOpacity }
  const spPr = childEl(sp, 'spPr')
  if (spPr && !spPrHasNoFill(spPr)) {
    const solid = childEl(spPr, 'solidFill')
    const painted = solid ? paintColorWithAlpha(solid, theme, clrMap, sp) : null
    if (painted) {
      return {
        fill: painted.color,
        fillOpacity: painted.opacity < 0.999 ? painted.opacity : undefined,
      }
    }
  }
  if (stroke?.color) {
    return { fill: stroke.color, fillOpacity: stroke.strokeOpacity }
  }
  return null
}

function shapeStroke(sp: Element, theme: ThemeColors, clrMap: ReturnType<typeof defaultClrMap>) {
  const spPr = childEl(sp, 'spPr')
  const ln = spPr ? childEl(spPr, 'ln') : null
  const widthPt = Math.max(0.25, Number(ln?.getAttribute('w') || 12700) / 12700)
  if (!ln || childEl(ln, 'noFill')) {
    const lnRef = childEl(childEl(sp, 'style'), 'lnRef')
    const idx = Number(lnRef?.getAttribute('idx') || 0)
    if (!lnRef || idx === 0) return null
    const color = colorOf(lnRef, theme, clrMap)
    if (!color) return null
    return { color, widthPt: 1 }
  }
  const painted = paintColorWithAlpha(ln, theme, clrMap) || paintColorWithAlpha(spPr, theme, clrMap)
  if (!painted) {
    const lnRef = childEl(childEl(sp, 'style'), 'lnRef')
    const fallback = lnRef ? colorOf(lnRef, theme, clrMap) : ''
    if (!fallback) return null
    return { color: fallback, widthPt }
  }
  return {
    color: painted.color,
    widthPt,
    strokeOpacity: painted.opacity < 1 ? painted.opacity : undefined,
  }
}

function xfrmFlip(xfrm: Element) {
  return {
    flipH: xfrm.getAttribute('flipH') === '1',
    flipV: xfrm.getAttribute('flipV') === '1',
  }
}

function xfrmRotDeg(xfrm: Element) {
  const rot = Number(xfrm.getAttribute('rot') || 0)
  if (!rot) return 0
  const deg = rot / 60000
  return Math.abs(deg) < 0.5 ? 0 : deg
}

function shapeFill(sp: Element, theme: ThemeColors, clrMap: ReturnType<typeof defaultClrMap>) {
  return resolveShapeFill(sp, theme, clrMap).fill
}

function textColor(
  sp: Element,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  masterStyles: MasterTextStyles,
) {
  const txBody = childEl(sp, 'txBody')
  const firstParagraph = txBody ? [...txBody.children].find((child) => child.localName === 'p') : undefined
  if (firstParagraph && txBody) {
    const chain = textStyleChain(firstParagraph, txBody, sp, masterStyles)
    const firstRun = [...firstParagraph.children].find((child) => child.localName === 'r')
    const fromRun = rPrColor(childEl(firstRun ?? null, 'rPr'), chain, theme, clrMap, '', sp)
    if (fromRun) return fromRun
    const endPara = firstParagraph.getElementsByTagNameNS(A, 'endParaRPr')[0]
    const fromEnd = rPrColor(endPara ?? null, chain, theme, clrMap, '', sp)
    if (fromEnd) return fromEnd
  }
  const fontRef = childEl(childEl(sp, 'style'), 'fontRef')
  if (fontRef) return paintColor(fontRef, theme, clrMap, sp) || tokenSolidColors.docInk
  return tokenSolidColors.docInk
}

function resolveTarget(basePath: string, target: string) {
  if (target.startsWith('/')) return target.replace(/^\/+/, '')
  const parts = basePath.split('/').slice(0, -1)
  for (const bit of target.split('/')) {
    if (bit === '..') parts.pop()
    else if (bit && bit !== '.') parts.push(bit)
  }
  return parts.join('/')
}

function shapeXfrm(el: Element) {
  for (const child of [...el.children]) {
    if (child.localName === 'xfrm') return child
    if (child.localName === 'spPr') {
      const nested = [...child.children].find((node) => node.localName === 'xfrm')
      if (nested) return nested
    }
  }
  const byNs = el.getElementsByTagNameNS(A, 'xfrm')[0]
  if (byNs) return byNs
  for (const node of [...el.getElementsByTagName('*')]) {
    if (node.localName === 'xfrm') return node
  }
  return null
}

function blipFillOn(host: Element) {
  return childEl(host, 'blipFill') ?? host.getElementsByTagNameNS(A, 'blipFill')[0] ?? null
}

const SRC_RECT_SCALE = 100000

function readSrcRectCrop(blipFill: Element | null) {
  const rect = blipFill ? childEl(blipFill, 'srcRect') : null
  if (!rect) return undefined
  const left = Number(rect.getAttribute('l') || 0) / SRC_RECT_SCALE
  const top = Number(rect.getAttribute('t') || 0) / SRC_RECT_SCALE
  const right = Number(rect.getAttribute('r') || 0) / SRC_RECT_SCALE
  const bottom = Number(rect.getAttribute('b') || 0) / SRC_RECT_SCALE
  if (!left && !top && !right && !bottom) return undefined
  return { left, top, right, bottom }
}

function blipEmbed(node: Element | null) {
  if (!node) return ''
  const blipFill =
    node.localName === 'blipFill' ? node : blipFillOn(node) ?? node.getElementsByTagNameNS(A, 'blipFill')[0]
  if (!blipFill) return ''
  const blip = childEl(blipFill, 'blip') ?? blipFill.getElementsByTagNameNS(A, 'blip')[0]
  if (!blip) return ''
  return blip.getAttributeNS(R, 'embed') || blip.getAttribute('r:embed') || ''
}

/** 图片在 Worker 里已按路径编码成 dataUrl，这里只解析 rels 目标并查表 */
async function readImage(zip: PptxArchivePayload, slidePath: string, embed: string, rels: Map<string, ZipRel>): Promise<string> {
  const target = rels.get(embed)?.target
  if (!target) return ''
  const path = resolveTarget(slidePath, target)
  return zip.media[path] ?? ''
}

async function pushPicture(
  host: Element,
  slide: CwPptSlide,
  space: Space,
  rels: Map<string, ZipRel>,
  zip: PptxArchivePayload,
  slidePath: string,
  slideCx: number,
  slideCy: number,
  embed: string,
  blipFill?: Element | null,
) {
  const xfrm = shapeXfrm(host)
  if (!xfrm || !embed) return
  const frame = frameOfBox(xfrm, space, slideCx, slideCy)
  const dataUrl = await readImage(zip, slidePath, embed, rels)
  if (!dataUrl) return
  const fill = blipFill ?? blipFillOn(host)
  const crop = readSrcRectCrop(fill)
  const z = slide.boxes.length + slide.images.length + (slide.lines?.length ?? 0)
  slide.images.push({ id: createId('image'), ...frame, dataUrl, crop, z })
}

async function pushBackgroundBlip(
  slide: CwPptSlide,
  doc: Document,
  partPath: string,
  rels: Map<string, ZipRel>,
  zip: PptxArchivePayload,
) {
  const bg = doc.getElementsByTagNameNS(P, 'bg')[0]
  const bgPr = bg ? childEl(bg, 'bgPr') : null
  if (!bgPr || childEl(bgPr, 'noFill')) return
  const embed = blipEmbed(bgPr)
  if (!embed) return
  const dataUrl = await readImage(zip, partPath, embed, rels)
  if (!dataUrl) return
  // 须为非负 z：负 z-index 会落到幻灯片容器 background 之下而不可见
  const z = slide.images.length
  slide.images.push({ id: createId('image'), x: 0, y: 0, w: 1, h: 1, dataUrl, z })
}

async function walk(
  container: Element,
  space: Space,
  slide: CwPptSlide,
  rels: Map<string, ZipRel>,
  zip: PptxArchivePayload,
  slidePath: string,
  slideCx: number,
  slideCy: number,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  includePlaceholders: boolean,
  masterStyles: MasterTextStyles,
) {
  for (const child of [...container.children]) {
    if (child.localName === 'AlternateContent') {
      const content =
        [...child.children].find((node) => node.localName === 'Choice') ||
        [...child.children].find((node) => node.localName === 'Fallback')
      if (content) {
        await walk(content, space, slide, rels, zip, slidePath, slideCx, slideCy, theme, clrMap, includePlaceholders, masterStyles)
      }
      continue
    }
    if (child.localName === 'grpSp') {
      const xfrm = shapeXfrm(child)
      await walk(child, xfrm ? enterGroup(space, xfrm) : space, slide, rels, zip, slidePath, slideCx, slideCy, theme, clrMap, includePlaceholders, masterStyles)
      continue
    }
    if (child.localName === 'graphicFrame') {
      const graphicData = child.getElementsByTagNameNS(A, 'graphicData')[0]
      const uri = graphicData?.getAttribute('uri') || ''
      if (graphicData && uri === TABLE_URI) {
        walkTable(child, graphicData, space, slide, slideCx, slideCy, theme, clrMap, masterStyles)
        continue
      }
      const pic = child.getElementsByTagNameNS(PIC, 'pic')[0]
      if (pic) {
        const fill = blipFillOn(pic)
        const embed = blipEmbed(fill)
        await pushPicture(child, slide, space, rels, zip, slidePath, slideCx, slideCy, embed, fill)
      }
      continue
    }
    if (child.localName !== 'sp' && child.localName !== 'pic' && child.localName !== 'cxnSp') continue
    const xfrm = shapeXfrm(child)
    if (!xfrm) continue
    const rawFrame = frameRaw(xfrm, space, slideCx, slideCy)
    const frame = frameOfBox(xfrm, space, slideCx, slideCy)
    const z = slide.boxes.length + slide.images.length + (slide.lines?.length ?? 0)
    if (child.localName === 'sp' || child.localName === 'cxnSp') {
      if (child.localName === 'sp' && !includePlaceholders && isPlaceholder(child)) continue
      const spPr = childEl(child, 'spPr')
      const pictureEmbed = blipEmbed(spPr)
      const text = shapeText(child, theme, clrMap, masterStyles)
      const { fill, fillOpacity } = resolveShapeFill(child, theme, clrMap)
      const stroke: { color: string; widthPt: number; strokeOpacity?: number } | null =
        shapeStroke(child, theme, clrMap) ||
        (isLineLike(child, rawFrame) && !text?.text.trim() ? { color: tokenSolidColors.docInk, widthPt: 1 } : null)
      const custPoly = custGeomPolyline100(spPr)
      if (isConnectorShape(child, Boolean(text?.text.trim()), rawFrame)) {
        const lineStroke = connectorStrokePaint(child, theme, clrMap, stroke, fill, fillOpacity)
        pushConnectorLine(
          slide,
          child,
          xfrm,
          space,
          slideCx,
          slideCy,
          lineStroke,
          z,
          custPoly,
        )
        continue
      }
      if (isLineLike(child, rawFrame) && !text?.text.trim()) {
        if (lineGeomPreset(child) && stroke && isAxisAlignedStrokeBox(rawFrame)) {
          pushAxisAlignedStrokeLine(slide, child, xfrm, space, slideCx, slideCy, stroke, z)
          continue
        }
        const bar = barFillPaint(child, theme, clrMap, fill, fillOpacity, stroke)
        if (bar) {
          pushThinBarBox(slide, frame, bar.fill, bar.fillOpacity, z)
          continue
        }
        if (stroke) {
          const flip = xfrmFlip(xfrm)
          const rot = xfrmRotDeg(xfrm)
          const solid = childEl(spPr ?? null, 'solidFill')
          const solidPaint = solid && spPr && !spPrHasNoFill(spPr)
            ? paintColorWithAlpha(solid, theme, clrMap, child)
            : null
          slide.lines.push({
            id: createId('line'),
            ...frameOfLine(xfrm, space, slideCx, slideCy),
            color: lineGeomPreset(child) ? stroke.color : solidPaint?.color || stroke.color,
            widthPt: stroke.widthPt,
            strokeOpacity: solidPaint?.opacity ?? stroke.strokeOpacity,
            flipH: flip.flipH,
            flipV: flip.flipV,
            rot: rot || undefined,
            z,
          })
          continue
        }
      }
      if (!isLineLike(child, rawFrame) && isThinBar(rawFrame) && !text?.text.trim()) {
        const bar = barFillPaint(child, theme, clrMap, fill, fillOpacity, stroke)
        if (bar) {
          pushThinBarBox(slide, frame, bar.fill, bar.fillOpacity, z)
          continue
        }
      }
      if (pictureEmbed && !text?.text.trim()) {
        const dataUrl = await readImage(zip, slidePath, pictureEmbed, rels)
        if (dataUrl) {
          const fill = blipFillOn(spPr ?? child)
          slide.images.push({
            id: createId('image'),
            ...frame,
            dataUrl,
            crop: readSrcRectCrop(fill),
            z,
          })
        }
        continue
      }
      const outlinePreset = presetName(child)
      const outlineGeom =
        outlinePreset === 'rect' ||
        outlinePreset === 'ellipse' ||
        outlinePreset === 'roundRect' ||
        outlinePreset === 'hexagon'
      if (
        !text?.text.trim() &&
        !fill &&
        stroke &&
        spPr &&
        spPrHasNoFill(spPr) &&
        outlineGeom &&
        !isLineLike(child, rawFrame) &&
        !isThinBar(rawFrame)
      ) {
        const ln = childEl(spPr, 'ln')
        const outlineRot = xfrmRotDeg(xfrm)
        slide.boxes.push({
          id: createId('box'),
          ...frame,
          text: '',
          fontSize: 18,
          color: tokenSolidColors.docInk,
          fill: '',
          ...boxGeomFromSp(child),
          borderColor: stroke.color,
          borderWidthPt: stroke.widthPt,
          borderOpacity: stroke.strokeOpacity,
          borderDash: lnDashStyle(ln),
          align: 'left',
          rot: outlineRot || undefined,
          z,
        })
        continue
      }
      if (!text?.text.trim() && !fill) continue
      const bodyMeta = readTextBodyMeta(child, slideCx, slideCy)
      const shapeRot = xfrmRotDeg(xfrm)
      slide.boxes.push({
        id: createId('box'),
        ...frame,
        text: text?.text || '',
        fontSize: text?.fontSize || 18,
        color: text?.paragraphs?.[0]?.color || textColor(child, theme, clrMap, masterStyles),
        fill,
        fillOpacity,
        ...boxGeomFromSp(child),
        ...shapeBorderFields(child, theme, clrMap, stroke),
        align: text?.paragraphs?.[0]?.align || textAlign(child),
        textFit: bodyMeta.textFit,
        padding: bodyMeta.padding,
        vAnchor: bodyMeta.vAnchor,
        paragraphs: text?.paragraphs,
        bold: text?.paragraphs?.[0]?.bold,
        fontFamily: text?.paragraphs?.[0]?.fontFamily,
        rot: shapeRot || undefined,
        z,
      })
    } else {
      const fill = blipFillOn(child)
      const embed = blipEmbed(fill)
      await pushPicture(child, slide, space, rels, zip, slidePath, slideCx, slideCy, embed, fill)
    }
  }
}

export async function parsePptx(buffer: ArrayBuffer): Promise<CwPptDeck> {
  // 解压（pako）+ 图片 base64 都在 Worker 里完成，主线程只做 XML 解析和建 deck
  const zip = await loadPptxArchive(buffer)
  const presentation = zip.text['ppt/presentation.xml']
  const presRelsXml = zip.text['ppt/_rels/presentation.xml.rels']
  if (!presentation || !presRelsXml) throw new Error('pptx')
  const pres = parseXml(presentation)
  const presRels = readRels(presRelsXml)
  const theme = await loadTheme(zip)
  const size = pres.getElementsByTagNameNS(P, 'sldSz')[0]
  const slideCx = Number(size?.getAttribute('cx') || EMU_CX)
  const slideCy = Number(size?.getAttribute('cy') || EMU_CY)
  const slides: CwPptSlide[] = []
  const slideIds = [...pres.getElementsByTagNameNS(P, 'sldId')]
  const space = { x: 0, y: 0, sx: 1, sy: 1 }
  const presentationDefLevels = readPresentationTextStyles(pres)
  for (const [index, slideId] of slideIds.entries()) {
    const relId = slideId.getAttributeNS(R, 'id') || slideId.getAttribute('r:id') || ''
    const target = presRels.get(relId)?.target
    if (!target) continue
    const slidePath = resolveTarget('ppt/presentation.xml', target)
    const xml = zip.text[slidePath]
    if (!xml) continue
    const relsXml = zip.text[slidePath.replace(/([^/]+)$/, '_rels/$1.rels')]
    const rels = relsXml ? readRels(relsXml) : new Map<string, ZipRel>()
    const doc = parseXml(xml)
    const cSld = doc.getElementsByTagNameNS(P, 'cSld')[0]
    const slide: CwPptSlide = {
      name: cSld?.getAttribute('name') || `幻灯片 ${index + 1}`,
      background: tokenSolidColors.white,
      boxes: [],
      images: [],
      lines: [],
    }
    const showLayout = doc.documentElement.getAttribute('showMasterSp') !== '0'
    const layoutTarget = relByType(rels, 'slideLayout')
    const layoutPath = layoutTarget ? resolveTarget(slidePath, layoutTarget) : ''
    const layoutXml = layoutPath ? zip.text[layoutPath] : ''
    const layoutDoc = layoutXml ? parseXml(layoutXml) : null
    const layoutRelsXml = layoutPath ? zip.text[layoutPath.replace(/([^/]+)$/, '_rels/$1.rels')] : ''
    const layoutRels = layoutRelsXml ? readRels(layoutRelsXml) : new Map<string, ZipRel>()
    const masterTarget = relByType(layoutRels, 'slideMaster')
    const masterPath = masterTarget && layoutPath ? resolveTarget(layoutPath, masterTarget) : ''
    const masterXml = masterPath ? zip.text[masterPath] : ''
    const masterDoc = masterXml ? parseXml(masterXml) : null
    const showMaster = showLayout && layoutDoc?.documentElement.getAttribute('showMasterSp') !== '0'
    const masterStyles = readMasterTextStyles(masterDoc)
    masterStyles.presentation = presentationDefLevels
    let clrMap = masterDoc ? readClrMap(masterDoc) : defaultClrMap()
    clrMap = readClrOverride(doc, clrMap)
    if (masterDoc) slide.background = readBackground(masterDoc, theme, clrMap, slide.background)
    if (layoutDoc) slide.background = readBackground(layoutDoc, theme, clrMap, slide.background)
    slide.background = readBackground(doc, theme, clrMap, slide.background)
    let masterRels = new Map<string, ZipRel>()
    if (showMaster && masterDoc && masterPath) {
      const masterRelsXml = zip.text[masterPath.replace(/([^/]+)$/, '_rels/$1.rels')]
      masterRels = masterRelsXml ? readRels(masterRelsXml) : new Map<string, ZipRel>()
      await pushBackgroundBlip(slide, masterDoc, masterPath, masterRels, zip)
    }
    if (showLayout && layoutDoc && layoutPath) {
      await pushBackgroundBlip(slide, layoutDoc, layoutPath, layoutRels, zip)
    }
    await pushBackgroundBlip(slide, doc, slidePath, rels, zip)
    if (showMaster && masterDoc && masterPath) {
      const masterTree = masterDoc.getElementsByTagNameNS(P, 'spTree')[0]
      if (masterTree) await walk(masterTree, space, slide, masterRels, zip, masterPath, slideCx, slideCy, theme, clrMap, false, masterStyles)
    }
    if (showLayout && layoutDoc && layoutPath) {
      const layoutTree = layoutDoc.getElementsByTagNameNS(P, 'spTree')[0]
      if (layoutTree) await walk(layoutTree, space, slide, layoutRels, zip, layoutPath, slideCx, slideCy, theme, clrMap, false, masterStyles)
    }
    const spTree = doc.getElementsByTagNameNS(P, 'spTree')[0]
    if (spTree) await walk(spTree, space, slide, rels, zip, slidePath, slideCx, slideCy, theme, clrMap, true, masterStyles)
    normalizeSlideStacking(slide)
    slides.push(slide)
  }
  const sizePt = slideSizePt(slideCx, slideCy)
  const fonts = await readEmbeddedFonts(zip, pres, presRels, collectUsedFontFamilies(slides))
  const result: CwPptDeck = {
    width: sizePt.width,
    height: sizePt.height,
    slideCx,
    slideCy,
    slides: slides.length ? slides : [blankSlide(1)],
    fonts: fonts.length ? fonts : undefined,
  }
  logDeckFontUsage(result)
  return result
}

/** 诊断日志：列出文稿中实际会应用到 CSS 的字体栈及出现次数 */
function logDeckFontUsage(deck: CwPptDeck) {
  const usage = new Map<string, number>()
  const bump = (value?: string) => {
    if (!value) return
    usage.set(value, (usage.get(value) ?? 0) + 1)
  }
  for (const slide of deck.slides) {
    for (const box of slide.boxes) {
      bump(box.fontFamily)
      for (const para of box.paragraphs ?? []) {
        bump(para.fontFamily)
        for (const run of para.runs ?? []) bump(run.fontFamily)
      }
    }
  }
  const rows = [...usage.entries()].sort((a, b) => b[1] - a[1]).map(([stack, count]) => `${count}× ${stack}`)
  console.log(`[CwPptEditor] 文稿共 ${deck.slides.length} 页，实际用到的字体栈：\n  ${rows.join('\n  ')}`)
}

function dataUrlBytes(dataUrl: string) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl)
  if (!match) return null
  const mime = match[1] || ''
  const ext = mime.includes('png') ? 'png' : 'jpeg'
  const binary = atob(match[2] || '')
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return { bytes, ext, mime }
}

function placeOnSlide(origin: number, span: number, size: number) {
  const start = Math.min(size - 1, Math.max(0, Math.round(origin * size)))
  const length = Math.min(size - start, Math.max(1, Math.round(span * size)))
  return { start, length }
}

function textBody(box: CwPptBox) {
  const size = Math.max(100, Math.round(box.fontSize * 100))
  const color = (box.color || tokenSolidColors.docInk).replace('#', '')
  const align = box.align === 'center' ? 'ctr' : box.align === 'right' ? 'r' : 'l'
  const paragraphs = (box.text || '').split('\n').map((line) => {
    if (!line) return `<a:p><a:pPr algn="${align}"/></a:p>`
    const boldTag = box.bold ? '<a:b/>' : ''
    return `<a:p><a:pPr algn="${align}"/><a:r><a:rPr lang="zh-CN" sz="${size}" dirty="0"><a:solidFill><a:srgbClr val="${color}"/></a:solidFill>${boldTag}<a:latin typeface="Microsoft YaHei"/><a:ea typeface="Microsoft YaHei"/></a:rPr><a:t>${escapeXml(line)}</a:t></a:r></a:p>`
  })
  return `<p:txBody><a:bodyPr wrap="square" lIns="0" tIns="0" rIns="0" bIns="0" rtlCol="0" anchor="t"><a:normAutofit/></a:bodyPr><a:lstStyle/>${paragraphs.join('') || `<a:p><a:pPr algn="${align}"/></a:p>`}</p:txBody>`
}

function shapeXml(box: CwPptBox, id: number, slideCx: number, slideCy: number) {
  const x = placeOnSlide(box.x, box.w, slideCx)
  const y = placeOnSlide(box.y, box.h, slideCy)
  const fillHex = box.fill.replace('#', '')
  const alpha =
    box.fillOpacity !== undefined && box.fillOpacity < 0.999
      ? `<a:alpha val="${Math.max(0, Math.min(100000, Math.round(box.fillOpacity * 100000)))}"/>`
      : ''
  const fill = box.fill
    ? `<a:solidFill><a:srgbClr val="${fillHex}">${alpha}</a:srgbClr></a:solidFill>`
    : '<a:noFill/>'
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="文本 ${id}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x.start}" y="${y.start}"/><a:ext cx="${x.length}" cy="${y.length}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom>${fill}</p:spPr>${textBody(box)}</p:sp>`
}

function lineXml(line: CwPptLine, id: number, slideCx: number, slideCy: number) {
  const x = placeOnSlide(line.x, line.w, slideCx)
  const y = placeOnSlide(line.y, line.h, slideCy)
  const color = (line.color || tokenSolidColors.docInk).replace('#', '')
  const width = Math.max(1270, Math.round((line.widthPt || 1) * 12700))
  const flipH = line.flipH ? ' flipH="1"' : ''
  const flipV = line.flipV ? ' flipV="1"' : ''
  const rot = line.rot ? ` rot="${Math.round(line.rot * 60000)}"` : ''
  return `<p:cxnSp><p:nvCxnSpPr><p:cNvPr id="${id}" name="线条 ${id}"/><p:cNvCxnSpPr/><p:nvPr/></p:nvCxnSpPr><p:spPr><a:xfrm${flipH}${flipV}${rot}><a:off x="${x.start}" y="${y.start}"/><a:ext cx="${x.length}" cy="${y.length}"/></a:xfrm><a:prstGeom prst="line"><a:avLst/></a:prstGeom><a:ln w="${width}"><a:solidFill><a:srgbClr val="${color}"/></a:solidFill></a:ln></p:spPr></p:cxnSp>`
}

function pictureXml(image: CwPptImage, id: number, relId: string, slideCx: number, slideCy: number) {
  const x = placeOnSlide(image.x, image.w, slideCx)
  const y = placeOnSlide(image.y, image.h, slideCy)
  return `<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="图片 ${id}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="${x.start}" y="${y.start}"/><a:ext cx="${x.length}" cy="${y.length}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`
}

const themeXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office">
  <a:themeElements>
    <a:clrScheme name="Office">
      <a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>
      <a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>
      <a:dk2><a:srgbClr val="1F4E79"/></a:dk2>
      <a:lt2><a:srgbClr val="E7F2E4"/></a:lt2>
      <a:accent1><a:srgbClr val="2B9A4B"/></a:accent1>
      <a:accent2><a:srgbClr val="5B9BD5"/></a:accent2>
      <a:accent3><a:srgbClr val="ED7D31"/></a:accent3>
      <a:accent4><a:srgbClr val="A5A5A5"/></a:accent4>
      <a:accent5><a:srgbClr val="FFC000"/></a:accent5>
      <a:accent6><a:srgbClr val="4472C4"/></a:accent6>
      <a:hlink><a:srgbClr val="0563C1"/></a:hlink>
      <a:folHlink><a:srgbClr val="954F72"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Office">
      <a:majorFont><a:latin typeface="Microsoft YaHei"/><a:ea typeface="Microsoft YaHei"/><a:cs typeface=""/></a:majorFont>
      <a:minorFont><a:latin typeface="Microsoft YaHei"/><a:ea typeface="Microsoft YaHei"/><a:cs typeface=""/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Office">
      <a:fillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
      </a:fillStyleLst>
      <a:lnStyleLst>
        <a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
        <a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
        <a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
      </a:lnStyleLst>
      <a:effectStyleLst>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
        <a:effectStyle><a:effectLst/></a:effectStyle>
      </a:effectStyleLst>
      <a:bgFillStyleLst>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
        <a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
      </a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
  <a:objectDefaults/>
  <a:extraClrSchemeLst/>
</a:theme>`

function groupTree(cx: number, cy: number) {
  return `<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/><a:chOff x="0" y="0"/><a:chExt cx="${cx}" cy="${cy}"/></a:xfrm></p:grpSpPr>`
}

function slideXml(name: string, body: string, background: string, cx: number, cy: number) {
  const hex = (background || tokenSolidColors.white).replace('#', '')
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="${A}" xmlns:r="${R}" xmlns:p="${P}"><p:cSld name="${escapeXml(name)}"><p:bg><p:bgPr><a:solidFill><a:srgbClr val="${hex}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree>${groupTree(cx, cy)}${body}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`
}

export async function deckToArrayBuffer(deck: CwPptDeck): Promise<ArrayBuffer> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const slideCx = deck.slideCx || EMU_CX
  const slideCy = deck.slideCy || EMU_CY
  const slides = deck.slides.length ? deck.slides : [blankSlide(1)]
  const contentTypes = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
    '<Default Extension="xml" ContentType="application/xml"/>',
    '<Default Extension="png" ContentType="image/png"/>',
    '<Default Extension="jpeg" ContentType="image/jpeg"/>',
    '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>',
    '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>',
    '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>',
    '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>',
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
    '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>',
  ]
  const presRels = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    `<Relationships xmlns="${RELS}">`,
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>',
  ]
  const slideIds: string[] = []
  let mediaIndex = 1

  for (const [index, slide] of slides.entries()) {
    const slideNo = index + 1
    const relId = `rId${index + 2}`
    contentTypes.push(`<Override PartName="/ppt/slides/slide${slideNo}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`)
    presRels.push(`<Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${slideNo}.xml"/>`)
    slideIds.push(`<p:sldId id="${256 + index}" r:id="${relId}"/>`)
    const rels = [
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
      `<Relationships xmlns="${RELS}">`,
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>',
    ]
    let shapeId = 2
    const parts: string[] = []
    for (const image of slide.images) {
      const file = dataUrlBytes(image.dataUrl)
      if (!file) continue
      const mediaName = `image${mediaIndex}.${file.ext}`
      mediaIndex += 1
      zip.file(`ppt/media/${mediaName}`, file.bytes)
      const imageRel = `rId${rels.length - 1}`
      rels.push(`<Relationship Id="${imageRel}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${mediaName}"/>`)
      parts.push(pictureXml(image, shapeId, imageRel, slideCx, slideCy))
      shapeId += 1
    }
    for (const line of slide.lines ?? []) {
      parts.push(lineXml(line, shapeId, slideCx, slideCy))
      shapeId += 1
    }
    for (const box of slide.boxes) {
      parts.push(shapeXml(box, shapeId, slideCx, slideCy))
      shapeId += 1
    }
    rels.push('</Relationships>')
    zip.file(`ppt/slides/slide${slideNo}.xml`, slideXml(slide.name, parts.join(''), slide.background, slideCx, slideCy))
    zip.file(`ppt/slides/_rels/slide${slideNo}.xml.rels`, rels.join(''))
  }

  presRels.push('</Relationships>')
  contentTypes.push('</Types>')
  zip.file('[Content_Types].xml', contentTypes.join(''))
  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${RELS}"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`)
  zip.file('docProps/core.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>演示文稿</dc:title></cp:coreProperties>')
  zip.file('docProps/app.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>CwPptEditor</Application></Properties>')
  zip.file('ppt/_rels/presentation.xml.rels', presRels.join(''))
  zip.file('ppt/presentation.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="${A}" xmlns:r="${R}" xmlns:p="${P}"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${slideIds.join('')}</p:sldIdLst><p:sldSz cx="${slideCx}" cy="${slideCy}"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`)
  zip.file('ppt/theme/theme1.xml', themeXml)
  zip.file('ppt/slideMasters/slideMaster1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="${A}" xmlns:r="${R}" xmlns:p="${P}"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree>${groupTree(slideCx, slideCy)}</p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>`)
  zip.file('ppt/slideMasters/_rels/slideMaster1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${RELS}"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`)
  zip.file('ppt/slideLayouts/slideLayout1.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="${A}" xmlns:r="${R}" xmlns:p="${P}" type="blank" preserve="1"><p:cSld name="空白"><p:spTree>${groupTree(slideCx, slideCy)}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`)
  zip.file('ppt/slideLayouts/_rels/slideLayout1.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${RELS}"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`)

  return zip.generateAsync({ type: 'arraybuffer' })
}
