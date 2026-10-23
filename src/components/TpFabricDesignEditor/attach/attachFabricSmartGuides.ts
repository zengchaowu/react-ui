import {
  ActiveSelection,
  Group,
  type Canvas,
  type FabricObject,
  type TPointerEventInfo,
} from 'fabric'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'
import { isFabricArtboardGuide } from '../document/fabricArtboard'
import { isFabricEditorPaintClone } from '../appearance/fabricEditorPaintLayers.pure'
import { isFabricContainerFrame } from '../tools/fabricContainerTool.pure'
import { hasFabricPathEditSession } from '../tools/penTool'
import {
  computeFabricSmartSnap,
  getFabricObjectSmartGuideBox,
  type FabricSmartGuideBox,
  type FabricSmartGuideLine,
} from '../transform/fabricEditorSmartGuides.pure'

/** 屏幕像素阈值，再除以 zoom 得到场景单位 */
const SNAP_THRESHOLD_PX = 6
const GUIDE_STROKE = tokenSolidColors.warningColor5
const GUIDE_WIDTH_PX = 1

function collectMovingSkipSet(moving: FabricObject): Set<FabricObject> {
  const skip = new Set<FabricObject>([moving])
  if (moving instanceof ActiveSelection) {
    for (const o of moving.getObjects() as FabricObject[]) {
      skip.add(o)
    }
  }
  return skip
}

function shouldSkipSnapReference(obj: FabricObject, skip: Set<FabricObject>): boolean {
  if (skip.has(obj)) return true
  if (obj.visible === false) return true
  if (isFabricArtboardGuide(obj)) return true
  if (isFabricEditorPaintClone(obj)) return true
  if (isFabricContainerFrame(obj)) return true
  return false
}

/** 与移动对象同级的兄弟（在组内则组的子级；否则画布根对象） */
function collectSiblingReferences(
  canvas: Canvas,
  moving: FabricObject,
  skip: Set<FabricObject>,
): FabricSmartGuideBox[] {
  const parent = moving.group
  const peers: FabricObject[] =
    parent && parent instanceof Group && !(parent instanceof ActiveSelection)
      ? (parent.getObjects() as FabricObject[])
      : canvas.getObjects()

  const boxes: FabricSmartGuideBox[] = []
  for (const o of peers) {
    if (shouldSkipSnapReference(o, skip)) continue
    try {
      boxes.push(getFabricObjectSmartGuideBox(o))
    } catch {
      /* skip */
    }
  }
  return boxes
}

function paintGuides(
  ctx: CanvasRenderingContext2D,
  guides: FabricSmartGuideLine[],
  vpt: number[],
) {
  if (!guides.length) return
  const sx = (x: number, y: number) => ({
    x: vpt[0]! * x + vpt[2]! * y + vpt[4]!,
    y: vpt[1]! * x + vpt[3]! * y + vpt[5]!,
  })

  ctx.save()
  ctx.strokeStyle = GUIDE_STROKE
  ctx.lineWidth = GUIDE_WIDTH_PX
  ctx.setLineDash([])
  ctx.beginPath()
  for (const g of guides) {
    if (g.orient === 'v') {
      const a = sx(g.x, g.y1)
      const b = sx(g.x, g.y2)
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
    } else {
      const a = sx(g.x1, g.y)
      const b = sx(g.x2, g.y)
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
    }
  }
  ctx.stroke()
  ctx.restore()
}

/**
 * 拖拽对齐辅助线；按住 Shift 时自动吸附到边/中线。
 */
export function attachFabricSmartGuides(options: {
  canvas: Canvas
  getReadonly: () => boolean
}): () => void {
  const { canvas, getReadonly } = options
  let guides: FabricSmartGuideLine[] = []
  let dragging = false
  let shiftHeld = false

  function clearGuides() {
    if (!guides.length) return
    guides = []
    canvas.requestRenderAll()
  }

  function readShiftFromEvent(e?: Event): boolean {
    if (!e || !('shiftKey' in e)) return shiftHeld
    return Boolean((e as KeyboardEvent | MouseEvent | PointerEvent).shiftKey)
  }

  function applySmartGuides(moving: FabricObject, e?: Event) {
    if (getReadonly() || hasFabricPathEditSession(canvas)) {
      clearGuides()
      return
    }
    shiftHeld = readShiftFromEvent(e)
    const zoom = canvas.getZoom() || 1
    const threshold = SNAP_THRESHOLD_PX / zoom
    const skip = collectMovingSkipSet(moving)
    const references = collectSiblingReferences(canvas, moving, skip)
    const movingBox = getFabricObjectSmartGuideBox(moving)
    const result = computeFabricSmartSnap({
      moving: movingBox,
      references,
      threshold,
      applySnap: shiftHeld,
    })

    if (shiftHeld && (result.dx !== 0 || result.dy !== 0)) {
      moving.set({
        left: (moving.left ?? 0) + result.dx,
        top: (moving.top ?? 0) + result.dy,
      })
      moving.setCoords()
    }

    guides = result.guides
  }

  const onMoving = (opt: { target?: FabricObject; e?: Event }) => {
    const moving = opt.target
    if (!moving) return
    dragging = true
    applySmartGuides(moving, opt.e)
  }

  const onMouseUp = () => {
    dragging = false
    clearGuides()
  }

  const onModified = () => {
    dragging = false
    clearGuides()
  }

  const onKeyChange = (e: KeyboardEvent) => {
    if (e.key !== 'Shift') return
    shiftHeld = e.type === 'keydown'
    if (!dragging) return
    const active = canvas.getActiveObject() as FabricObject | undefined
    if (!active) return
    applySmartGuides(active, e)
    canvas.requestRenderAll()
  }

  const onAfterRender = (opt: { ctx?: CanvasRenderingContext2D }) => {
    if (!guides.length) return
    const ctx = opt.ctx ?? canvas.getContext()
    if (!ctx) return
    const vpt = canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0]
    paintGuides(ctx, guides, vpt)
  }

  // after:render 在拖动过程中会频繁触发；mouse:down 时也可能需要同步 shift
  const onMouseDown = (opt: TPointerEventInfo) => {
    shiftHeld = readShiftFromEvent(opt.e)
  }

  canvas.on('object:moving', onMoving)
  canvas.on('mouse:up', onMouseUp)
  canvas.on('object:modified', onModified)
  canvas.on('mouse:down', onMouseDown)
  canvas.on('after:render', onAfterRender)
  window.addEventListener('keydown', onKeyChange)
  window.addEventListener('keyup', onKeyChange)

  return () => {
    clearGuides()
    canvas.off('object:moving', onMoving)
    canvas.off('mouse:up', onMouseUp)
    canvas.off('object:modified', onModified)
    canvas.off('mouse:down', onMouseDown)
    canvas.off('after:render', onAfterRender)
    window.removeEventListener('keydown', onKeyChange)
    window.removeEventListener('keyup', onKeyChange)
  }
}
