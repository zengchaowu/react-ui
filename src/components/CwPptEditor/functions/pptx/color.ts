import type { PptxArchivePayload } from '../archiveEntries'
import { A, P, EMPTY_MASTER_STYLES, type MasterTextStyles, type ThemeColors, type ThemeFonts } from './shared'
import { childEl, parseXml, spPrHasNoFill } from './xml'

export function resolvePhClr(sp: Element | null, theme: ThemeColors, clrMap: ReturnType<typeof defaultClrMap>): string {
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

export function defaultClrMap() {
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

export function clampByte(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

export function hexToRgb(hex: string) {
  const value = hex.replace('#', '').padStart(6, '0').slice(0, 6)
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)]
}

export function rgbToHex(r: number, g: number, b: number) {
  return [r, g, b].map((channel) => clampByte(channel).toString(16).padStart(2, '0')).join('').toUpperCase()
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
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

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
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

export function applyColorMods(hex: string, node: Element) {
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

export function readClrMap(doc: Document) {
  const map = defaultClrMap()
  const node = doc.getElementsByTagNameNS(P, 'clrMap')[0]
  if (!node) return map
  for (const key of Object.keys(map)) {
    const value = node.getAttribute(key)
    if (value) map[key as keyof typeof map] = value
  }
  return map
}

export function readClrOverride(doc: Document, base: ReturnType<typeof defaultClrMap>) {
  const override = doc.getElementsByTagNameNS(A, 'overrideClrMapping')[0]
  if (!override) return base
  const next = { ...base }
  for (const key of Object.keys(next)) {
    const value = override.getAttribute(key)
    if (value) next[key as keyof typeof next] = value
  }
  return next
}

export function resolveScheme(value: string, theme: ThemeColors, clrMap: ReturnType<typeof defaultClrMap>) {
  const mapped = clrMap[value as keyof typeof clrMap] || value
  return theme.colors[mapped] || theme.colors[value] || '000000'
}

export function colorAlpha(node: Element) {
  const alpha = childEl(node, 'alpha')
  if (!alpha) return 1
  const val = Number(alpha.getAttribute('val') || 100000)
  if (val <= 0) return 0
  return Math.min(1, val / 100000)
}

export function colorOf(
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

export function paintColorWithAlpha(
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

export function resolveShapeFill(sp: Element, theme: ThemeColors, clrMap: ReturnType<typeof defaultClrMap>) {
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

export function gradientColor(
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

export function paintColor(
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

export function readBackground(doc: Document, theme: ThemeColors, clrMap: ReturnType<typeof defaultClrMap>, fallback: string) {
  const bg = doc.getElementsByTagNameNS(P, 'bg')[0]
  if (!bg) return fallback
  const bgPr = childEl(bg, 'bgPr')
  if (bgPr) {
    if (childEl(bgPr, 'noFill')) return fallback
    return paintColor(bgPr, theme, clrMap) || fallback
  }
  return paintColor(childEl(bg, 'bgRef'), theme, clrMap) || fallback
}

export function defaultThemeFonts(): ThemeFonts {
  return {
    majorLatin: 'Calibri Light',
    majorEa: 'Microsoft YaHei',
    minorLatin: 'Calibri',
    minorEa: 'Microsoft YaHei',
  }
}

export function readThemeFonts(doc: Document): ThemeFonts {
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

export function resolveThemeTypeface(token: string, fonts: ThemeFonts) {
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

export function readStyleLevels(styleEl: Element | undefined) {
  if (!styleEl) return []
  const levels: (Element | null)[] = []
  for (let lvl = 1; lvl <= 9; lvl += 1) {
    const lvlPr = childEl(styleEl, `lvl${lvl}pPr`)
    levels.push(lvlPr ? childEl(lvlPr, 'defRPr') : null)
  }
  return levels
}

export function readMasterTextStyles(masterDoc: Document | null): MasterTextStyles {
  if (!masterDoc) return EMPTY_MASTER_STYLES
  return {
    title: readStyleLevels(masterDoc.getElementsByTagNameNS(P, 'titleStyle')[0]),
    body: readStyleLevels(masterDoc.getElementsByTagNameNS(P, 'bodyStyle')[0]),
    other: readStyleLevels(masterDoc.getElementsByTagNameNS(P, 'otherStyle')[0]),
    presentation: [],
  }
}

export function readPresentationTextStyles(presDoc: Document): (Element | null)[] {
  const styleEl = presDoc.getElementsByTagNameNS(P, 'defaultTextStyle')[0]
  return readStyleLevels(styleEl)
}

export function placeholderDefRPr(sp: Element | null, masterStyles: MasterTextStyles) {
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

export function fillRefThemePaint(
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

export async function loadTheme(zip: PptxArchivePayload): Promise<ThemeColors> {
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

