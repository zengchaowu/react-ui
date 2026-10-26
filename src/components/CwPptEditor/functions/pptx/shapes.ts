import type { CwPptBox, CwPptSlide } from '../../types'
import { tokenSolidColors } from '../../../../assets/tokens/tokenSolidColors'
import {
  axisAlignedLinePolyline100,
  connectorPolyline100,
  custGeomPolyline100,
  isAxisAlignedStrokeBox,
  isConnectorPreset,
  linePresetInBox,
  linePresetPolyline100,
} from '../connectorGeometry'
import { EMU_PER_PT, P, type Space, type ThemeColors } from './shared'
import { colorOf, paintColor, paintColorWithAlpha, resolveShapeFill } from './color'
import type { defaultClrMap } from './color'
import { childEl, spPrHasNoFill } from './xml'
import { frameOfBox, frameOfLine, frameRaw } from './geometry'
import {
  boxGeomFromSp,
  lnDashStyle,
  lineGeomPreset,
  presetName,
  readPrstGeomAdjust,
  xfrmFlip,
  xfrmRotDeg,
} from './shapeGeom'
import { createId } from './model'

export function lnHasVisiblePaint(
  ln: Element | null,
  theme: ThemeColors,
  clrMap: ReturnType<typeof defaultClrMap>,
  sp: Element,
) {
  if (!ln || childEl(ln, 'noFill')) return false
  return Boolean(paintColorWithAlpha(ln, theme, clrMap, sp) || paintColor(ln, theme, clrMap, sp))
}

export function shapeBorderFields(
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
export function isAccentBarBox(box: CwPptBox) {
  if (box.text.trim() || !box.fill || box.borderColor) return false
  const aspect = box.h / Math.max(box.w, 1e-6)
  return aspect > 0.002 && aspect < 0.14
}

export function dedupeIdenticalBoxes(slide: CwPptSlide) {
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

export function normalizeSlideStacking(slide: CwPptSlide) {
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

export function isLineLike(sp: Element, raw: { w: number; h: number }) {
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
export function isThinBar(raw: { w: number; h: number }) {
  const w = Math.abs(raw.w)
  const h = Math.abs(raw.h)
  const minDim = Math.min(w, h)
  const maxDim = Math.max(w, h)
  if (maxDim < 0.02) return false
  if (minDim < 0.0005) return true
  return minDim / maxDim < 0.12
}

export function pushThinBarBox(
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

export function isConnectorShape(sp: Element, hasText: boolean, rawFrame: { w: number; h: number }) {
  if (hasText) return false
  if (sp.localName === 'cxnSp') return true
  const prst = presetName(sp)
  if (prst && linePresetInBox(rawFrame, prst)) return true
  if (prst && isConnectorPreset(prst)) return true
  const spPr = childEl(sp, 'spPr')
  return Boolean(custGeomPolyline100(spPr))
}

export function connectorStrokePaint(
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

export function pushAxisAlignedStrokeLine(
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

export function pushConnectorLine(
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
export function barFillPaint(
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

export function shapeStroke(sp: Element, theme: ThemeColors, clrMap: ReturnType<typeof defaultClrMap>) {
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

export function shapeFill(sp: Element, theme: ThemeColors, clrMap: ReturnType<typeof defaultClrMap>) {
  return resolveShapeFill(sp, theme, clrMap).fill
}

export function isPlaceholder(sp: Element) {
  return [...sp.getElementsByTagNameNS(P, 'nvPr')].some((nvPr) => [...nvPr.children].some((child) => child.localName === 'ph'))
}
