import {
  ActiveSelection,
  Group,
  Path,
  util,
  type Canvas,
  type FabricObject,
  type TMat2D,
} from 'fabric'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'
import { applyFabricEditorObjectControlStyle } from '../selection/fabricEditorSelectionStyle'
import { hasFabricPathEditSession } from '../tools/penTool'

const HIGHLIGHT_STROKE_PX = 1.5
/** 复合路径（描边转面等）用半透明填充高亮，避免描到子路径间的桥梁线 */
const HIGHLIGHT_FILL = tokenSolidColors.brandColor6SelectionFill

const dragHidingByCanvas = new WeakMap<Canvas, boolean>()

type PathWithRenderCommands = Path & {
  _renderPathCommands: (ctx: CanvasRenderingContext2D) => void
}

function collectSelectedPaths(obj: FabricObject): Path[] {
  if (obj instanceof Path) return [obj]
  if (obj instanceof ActiveSelection || obj instanceof Group) {
    return (obj.getObjects() as FabricObject[]).flatMap(collectSelectedPaths)
  }
  return []
}

function countPathSubpaths(path: Path): number {
  let count = 0
  for (const cmd of path.path ?? []) {
    if (cmd[0] === 'M') count += 1
  }
  return count
}

function pathHasFill(path: Path): boolean {
  const fill = path.fill
  if (fill == null || fill === '' || fill === 'transparent') return false
  if (typeof fill === 'string' && fill.toLowerCase() === 'none') return false
  return true
}

function strokeOrFillPathHighlight(
  ctx: CanvasRenderingContext2D,
  path: Path,
  vpt: TMat2D | number[],
): void {
  const matrix = util.multiplyTransformMatrices(
    vpt as TMat2D,
    path.calcTransformMatrix(),
  )
  const scale = Math.hypot(matrix[0]!, matrix[1]!) || 1
  const subpaths = countPathSubpaths(path)
  const useFillTint = subpaths > 1 && pathHasFill(path)

  ctx.save()
  ctx.transform(
    matrix[0]!,
    matrix[1]!,
    matrix[2]!,
    matrix[3]!,
    matrix[4]!,
    matrix[5]!,
  )
  // 与 Fabric 填色同一套 path 命令，避免笔节点闭合重算多出弦线
  ;(path as PathWithRenderCommands)._renderPathCommands(ctx)

  if (useFillTint) {
    ctx.fillStyle = HIGHLIGHT_FILL
    ctx.fill(path.fillRule ?? 'nonzero')
  } else {
    ctx.strokeStyle = tokenSolidColors.brandColor6
    ctx.lineWidth = HIGHLIGHT_STROKE_PX / scale
    ctx.lineJoin = path.strokeLineJoin || 'round'
    ctx.lineCap = path.strokeLineCap || 'round'
    ctx.setLineDash([])
    ctx.stroke()
  }
  ctx.restore()
}

/** 平移拖动中不显示选中态附加 UI（尺寸徽章等） */
export function isFabricSelectionDragHiding(canvas: Canvas): boolean {
  return dragHidingByCanvas.get(canvas) === true
}

/**
 * 选中 Path 时高亮几何；平移拖动时隐藏边框/控制点（缩放仍保留）。
 */
export function attachFabricSelectionPathHighlight(canvas: Canvas): () => void {
  function restoreChromeIfNeeded() {
    if (!dragHidingByCanvas.get(canvas)) return
    dragHidingByCanvas.set(canvas, false)
    const active = canvas.getActiveObject()
    if (!active) return
    applyFabricEditorObjectControlStyle(active)
    canvas.requestRenderAll()
  }

  const onMoving = (opt: { target?: FabricObject }) => {
    const target = opt.target ?? canvas.getActiveObject()
    if (!target || dragHidingByCanvas.get(canvas)) return
    dragHidingByCanvas.set(canvas, true)
    target.set({ hasBorders: false, hasControls: false })
  }

  const onAfterRender = (opt: { ctx?: CanvasRenderingContext2D }) => {
    if (hasFabricPathEditSession(canvas) || dragHidingByCanvas.get(canvas)) return
    const active = canvas.getActiveObject()
    if (!active || active.isMoving) return
    const paths = collectSelectedPaths(active)
    if (!paths.length) return

    const ctx = opt.ctx ?? canvas.getContext()
    if (!ctx) return
    const vpt = canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0]

    for (const path of paths) {
      if (path.visible === false) continue
      strokeOrFillPathHighlight(ctx, path, vpt)
    }
  }

  canvas.on('object:moving', onMoving)
  canvas.on('mouse:up', restoreChromeIfNeeded)
  canvas.on('selection:cleared', restoreChromeIfNeeded)
  canvas.on('after:render', onAfterRender)

  return () => {
    dragHidingByCanvas.delete(canvas)
    canvas.off('object:moving', onMoving)
    canvas.off('mouse:up', restoreChromeIfNeeded)
    canvas.off('selection:cleared', restoreChromeIfNeeded)
    canvas.off('after:render', onAfterRender)
  }
}
