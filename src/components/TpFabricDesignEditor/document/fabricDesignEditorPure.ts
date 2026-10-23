import { Color, Group, type FabricObject, type GroupProps } from 'fabric'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'

export function paintToPickerHex(val: unknown): { hex: string; unsupported: boolean } {
  const r = paintToPickerHexAlpha(val)
  return { hex: r.hex, unsupported: r.unsupported }
}

/** 将任意 Fabric 可解析颜色转为取色器 hex + 透明度 0–1（百分比 UI 用 `Math.round(alpha * 100)`） */
export function paintToPickerHexAlpha(val: unknown): {
  hex: string
  alpha: number
  unsupported: boolean
} {
  if (val == null || val === '') {
    return { hex: tokenSolidColors.white, alpha: 1, unsupported: false }
  }
  if (typeof val === 'string') {
    try {
      const c = new Color(val)
      if (c.isUnrecognised) {
        return { hex: tokenSolidColors.textColorMuted, alpha: 1, unsupported: true }
      }
      return { hex: `#${c.toHex()}`, alpha: c.getAlpha(), unsupported: false }
    } catch {
      return { hex: tokenSolidColors.textColorMuted, alpha: 1, unsupported: true }
    }
  }
  return { hex: tokenSolidColors.textColorMuted, alpha: 1, unsupported: true }
}

/** 将 `#rrggbb` 与 0–100 不透明度合成带 alpha 的颜色字符串，供 Fabric fill/stroke 使用 */
export function rgbaStringFromHexAndOpacityPercent(
  hex: string,
  opacityPercent: number,
): string {
  const a = Math.max(0, Math.min(100, opacityPercent)) / 100
  const normalized = hex.startsWith('#') ? hex : `#${hex}`
  const c = new Color(normalized)
  c.setAlpha(a)
  return c.toRgba()
}

/** 从组合或 SVG 导入的 Group 上读到的 fill 常为 undefined，取第一个叶子用于侧栏展示 */
export function firstLeafForAppearance(root: FabricObject): FabricObject {
  let cur: FabricObject = root
  while (cur instanceof Group) {
    const inner = cur.getObjects()[0] as FabricObject | undefined
    if (!inner) return cur
    cur = inner
  }
  return cur
}

export type AppearancePatch = Partial<{ fill: string; stroke: string; strokeWidth: number }>

/**
 * SVG 导入 / 分组后的可视填充、描边在子 Path 上；对 Group 本身 set fill 不会更新子对象，需递归。
 */
export function applyAppearancePatchToObject(o: FabricObject, patch: AppearancePatch) {
  if (o instanceof Group) {
    for (const child of o.getObjects()) {
      applyAppearancePatchToObject(child as FabricObject, patch)
    }
    o.setCoords()
    return
  }

  if (patch.fill !== undefined) {
    const f = o.fill
    if (f == null || typeof f === 'string') {
      o.set({ fill: patch.fill })
    }
  }
  if (patch.stroke !== undefined) {
    const s = o.stroke
    if (s == null || s === '' || typeof s === 'string') {
      o.set({ stroke: patch.stroke })
    }
  }
  if (patch.strokeWidth !== undefined) {
    o.set({ strokeWidth: patch.strokeWidth })
  }
  o.setCoords()
}

/** Fabric 导出里偶发空 style，去掉可读性更好 */
export function tidyFabricSvgMarkup(markup: string): string {
  return markup.replace(/\sstyle=""/g, '')
}

