import type { Canvas, FabricObject } from 'fabric'
import { isFabricArtboardGuide } from '../document/fabricArtboard'
import { isFabricEditorPaintClone } from '../appearance/fabricEditorPaintLayers.pure'

export type FabricSceneBounds = {
  left: number
  top: number
  width: number
  height: number
}

export function collectFabricStageContentObjects(canvas: Canvas): FabricObject[] {
  return canvas.getObjects().filter((obj) => {
    if (!obj.visible) return false
    if (isFabricArtboardGuide(obj)) return false
    if (isFabricEditorPaintClone(obj)) return false
    return true
  })
}

export function measureFabricSceneBounds(
  objects: FabricObject[],
): FabricSceneBounds | null {
  if (!objects.length) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const obj of objects) {
    const rect = obj.getBoundingRect()
    minX = Math.min(minX, rect.left)
    minY = Math.min(minY, rect.top)
    maxX = Math.max(maxX, rect.left + rect.width)
    maxY = Math.max(maxY, rect.top + rect.height)
  }

  const width = maxX - minX
  const height = maxY - minY
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null
  }

  return {
    left: minX,
    top: minY,
    width,
    height,
  }
}

export function resolveFabricZoomToFitLevel(options: {
  bounds: FabricSceneBounds
  viewportWidth: number
  viewportHeight: number
  padding?: number
  minZoom: number
  maxZoom: number
}): number {
  const padding = options.padding ?? 40
  const pad = padding * 2
  const zoomX = (options.viewportWidth - pad) / options.bounds.width
  const zoomY = (options.viewportHeight - pad) / options.bounds.height
  const raw = Math.min(zoomX, zoomY)
  return Math.max(options.minZoom, Math.min(options.maxZoom, raw))
}

export function resolveFabricViewportPanForSceneCenter(options: {
  sceneCenterX: number
  sceneCenterY: number
  viewportWidth: number
  viewportHeight: number
  zoom: number
}): { panX: number; panY: number } {
  return {
    panX: options.viewportWidth / 2 - options.sceneCenterX * options.zoom,
    panY: options.viewportHeight / 2 - options.sceneCenterY * options.zoom,
  }
}
