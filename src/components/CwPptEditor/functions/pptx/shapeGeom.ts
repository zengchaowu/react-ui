import { hexagonPoints100, roundRectRadiusPercent, rtTrianglePoints100 } from '../presetGeometry'
import { childEl } from './xml'

export function presetName(sp: Element) {
  const spPr = childEl(sp, 'spPr')
  const geom = spPr ? childEl(spPr, 'prstGeom') || childEl(spPr, 'custGeom') : null
  return geom?.getAttribute('prst') || ''
}

export function roundRectCornerRadius(sp: Element) {
  const spPr = childEl(sp, 'spPr')
  const geom = spPr ? childEl(spPr, 'prstGeom') : null
  if (geom?.getAttribute('prst') !== 'roundRect') return undefined
  return roundRectRadiusPercent(readPrstGeomAdjust(sp))
}

export function lnDashStyle(ln: Element | null): 'solid' | 'dashed' | 'dotted' {
  const prstDash = ln ? childEl(ln, 'prstDash') : null
  const val = prstDash?.getAttribute('val') || 'solid'
  if (val === 'sysDot' || val === 'dot') return 'dotted'
  if (/dash/i.test(val)) return 'dashed'
  return 'solid'
}

export function boxGeomFromSp(sp: Element) {
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

export function lineGeomPreset(sp: Element) {
  const prst = presetName(sp)
  return Boolean(prst && /^line/i.test(prst))
}

export function readPrstGeomAdjust(sp: Element) {
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

export function xfrmFlip(xfrm: Element) {
  return {
    flipH: xfrm.getAttribute('flipH') === '1',
    flipV: xfrm.getAttribute('flipV') === '1',
  }
}

export function xfrmRotDeg(xfrm: Element) {
  const rot = Number(xfrm.getAttribute('rot') || 0)
  if (!rot) return 0
  const deg = rot / 60000
  return Math.abs(deg) < 0.5 ? 0 : deg
}
