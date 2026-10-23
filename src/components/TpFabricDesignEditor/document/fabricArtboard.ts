import { type Canvas, type FabricObject } from 'fabric'
import { exportArtboardSvgAsIconFontPaths } from './fabricIconFontExport'
import { sanitizeArtboardExportSvg } from './fabricDesignEditorPure'

export type ArtboardSize = {
  width: number
  height: number
}

type GuideObject = FabricObject & { tpFabricArtboardGuide?: boolean }

/** 解析 `fixedCanvasSize`：数字表示正方形边长 */
export function resolveArtboardSize(
  size?: number | ArtboardSize | null,
): ArtboardSize | null {
  if (size == null) return null
  if (typeof size === 'number') {
    const n = Math.max(1, Math.floor(size))
    return { width: n, height: n }
  }
  return {
    width: Math.max(1, Math.floor(size.width)),
    height: Math.max(1, Math.floor(size.height)),
  }
}

export function isFabricArtboardGuide(obj: FabricObject): boolean {
  return Boolean((obj as GuideObject).tpFabricArtboardGuide)
}

/** 移除编辑态画板裁剪、引导边框等（兼容旧会话残留） */
export function detachArtboardEditingArtifacts(canvas: Canvas): void {
  canvas.clipPath = undefined
  const guides = canvas.getObjects().filter(isFabricArtboardGuide)
  if (guides.length) {
    canvas.remove(...guides)
  }
}

export function exportArtboardSvg(canvas: Canvas, artboard: ArtboardSize): string {
  const savedClip = canvas.clipPath
  const savedBg = canvas.backgroundColor
  const savedOverlay = canvas.overlayColor

  try {
    canvas.clipPath = undefined
    canvas.backgroundColor = ''
    canvas.overlayColor = ''

    const flatSvg = exportArtboardSvgAsIconFontPaths(canvas, artboard)
    if (!/<path\b/i.test(flatSvg)) {
      const raw = canvas.toSVG({
        suppressPreamble: true,
        viewBox: {
          x: 0,
          y: 0,
          width: artboard.width,
          height: artboard.height,
        },
        width: String(artboard.width),
        height: String(artboard.height),
      })
      return sanitizeArtboardExportSvg(raw, artboard)
    }
    return flatSvg
  } finally {
    canvas.clipPath = savedClip
    canvas.backgroundColor = savedBg
    canvas.overlayColor = savedOverlay
  }
}
