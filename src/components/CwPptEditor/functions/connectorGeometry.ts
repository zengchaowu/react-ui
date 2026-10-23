/** OOXML 连接线预设 → viewBox 0–100 内的折线点（已应用 flipH/flipV） */

const CONNECTOR_RE = /^(straightConnector\d*|bentConnector\d*|curvedConnector\d*)$/i

export function isConnectorPreset(preset: string | undefined) {
  if (!preset) return false
  if (CONNECTOR_RE.test(preset)) return true
  return /connector/i.test(preset)
}

/** 横/竖 prst line（cy 或 cx 为 0 的细条），用描边而非色块填充 */
export function isAxisAlignedStrokeBox(raw: { w: number; h: number }) {
  const w = Math.abs(raw.w)
  const h = Math.abs(raw.h)
  if (w < 1e-8 && h < 1e-8) return false
  const minDim = Math.min(w, h)
  const maxDim = Math.max(w, h)
  if (minDim < 1e-7) return true
  return minDim / maxDim < 0.015
}

export function axisAlignedLinePolyline100(
  raw: { w: number; h: number },
  flipH: boolean,
  flipV: boolean,
): { x: number; y: number }[] {
  const w = 100
  const h = 100
  const horizontal = Math.abs(raw.h) <= Math.abs(raw.w) * 0.02
  const flat = horizontal ? [0, 50, w, 50] : [50, 0, 50, h]
  const flipped = applyFlip(flat, w, h, flipH, flipV)
  const points: { x: number; y: number }[] = []
  for (let i = 0; i < flipped.length; i += 2) {
    points.push({ x: flipped[i]!, y: flipped[i + 1]! })
  }
  return points
}

/** WPS 肘形线：prst line / lineInv，包围盒两维都非零（非横向细条） */
export function linePresetInBox(raw: { w: number; h: number }, preset: string) {
  if (!preset || !/^line/i.test(preset)) return false
  const w = Math.abs(raw.w)
  const h = Math.abs(raw.h)
  if (w < 1e-6 || h < 1e-6) return false
  const minDim = Math.min(w, h)
  const maxDim = Math.max(w, h)
  if (minDim < 0.004 && maxDim / minDim > 8) return false
  return true
}

/**
 * ECMA-376 / WPS / PowerPoint 预设描边路径（presetShapeDefinitions）：
 * - line：包围盒内左上 → 右下
 * - lineInv：左下 → 右上
 * 细长高框里看起来像「竖线+拐弯」，其实是多段形状拼出来的对角线，不是 bentConnector。
 */
function ooxmlLineStroke100(preset: string) {
  const w = 100
  const h = 100
  return /^lineInv/i.test(preset) ? [0, h, w, 0] : [0, 0, w, h]
}

/** prst line / lineInv 且包围盒两维非零：单段对角线 + xfrm 翻转 */
export function linePresetPolyline100(
  preset: string,
  flipH: boolean,
  flipV: boolean,
  _raw?: { x: number; y: number; w: number; h: number },
) {
  const w = 100
  const h = 100
  const flat = ooxmlLineStroke100(preset)
  const flipped = applyFlip(flat, w, h, flipH, flipV)
  const points: { x: number; y: number }[] = []
  for (let i = 0; i < flipped.length; i += 2) {
    points.push({ x: flipped[i]!, y: flipped[i + 1]! })
  }
  return points
}

function pathPointTo100(pt: Element, pathW: number, pathH: number) {
  const x = Number(pt.getAttribute('x') || 0)
  const y = Number(pt.getAttribute('y') || 0)
  return {
    x: pathW > 0 ? (x / pathW) * 100 : 0,
    y: pathH > 0 ? (y / pathH) * 100 : 0,
  }
}

