import {
  Color,
  Group,
  Path,
  Point,
  config,
  util,
  type Canvas,
  type FabricObject,
  type TMat2D,
  type TSimplePathData,
} from 'fabric'
import { isFabricArtboardGuide, type ArtboardSize } from './fabricArtboard'

export type IconFontFlatPathSpec = {
  d: string
  fill?: string
  fillRule?: string
  stroke?: string
  strokeWidth?: number
}

const DEFAULT_ICON_FILL = '#2c2c2c' // design-token-check: ignore — iconfont 导出兜底

function escapeXmlAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function paintToExportColor(val: unknown): string | undefined {
  if (val == null || val === '') return undefined
  if (typeof val !== 'string') return undefined
  const trimmed = val.trim()
  if (!trimmed || trimmed === 'none' || trimmed === 'transparent') return 'none'
  try {
    const c = new Color(trimmed)
    if (c.isUnrecognised) return trimmed
    if (c.getAlpha() === 0) return 'none'
    return `#${c.toHex()}`
  } catch {
    return trimmed
  }
}

function parseSvgMatrix(raw: string | undefined): TMat2D {
  if (!raw) return [1, 0, 0, 1, 0, 0]
  const nums = raw
    .trim()
    .split(/[\s,]+/)
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n))
  if (nums.length >= 6) {
    return [nums[0], nums[1], nums[2], nums[3], nums[4], nums[5]]
  }
  return [1, 0, 0, 1, 0, 0]
}

function parseSvgTranslate(raw: string | undefined): TMat2D {
  if (!raw) return [1, 0, 0, 1, 0, 0]
  const m = raw.match(/translate\(\s*([^,)]+)[,\s]+([^)]+)\s*\)/i)
  if (!m) return [1, 0, 0, 1, 0, 0]
  return [1, 0, 0, 1, Number(m[1]), Number(m[2])]
}

function parseFabricSvgStyle(style: string | undefined): {
  fill?: string
  stroke?: string
  fillRule?: string
  strokeWidth?: number
} {
  if (!style) return {}
  const fillRaw = style.match(/(?:^|;)\s*fill:\s*([^;]+)/i)?.[1]?.trim()
  const strokeRaw = style.match(/(?:^|;)\s*stroke:\s*([^;]+)/i)?.[1]?.trim()
  const fillRule = style.match(/fill-rule:\s*([^;]+)/i)?.[1]?.trim()
  const strokeWidthRaw = style.match(/stroke-width:\s*([^;]+)/i)?.[1]?.trim()
  const strokeWidth = strokeWidthRaw ? Number(strokeWidthRaw) : undefined
  return {
    fill: fillRaw ? paintToExportColor(fillRaw) : undefined,
    stroke: strokeRaw ? paintToExportColor(strokeRaw) : undefined,
    fillRule,
    strokeWidth: Number.isFinite(strokeWidth) ? strokeWidth : undefined,
  }
}

function resolveExportFill(obj: FabricObject, styleFill?: string): string {
  const fromObject = paintToExportColor(obj.fill)
  if (fromObject && fromObject !== 'none') return fromObject
  if (styleFill && styleFill !== 'none') return styleFill
  return DEFAULT_ICON_FILL
}

function resolveExportStroke(obj: FabricObject, styleStroke?: string): string | undefined {
  const fromObject = paintToExportColor(obj.stroke)
  if (fromObject && fromObject !== 'none') return fromObject
  if (styleStroke && styleStroke !== 'none') return styleStroke
  return undefined
}

function flattenPathData(
  pathData: TSimplePathData,
  matrix: TMat2D,
  pathOffset?: Path['pathOffset'],
): string {
  const transformed = util.transformPath(pathData, matrix, pathOffset ?? new Point(0, 0))
  return util.joinPath(transformed, config.NUM_FRACTION_DIGITS)
}

function specFromPathData(
  pathData: TSimplePathData,
  matrix: TMat2D,
  obj: FabricObject,
  style: ReturnType<typeof parseFabricSvgStyle> = {},
): IconFontFlatPathSpec | null {
  const d = flattenPathData(pathData, matrix)
  if (!d) return null
  const fill = resolveExportFill(obj, style.fill)
  const stroke = resolveExportStroke(obj, style.stroke)
  if (fill === 'none' && !stroke) return null
  return {
    d,
    fill,
    fillRule: style.fillRule ?? (obj as Path).fillRule ?? 'nonzero',
    stroke,
    strokeWidth: obj.strokeWidth ?? style.strokeWidth,
  }
}

function circleToPath(cx: number, cy: number, r: number): TSimplePathData {
  return util.makePathSimpler(
    util.parsePath(
      `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`,
    ),
  )
}

function rectToPath(x: number, y: number, w: number, h: number): TSimplePathData {
  return [
    ['M', x, y],
    ['L', x + w, y],
    ['L', x + w, y + h],
    ['L', x, y + h],
    ['Z'],
  ]
}

function polygonToPath(pointsAttr: string): TSimplePathData {
  const coords = pointsAttr
    .trim()
    .split(/[\s,]+/)
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n))
  const path: TSimplePathData = []
  for (let i = 0; i + 1 < coords.length; i += 2) {
    path.push(i === 0 ? ['M', coords[i], coords[i + 1]] : ['L', coords[i], coords[i + 1]])
  }
  if (path.length) path.push(['Z'])
  return path
}

