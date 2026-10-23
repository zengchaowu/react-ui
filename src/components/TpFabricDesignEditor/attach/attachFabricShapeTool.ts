import type { Canvas } from 'fabric'
import type { FabricObject, TPointerEvent } from 'fabric'
import { applyFabricEditorObjectControlStyle } from '../selection/fabricEditorSelectionStyle'
import { assignDefaultFabricLayerName } from '../layers/fabricLayerNaming.pure'
import {
  createFabricShapePreview,
  FABRIC_SHAPE_MIN_SIZE,
  isFabricShapeToolName,
  normalizeFabricShapeBox,
  shouldConstrainFabricShapeSquare,
  updateFabricShapePreview,
} from '../tools/fabricShapeTool.pure'
import type { TpFabricDesignEditorShapeTool, TpFabricDesignEditorTool } from '../types'

type ShapeSession = {
  kind: TpFabricDesignEditorShapeTool
  preview: FabricObject
}

export function attachFabricShapeTool(options: {
  canvas: Canvas
  getReadonly: () => boolean
  getCurrentTool: () => string
  getViewportTool?: () => 'select' | 'hand'
  setTool: (tool: TpFabricDesignEditorTool) => void
}): () => void {
  const { canvas, getReadonly, getCurrentTool, getViewportTool, setTool } = options

  let session: ShapeSession | null = null
  let startPoint: { x: number; y: number } | null = null

  function clearSession(removePreview = true) {
    if (removePreview && session?.preview) {
      canvas.remove(session.preview)
    }
    session = null
    startPoint = null
    canvas.requestRenderAll()
  }

  function commitSession(endPoint: { x: number; y: number }, ev: TPointerEvent) {
    if (!session || !startPoint) return

    const box = normalizeFabricShapeBox(
      startPoint,
      endPoint,
      shouldConstrainFabricShapeSquare(ev),
    )

    if (box.width < FABRIC_SHAPE_MIN_SIZE && box.height < FABRIC_SHAPE_MIN_SIZE) {
      clearSession(true)
      return
    }

    updateFabricShapePreview(session.kind, session.preview, box)
    const shape = session.preview
    shape.set({ selectable: true, evented: true })
    applyFabricEditorObjectControlStyle(shape)
    assignDefaultFabricLayerName(canvas, shape)
    canvas.setActiveObject(shape)
    session = null
    startPoint = null
    canvas.requestRenderAll()
    setTool('select')
  }

  function onMouseDown(opt: { e: TPointerEvent; target?: FabricObject }) {
    const tool = getCurrentTool()
    if (getReadonly() || !isFabricShapeToolName(tool) || getViewportTool?.() === 'hand') {
      return
    }

    const e = opt.e
    if ('button' in e && e.button !== 0) return

    if (session) clearSession(true)

    const point = canvas.getScenePoint(e)
    startPoint = point
    const preview = createFabricShapePreview(tool, {
      left: point.x,
      top: point.y,
      width: 1,
      height: 1,
    })
    canvas.add(preview)
    canvas.discardActiveObject()
    session = { kind: tool, preview }
    canvas.requestRenderAll()
  }

  function onMouseMove(opt: { e: TPointerEvent }) {
    if (!session || !startPoint) return
    const point = canvas.getScenePoint(opt.e)
    const box = normalizeFabricShapeBox(
      startPoint,
      point,
      shouldConstrainFabricShapeSquare(opt.e),
    )
    updateFabricShapePreview(session.kind, session.preview, box)
    canvas.requestRenderAll()
  }

  function onMouseUp(opt: { e: TPointerEvent }) {
    if (!session || !startPoint) return
    commitSession(canvas.getScenePoint(opt.e), opt.e)
  }

  canvas.on('mouse:down', onMouseDown)
  canvas.on('mouse:move', onMouseMove)
  canvas.on('mouse:up', onMouseUp)

  shapeToolControllers.set(canvas, { cancelDraw: () => clearSession(true) })

  return () => {
    clearSession(true)
    canvas.off('mouse:down', onMouseDown)
    canvas.off('mouse:move', onMouseMove)
    canvas.off('mouse:up', onMouseUp)
    shapeToolControllers.delete(canvas)
  }
}

const shapeToolControllers = new WeakMap<Canvas, { cancelDraw: () => void }>()

export function notifyFabricShapeToolChange(canvas: Canvas | undefined): void {
  if (!canvas) return
  shapeToolControllers.get(canvas)?.cancelDraw()
}
