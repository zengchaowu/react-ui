/** Show pixel grid when one scene px is at least this many screen px (~800% like Figma). */
export const FABRIC_EDITOR_PIXEL_GRID_MIN_CELL_SCREEN_PX = 8

/** Emphasize every N scene pixels. */
export const FABRIC_EDITOR_PIXEL_GRID_MAJOR_EVERY = 8

export type FabricPixelGridPaintColors = {
  line: string
  major: string
}

export function shouldShowFabricEditorPixelGrid(zoom: number): boolean {
  return Number.isFinite(zoom) && zoom >= FABRIC_EDITOR_PIXEL_GRID_MIN_CELL_SCREEN_PX
}

/**
 * Paint 1px scene grid from viewport transform (optionally clipped to artboard).
 * screen = scene * zoom + pan
 */
export function paintFabricEditorPixelGrid(
  ctx: CanvasRenderingContext2D,
  options: {
    width: number
    height: number
    zoom: number
    panX: number
    panY: number
    /** When set, only paint inside 0..w x 0..h */
    artboard?: { width: number; height: number } | null
    majorEvery?: number
    colors: FabricPixelGridPaintColors
  },
): void {
  const {
    width,
    height,
    zoom,
    panX,
    panY,
    artboard,
    colors,
  } = options
  const majorEvery = options.majorEvery ?? FABRIC_EDITOR_PIXEL_GRID_MAJOR_EVERY
  if (!(width > 0) || !(height > 0) || !shouldShowFabricEditorPixelGrid(zoom)) return

  let sceneLeft = (0 - panX) / zoom
  let sceneTop = (0 - panY) / zoom
  let sceneRight = (width - panX) / zoom
  let sceneBottom = (height - panY) / zoom

  if (artboard) {
    sceneLeft = Math.max(sceneLeft, 0)
    sceneTop = Math.max(sceneTop, 0)
    sceneRight = Math.min(sceneRight, artboard.width)
    sceneBottom = Math.min(sceneBottom, artboard.height)
  }

  if (!(sceneRight > sceneLeft) || !(sceneBottom > sceneTop)) return

  const clipLeft = sceneLeft * zoom + panX
  const clipTop = sceneTop * zoom + panY
  const clipRight = sceneRight * zoom + panX
  const clipBottom = sceneBottom * zoom + panY

  ctx.save()
  ctx.beginPath()
  ctx.rect(clipLeft, clipTop, clipRight - clipLeft, clipBottom - clipTop)
  ctx.clip()

  const x0 = Math.ceil(sceneLeft - 1e-9)
  const x1 = Math.floor(sceneRight + 1e-9)
  const y0 = Math.ceil(sceneTop - 1e-9)
  const y1 = Math.floor(sceneBottom + 1e-9)

  ctx.lineWidth = 1
  const align = (v: number) => Math.round(v) + 0.5

  for (let x = x0; x <= x1; x += 1) {
    const sx = align(x * zoom + panX)
    const major = majorEvery > 0 && x % majorEvery === 0
    ctx.strokeStyle = major ? colors.major : colors.line
    ctx.beginPath()
    ctx.moveTo(sx, clipTop)
    ctx.lineTo(sx, clipBottom)
    ctx.stroke()
  }

  for (let y = y0; y <= y1; y += 1) {
    const sy = align(y * zoom + panY)
    const major = majorEvery > 0 && y % majorEvery === 0
    ctx.strokeStyle = major ? colors.major : colors.line
    ctx.beginPath()
    ctx.moveTo(clipLeft, sy)
    ctx.lineTo(clipRight, sy)
    ctx.stroke()
  }

  ctx.restore()
}
