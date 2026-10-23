import type { FabricObject, Point } from 'fabric'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'

/** 与选中边框同视觉，悬停高亮与是否选中无关 */
export const FABRIC_EDITOR_HOVER_OUTLINE_PX = 1.5

/**
 * 在画布像素坐标系画对象定向包围盒描边（需已处于 canvas 上下文，不含 viewport）。
 * `vpt` 为画布 viewportTransform。
 */
export function paintFabricObjectHoverOutline(
  ctx: CanvasRenderingContext2D,
  obj: FabricObject,
  vpt: number[],
): void {
  obj.setCoords()
  const coords = obj.getCoords()
  const tl = coords[0]
  const tr = coords[1]
  const br = coords[2]
  const bl = coords[3]
  if (!tl || !tr || !br || !bl) return

  const toCanvas = (p: Point) => ({
    x: vpt[0]! * p.x + vpt[2]! * p.y + vpt[4]!,
    y: vpt[1]! * p.x + vpt[3]! * p.y + vpt[5]!,
  })
  const a = toCanvas(tl)
  const b = toCanvas(tr)
  const c = toCanvas(br)
  const d = toCanvas(bl)

  ctx.save()
  ctx.strokeStyle = tokenSolidColors.brandColor6
  ctx.lineWidth = FABRIC_EDITOR_HOVER_OUTLINE_PX
  ctx.lineJoin = 'miter'
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.lineTo(c.x, c.y)
  ctx.lineTo(d.x, d.y)
  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}