/** 自定义路径折线（WPS 肘形连接等），仅取描边开放路径 */
export function custGeomPolyline100(spPr: Element | null): { x: number; y: number }[] | null {
  if (!spPr) return null
  const cust = [...spPr.children].find((c) => c.localName === 'custGeom' || c.localName === 'a:custGeom')
  if (!cust) return null
  const pathLst = [...cust.children].find((c) => c.localName === 'pathLst' || c.localName === 'a:pathLst')
  if (!pathLst) return null
  for (const path of [...pathLst.children].filter((c) => c.localName === 'path' || c.localName === 'a:path')) {
    const fillNone = path.getAttribute('fill') === 'none'
    const strokeOn = path.getAttribute('stroke') !== '0' && path.getAttribute('stroke') !== 'false'
    if (!strokeOn && !fillNone) continue
    const closed = [...path.children].some((c) => {
      const tag = c.localName.replace(/^a:/, '')
      return tag === 'close'
    })
    if (closed) continue
    const pathW = Number(path.getAttribute('w') || 0)
    const pathH = Number(path.getAttribute('h') || 0)
    if (!pathW || !pathH) continue
    const points: { x: number; y: number }[] = []
    for (const seg of [...path.children]) {
      const tag = seg.localName.replace(/^a:/, '')
      if (tag === 'moveTo' || tag === 'lnTo') {
        const pt = [...seg.children].find((c) => c.localName === 'pt' || c.localName === 'a:pt')
        if (pt) points.push(pathPointTo100(pt, pathW, pathH))
      } else if (tag === 'cubicBezTo') {
        const pts = [...seg.children].filter((c) => c.localName === 'pt' || c.localName === 'a:pt')
        const end = pts[pts.length - 1]
        if (end) points.push(pathPointTo100(end, pathW, pathH))
      }
    }
    if (points.length >= 2) return points
  }
  return null
}

function adjFrac(adjust: Record<string, number> | undefined, name: string, dflt: number) {
  const raw = adjust?.[name]
  if (raw == null) return dflt
  return Math.min(Math.max(raw / 100000, -2), 3)
}

function bentConnectorPts(
  preset: string,
  w: number,
  h: number,
  adjust?: Record<string, number>,
): number[] {
  const n = parseInt(preset.slice(-1), 10) || 2
  if (n <= 2) return [0, 0, w, 0, w, h]
  if (n === 3) {
    const mx = w * adjFrac(adjust, 'adj1', 0.5)
    return [0, 0, mx, 0, mx, h, w, h]
  }
  if (n === 4) {
    const mx = w * adjFrac(adjust, 'adj1', 0.5)
    const my = h * adjFrac(adjust, 'adj2', 0.5)
    return [0, 0, mx, 0, mx, my, w, my, w, h]
  }
  const x1 = w * adjFrac(adjust, 'adj1', 0.333)
  const y1 = h * adjFrac(adjust, 'adj2', 0.5)
  const x2 = w * adjFrac(adjust, 'adj3', 0.667)
  return [0, 0, x1, 0, x1, y1, x2, y1, x2, h, w, h]
}

function connectorPtsLocal(
  preset: string,
  w: number,
  h: number,
  adjust?: Record<string, number>,
): number[] {
  if (/^bentConnector|^curvedConnector/i.test(preset)) {
    return bentConnectorPts(preset, w, h, adjust)
  }
  return [0, 0, w, h]
}

function applyFlip(pts: number[], w: number, h: number, flipH: boolean, flipV: boolean) {
  const out = [...pts]
  if (flipH) {
    for (let i = 0; i < out.length; i += 2) out[i] = w - out[i]!
  }
  if (flipV) {
    for (let i = 1; i < out.length; i += 2) out[i] = h - out[i]!
  }
  return out
}

export function connectorPolyline100(
  preset: string,
  flipH: boolean,
  flipV: boolean,
  adjust?: Record<string, number>,
): { x: number; y: number }[] {
  const w = 100
  const h = 100
  const flat = applyFlip(connectorPtsLocal(preset, w, h, adjust), w, h, flipH, flipV)
  const points: { x: number; y: number }[] = []
  for (let i = 0; i < flat.length; i += 2) {
    points.push({ x: flat[i]!, y: flat[i + 1]! })
  }
  return points
}