const ICON_FONT_BG_FILL_RE =
  /fill=["'](?:transparent|none|#fff(?:fff)?|white|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))["']/i // design-token-check: ignore

function isFullCanvasBackgroundRect(tag: string): boolean {
  if (!/^<rect\b/i.test(tag)) return false
  if (!ICON_FONT_BG_FILL_RE.test(tag)) return false
  if (/width=["']100%["']/i.test(tag) && /height=["']100%["']/i.test(tag)) return true
  const w = Number(tag.match(/\bwidth=["'](\d+(?:\.\d+)?)["']/i)?.[1])
  const h = Number(tag.match(/\bheight=["'](\d+(?:\.\d+)?)["']/i)?.[1])
  return Number.isFinite(w) && Number.isFinite(h) && w >= 256 && h >= 256
}

/** 去掉 Fabric 导出/导入时常见的 clipPath、desc、全画幅透明或白色底 rect */
export function stripSvgEditorArtifactMarkup(inner: string): string {
  let s = inner
  s = s.replace(/<desc>[\s\S]*?<\/desc>\s*/gi, '')
  s = s.replace(/<defs>\s*<clipPath[\s\S]*?<\/clipPath>\s*<\/defs>\s*/gi, '')
  // 连同 </g> 一起剥掉；只删开标签会留下 Unexpected close tag，字体构建会失败
  s = s.replace(
    /<g\b[^>]*\bclip-path=["']url\(#CLIPPATH_[^"']+\)["'][^>]*>\s*([\s\S]*?)<\/g>\s*/gi,
    '$1',
  )
  s = s.replace(/<rect\b[^>]*\/?>\s*/gi, (m) => (isFullCanvasBackgroundRect(m) ? '' : m))
  return s.trim()
}

/** 画板模式导出：产出接近 iconfont 官方的简洁 SVG，避免白底/透明底 rect 进入字体构建 */
export function sanitizeArtboardExportSvg(
  raw: string,
  artboard: { width: number; height: number },
): string {
  const viewBox = `0 0 ${artboard.width} ${artboard.height}`
  const innerMatch = raw.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)
  const inner = stripSvgEditorArtifactMarkup(innerMatch?.[1] ?? raw)
  return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">\n${inner.trim()}\n</svg>\n`
}

/** 外部 SVG（含 iconfont 下载）导入编辑器前清理 */
export function sanitizeSvgMarkupBeforeEditorImport(raw: string): string {
  const trimmed = raw.trim()
  if (!/<svg[\s>]/i.test(trimmed)) return trimmed
  const m = trimmed.match(/<svg([^>]*)>([\s\S]*)<\/svg>/i)
  if (!m) return trimmed
  const attrs = m[1] ?? ''
  const viewBox =
    attrs.match(/viewBox=["']([^"']+)["']/i)?.[1] ?? '0 0 1024 1024'
  // 保留 width/height，否则 Fabric 只按 viewBox（如 1024）建几何，丢掉声明的 200×200
  const width = attrs.match(/\bwidth=["']([^"']+)["']/i)?.[1]
  const height = attrs.match(/\bheight=["']([^"']+)["']/i)?.[1]
  const keepDims =
    width &&
    height &&
    width !== '100%' &&
    height !== '100%' &&
    !Number.isNaN(parseFloat(width)) &&
    !Number.isNaN(parseFloat(height))
  const inner = stripSvgEditorArtifactMarkup(m[2] ?? '')
  const dimAttrs = keepDims ? ` width="${width}" height="${height}"` : ''
  return `<svg viewBox="${viewBox}"${dimAttrs} xmlns="http://www.w3.org/2000/svg">\n${inner.trim()}\n</svg>\n`
}

/**
 * Fabric {@link FabricObject#toSVG} 会为每个对象生成 `<g transform="matrix(...)">` + 内联 `style`，
 * 编组再嵌套一层——这是在画布坐标系下还原变换的常规做法，不是导出坏了。
 * 这里包成带正确 viewBox 的完整 SVG 文档，便于单独打开或与 AI/外部工具交换。
 */
export function wrapFabricObjectSvgAsDocument(obj: FabricObject): string {
  const fragment = tidyFabricSvgMarkup(obj.toSVG())
  const r = obj.getBoundingRect()
  const pad = 4
  const vx = r.left - pad
  const vy = r.top - pad
  const vw = Math.max(1, r.width + pad * 2)
  const vh = Math.max(1, r.height + pad * 2)
  const fmt = (n: number) =>
    Number.isFinite(n) ? String(Math.round(n * 100) / 100) : '0'

  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"',
    ' version="1.1"',
    ` width="${Math.ceil(vw)}" height="${Math.ceil(vh)}"`,
    ` viewBox="${fmt(vx)} ${fmt(vy)} ${fmt(vw)} ${fmt(vh)}"`,
    ' xml:space="preserve">',
    '<desc>Exported selection (Fabric.js)</desc>',
    fragment.trim(),
    '</svg>',
    '',
  ].join('\n')
}

/** 模型常返回 Fabric.toSVG 风格的片段（仅 `<g>` / `<path>` 等），需包一层 `<svg>` 才能被 loadSVGFromString 解析 */
const SVG_ROOT_OR_FRAGMENT_RE =
  /^\s*<\s*(?:svg\b|g\b|path\b|rect\b|circle\b|ellipse\b|polygon\b|polyline\b|line\b|text\b|defs\b|use\b|symbol\b|clipPath\b|mask\b|linearGradient\b|radialGradient\b|foreignObject\b|style\b|metadata\b)/i

export function extractSvgFromAiResponse(raw: string): string {
  const trimmed = raw.trim()
  const fence = /^```(?:svg|xml)?\s*\n?([\s\S]*?)```$/im.exec(trimmed)
  if (fence?.[1]) {
    const inner = fence[1].trim()
    if (inner) return inner
  }
  const i = trimmed.indexOf('<svg')
  const j = trimmed.lastIndexOf('</svg>')
  if (i >= 0 && j > i) return trimmed.slice(i, j + 6)
  return trimmed
}

/**
 * 将 AI 输出规范为可被 Fabric `loadSVGFromString` 加载的完整 SVG 文档。
 * - 已有 `<svg` 根则原样返回（trim 后）
 * - 否则若为常见 SVG 子元素片段则外包 `<svg xmlns="...">`
 */
export function ensureSvgDocumentForFabric(markup: string): string {
  const t = markup.trim()
  if (!t) return ''
  if (/^\s*<\s*svg\b/i.test(t)) return t
  if (SVG_ROOT_OR_FRAGMENT_RE.test(t)) {
    return `<svg xmlns="http://www.w3.org/2000/svg">${t}</svg>`
  }
  return t
}

/**
 * `loadSVGFromString` 会把解析元数据（含 viewBox 换算出的 width/height）塞进 `groupSVGElements` 第二参。
 * 仅含 `<svg>` 包装而无尺寸/viewBox 时 Fabric 会得到 width=height=0，Group 布局与控制点交互会异常。
 */
export function sanitizeSvgGroupOptionsForFabric(
  svgOpts: Record<string, unknown>,
): Partial<GroupProps> | undefined {
  const w = svgOpts.width
  const h = svgOpts.height
  const badDims =
    (typeof w === 'number' && w <= 0) ||
    (typeof h === 'number' && h <= 0)

  const skipKeys = new Set(['crossOrigin', 'signal'])
  const pick: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(svgOpts)) {
    if (skipKeys.has(k)) continue
    if (
      badDims &&
      (k === 'width' ||
        k === 'height' ||
        k === 'minX' ||
        k === 'minY' ||
        k === 'viewBoxWidth' ||
        k === 'viewBoxHeight')
    ) {
      continue
    }
    pick[k] = v
  }
  return Object.keys(pick).length > 0 ? (pick as Partial<GroupProps>) : undefined
}

/**
 * SVG 导入后子路径往往仍带 `evented/selectable`，命中测试会抢走父 Group 的缩放控制点。
 * 仅保留树根与画布交互；嵌套 Group 同样设为非交互，由最外层统一变换。
 */
export function normalizeSvgImportedInteractionTree(root: FabricObject): void {
  function apply(o: FabricObject, isRoot: boolean) {
    if (o instanceof Group) {
      o.set({
        subTargetCheck: false,
        interactive: false,
        selectable: isRoot,
        evented: isRoot,
        hasControls: isRoot,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,
      })
      for (const child of o.getObjects()) {
        apply(child as FabricObject, false)
      }
    } else {
      o.set({
        selectable: isRoot,
        evented: isRoot,
        hasControls: isRoot,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,
      })
    }
  }
  apply(root, true)
}
