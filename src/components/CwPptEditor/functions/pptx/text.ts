import type {
  CwPptAlign,
  CwPptTextFit,
  CwPptTextPadding,
  CwPptTextParagraph,
  CwPptTextRun,
} from '../../types'
import { tokenSolidColors } from '../../../../assets/tokens/tokenSolidColors'
import { A, PPT_FONT_FALLBACK, type MasterTextStyles, type ThemeColors, type ThemeFonts } from './shared'
import { childEl } from './xml'
import { paintColor, placeholderDefRPr, resolvePhClr, resolveThemeTypeface } from './color'
import type { defaultClrMap } from './color'

export function symChar(sym: Element) {
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

export function runPlainText(run: Element) {
  const parts: string[] = []
  for (const child of [...run.children]) {
    if (child.localName === 't') parts.push(child.textContent || '')
    else if (child.localName === 'sym') parts.push(symChar(child))
  }
  return parts.join('')
}

export function fldPlainText(fld: Element) {
  const parts: string[] = []
  for (const child of [...fld.children]) {
    if (child.localName === 'r') parts.push(runPlainText(child))
    else if (child.localName === 't') parts.push(child.textContent || '')
    else if (child.localName === 'sym') parts.push(symChar(child))
    else if (child.localName === 'fld') parts.push(fldPlainText(child))
  }
  return parts.join('')
}

export function extractDeepText(container: Element) {
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

export function paragraphPlainText(paragraph: Element) {
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

export function shapeFontSize(txBody: Element) {
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

export function mapAlgn(algn: string | null | undefined): CwPptAlign | undefined {
  if (!algn) return undefined
  if (algn === 'ctr' || algn === 'center') return 'center'
  if (algn === 'r' || algn === 'right') return 'right'
  if (algn === 'l' || algn === 'left') return 'left'
  if (algn === 'just') return 'left'
  return undefined
}

export function lstStyleAlignForParagraph(paragraph: Element, txBody: Element) {
  const lst = childEl(txBody, 'lstStyle')
  if (!lst) return undefined
  const lvlAttr = childEl(paragraph, 'pPr')?.getAttribute('lvl')
  const lvlNum = Math.max(1, Number(lvlAttr || 1))
  const lvlPr =
    [...lst.children].find((node) => node.localName === `lvl${lvlNum}pPr`) ||
    childEl(lst, 'lvl1pPr')
  return mapAlgn(lvlPr?.getAttribute('algn'))
}

export function paragraphAlign(
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

export function paragraphLineHeight(paragraph: Element) {
  const lnSpc = childEl(childEl(paragraph, 'pPr'), 'lnSpc')
  const pct = lnSpc ? childEl(lnSpc, 'spcPct') : null
  if (pct) {
    const val = Number(pct.getAttribute('val') || 100000)
    if (val > 0) return val / 100000
  }
  return undefined
}

export function isBoldRPr(rPr: Element | null | undefined) {
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

export function readTypefaceName(rPr: Element | null, fonts: ThemeFonts) {
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
export const FONT_ALIASES: Record<string, string> = {
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

export function cssFontFamily(name: string) {
  const clean = name.replace(/["']/g, '').trim()
  if (!clean) return PPT_FONT_FALLBACK
  const alias = FONT_ALIASES[clean]
  // 精确名放栈首：系统已装该字体或已注册内嵌字体（FontFace）时优先命中
  if (alias) return `"${clean}", ${alias}`
  return `"${clean}", ${PPT_FONT_FALLBACK}`
}

export function fontMetaFromRPr(
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

export function lstLevelDefRPr(txBody: Element, paragraph: Element) {
  const lstStyle = childEl(txBody, 'lstStyle')
  if (!lstStyle) return null
  const lvl = Number(childEl(paragraph, 'pPr')?.getAttribute('lvl') || 0)
  const lvlPr = childEl(lstStyle, `lvl${lvl + 1}pPr`)
  return lvlPr ? childEl(lvlPr, 'defRPr') : null
}

export function presentationLevelDefRPr(masterStyles: MasterTextStyles, paragraph: Element) {
  const lvl = Number(childEl(paragraph, 'pPr')?.getAttribute('lvl') || 0)
  return masterStyles.presentation[lvl] ?? masterStyles.presentation[0] ?? null
}

export function textStyleChain(
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

export function rPrColor(
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

export function runStyleFromRPr(
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

export function paragraphRuns(
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

export function shapeParagraphsFromTxBody(
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

export function shapeParagraphs(
  sp: Element,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  masterStyles: MasterTextStyles,
): CwPptTextParagraph[] {
  const txBody = childEl(sp, 'txBody')
  if (!txBody) return []
  return shapeParagraphsFromTxBody(txBody, theme, clrMap, masterStyles, sp, textColor(sp, theme, clrMap, masterStyles))
}

export function readTextBodyMeta(sp: Element, slideCx: number, slideCy: number) {
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

export function shapeText(
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

export function textAlign(sp: Element): CwPptAlign {
  const algn = sp.getElementsByTagNameNS(A, 'pPr')[0]?.getAttribute('algn')
  if (algn === 'ctr' || algn === 'center') return 'center'
  if (algn === 'r' || algn === 'right') return 'right'
  return 'left'
}

export function textColor(
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