function parseFabricToSvgFragment(obj: FabricObject): IconFontFlatPathSpec[] {
  const markup = obj.toSVG()
  const rootMatrix = parseSvgMatrix(markup.match(/<g[^>]*transform="matrix\(([^)]+)\)"/i)?.[1])
  const style = parseFabricSvgStyle(markup.match(/\bstyle="([^"]*)"/i)?.[1])

  const pathTag = markup.match(/<path\b([^>]*)\/?>/i)
  if (pathTag) {
    const attrs = pathTag[1] ?? ''
    const d = attrs.match(/\bd="([^"]+)"/i)?.[1]
    if (d) {
      const localMatrix = util.multiplyTransformMatrices(
        rootMatrix,
        parseSvgTranslate(attrs.match(/\btransform="([^"]+)"/i)?.[1]),
      )
      const spec = specFromPathData(
        util.makePathSimpler(util.parsePath(d)),
        localMatrix,
        obj,
        style,
      )
      return spec ? [spec] : []
    }
  }

  const circleTag = markup.match(/<circle\b([^>]*)\/?>/i)
  if (circleTag) {
    const attrs = circleTag[1] ?? ''
    const cx = Number(attrs.match(/\bcx="([^"]+)"/i)?.[1] ?? 0)
    const cy = Number(attrs.match(/\bcy="([^"]+)"/i)?.[1] ?? 0)
    const r = Number(attrs.match(/\br="([^"]+)"/i)?.[1] ?? 0)
    if (r > 0) {
      const spec = specFromPathData(circleToPath(cx, cy, r), rootMatrix, obj, style)
      return spec ? [spec] : []
    }
  }

  const rectTag = markup.match(/<rect\b([^>]*)\/?>/i)
  if (rectTag) {
    const attrs = rectTag[1] ?? ''
    const x = Number(attrs.match(/\bx="([^"]+)"/i)?.[1] ?? 0)
    const y = Number(attrs.match(/\by="([^"]+)"/i)?.[1] ?? 0)
    const w = Number(attrs.match(/\bwidth="([^"]+)"/i)?.[1] ?? 0)
    const h = Number(attrs.match(/\bheight="([^"]+)"/i)?.[1] ?? 0)
    if (w > 0 && h > 0) {
      const spec = specFromPathData(rectToPath(x, y, w, h), rootMatrix, obj, style)
      return spec ? [spec] : []
    }
  }

  const polygonTag = markup.match(/<polygon\b([^>]*)\/?>/i)
  if (polygonTag) {
    const attrs = polygonTag[1] ?? ''
    const points = attrs.match(/\bpoints="([^"]+)"/i)?.[1]
    if (points) {
      const spec = specFromPathData(polygonToPath(points), rootMatrix, obj, style)
      return spec ? [spec] : []
    }
  }

  return []
}

function pathObjectToSpecs(obj: Path): IconFontFlatPathSpec[] {
  if (!obj.path?.length) return []
  const fill = resolveExportFill(obj)
  const stroke = resolveExportStroke(obj)
  if (fill === 'none' && !stroke) return []

  const d = flattenPathData(obj.path, obj.calcTransformMatrix(), obj.pathOffset)
  if (!d) return []

  return [
    {
      d,
      fill,
      fillRule: obj.fillRule ?? 'nonzero',
      stroke,
      strokeWidth: obj.strokeWidth,
    },
  ]
}

function fabricObjectToFlatPathSpecs(obj: FabricObject): IconFontFlatPathSpec[] {
  if (isFabricArtboardGuide(obj) || obj.excludeFromExport || !obj.visible) return []

  if (obj instanceof Path) {
    return pathObjectToSpecs(obj)
  }

  if (obj instanceof Group) {
    return obj
      .getObjects()
      .flatMap((child) => fabricObjectToFlatPathSpecs(child as FabricObject))
  }

  return parseFabricToSvgFragment(obj)
}

export function collectIconFontFlatPathSpecs(canvas: Canvas): IconFontFlatPathSpec[] {
  return canvas.getObjects().flatMap((obj) => fabricObjectToFlatPathSpecs(obj))
}

export function formatIconFontSvgDocument(
  specs: IconFontFlatPathSpec[],
  artboard: ArtboardSize,
): string {
  const viewBox = `0 0 ${artboard.width} ${artboard.height}`
  const lines = specs.map((spec) => {
    const attrs = [`d="${escapeXmlAttr(spec.d)}"`]
    if (spec.fill) attrs.push(`fill="${escapeXmlAttr(spec.fill)}"`)
    if (spec.fillRule && spec.fillRule !== 'nonzero') {
      attrs.push(`fill-rule="${escapeXmlAttr(spec.fillRule)}"`)
    }
    if (spec.stroke && spec.stroke !== 'none') {
      attrs.push(`stroke="${escapeXmlAttr(spec.stroke)}"`)
    }
    if (spec.strokeWidth && spec.strokeWidth > 0) {
      attrs.push(`stroke-width="${spec.strokeWidth}"`)
    }
    return `<path ${attrs.join(' ')} />`
  })
  return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">\n${lines.join('\n')}\n</svg>\n`
}

export function exportArtboardSvgAsIconFontPaths(
  canvas: Canvas,
  artboard: ArtboardSize,
): string {
  const specs = collectIconFontFlatPathSpecs(canvas)
  return formatIconFontSvgDocument(specs, artboard)
}
