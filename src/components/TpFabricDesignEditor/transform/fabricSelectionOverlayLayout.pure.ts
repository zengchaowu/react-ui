import type { Canvas, FabricObject, Point } from 'fabric'

export type FabricSelectionOverlayLayout = {
  /** 名称锚点（画布像素）：局部顶边左端外侧；transform-origin: left bottom */
  nameAnchorCanvas: { x: number; y: number }
  /** 尺寸锚点（画布像素）：局部底边中点外侧；需再沿顶边方向回半宽 */
  sizeAnchorCanvas: { x: number; y: number }
  /** 顶边单位方向（画布像素），用于尺寸徽章水平居中 */
  alongTopCanvas: { x: number; y: number }
  /** 顶边相对屏幕的朝向（度） */
  edgeAngleDeg: number
  /** 局部缩放后宽高（非轴对齐包围盒） */
  width: number
  height: number
}

function scenePointToCanvas(
  x: number,
  y: number,
  vpt: number[],
): { x: number; y: number } {
  return {
    x: vpt[0]! * x + vpt[2]! * y + vpt[4]!,
    y: vpt[1]! * x + vpt[3]! * y + vpt[5]!,
  }
}

function toCanvasPoint(p: Point, vpt: number[]) {
  return scenePointToCanvas(p.x, p.y, vpt)
}

function normalize(dx: number, dy: number): { x: number; y: number } {
  const len = Math.hypot(dx, dy) || 1
  return { x: dx / len, y: dy / len }
}

/**
 * 按选中对象的定向包围盒计算叠层锚点（名称/尺寸随旋转贴边）。
 */
export function readFabricSelectionOverlayLayout(
  canvas: Canvas,
  active: FabricObject,
  gaps: { nameGapPx: number; sizeGapPx: number },
): FabricSelectionOverlayLayout | null {
  active.setCoords()
  const coords = active.getCoords()
  const tl = coords[0]
  const tr = coords[1]
  const br = coords[2]
  const bl = coords[3]
  if (!tl || !tr || !br || !bl) return null

  const width = Math.abs(active.getScaledWidth())
  const height = Math.abs(active.getScaledHeight())
  if (!(width > 0) || !(height > 0)) return null

  const vpt = canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0]
  const tlC = toCanvasPoint(tl, vpt)
  const trC = toCanvasPoint(tr, vpt)
  const brC = toCanvasPoint(br, vpt)
  const blC = toCanvasPoint(bl, vpt)

  const up = normalize(tlC.x - blC.x, tlC.y - blC.y)
  const down = { x: -up.x, y: -up.y }
  const alongTop = normalize(trC.x - tlC.x, trC.y - tlC.y)
  const edgeAngleDeg =
    (Math.atan2(trC.y - tlC.y, trC.x - tlC.x) * 180) / Math.PI

  const bottomCenter = {
    x: (blC.x + brC.x) / 2,
    y: (blC.y + brC.y) / 2,
  }

  return {
    nameAnchorCanvas: {
      x: tlC.x + up.x * gaps.nameGapPx,
      y: tlC.y + up.y * gaps.nameGapPx,
    },
    sizeAnchorCanvas: {
      x: bottomCenter.x + down.x * gaps.sizeGapPx,
      y: bottomCenter.y + down.y * gaps.sizeGapPx,
    },
    alongTopCanvas: alongTop,
    edgeAngleDeg,
    width,
    height,
  }
}
