import type { Canvas, FabricObject, TPointerEvent } from 'fabric'
import { applyFabricEditorObjectControlStyle } from '../selection/fabricEditorSelectionStyle'
import {
  createFabricContainerFromRect,
  createFabricContainerObject,
  setFabricContainerSceneRect,
  type FabricContainerObject,
} from '../tools/fabricContainerTool.pure'
import { assignDefaultFabricLayerName } from '../layers/fabricLayerNaming.pure'
import { resolveFabricContainerPreset } from '../tools/fabricContainerPresets.pure'
import {
  FABRIC_SHAPE_MIN_SIZE,
  normalizeFabricShapeBox,
} from '../tools/fabricShapeTool.pure'
import type { TpFabricDesignEditorTool } from '../types'

/** 单击（未拖拽）时默认容器尺寸，对齐 Figma 空 Frame */
export const FABRIC_DEFAULT_FRAME_SIZE = { width: 100, height: 100 } as const

type FrameSession = {
  preview: FabricContainerObject
  start: { x: number; y: number }
}

/**
 * 容器工具（Figma Frame）：
 * - 按住拖拽绘制任意尺寸容器图层
 * - 单击且选了机型预设：按预设尺寸落下
 * - 单击无预设：落下默认 100×100 空白容器
 */
export function attachFabricContainerTool(options: {
  canvas: Canvas
  getReadonly: () => boolean
  getCurrentTool: () => string
  getActiveContainerPresetId: () => string | null
  getViewportTool?: () => 'select' | 'hand'
  setTool: (tool: TpFabricDesignEditorTool) => void
}): () => void {
  const {
    canvas,
    getReadonly,
    getCurrentTool,
    getActiveContainerPresetId,
    getViewportTool,
    setTool,
  } = options

  let session: FrameSession | null = null

  function clearSession(removePreview = true) {
    if (removePreview && session?.preview) {
      canvas.remove(session.preview)
    }
    session = null
    canvas.requestRenderAll()
  }

  function finishAsSelect(container: FabricContainerObject) {
    applyFabricEditorObjectControlStyle(container)
    assignDefaultFabricLayerName(canvas, container)
    canvas.setActiveObject(container)
    canvas.requestRenderAll()
    setTool('select')
  }

  function commitDrag(end: { x: number; y: number }) {
    if (!session) return
    const box = normalizeFabricShapeBox(session.start, end, false)
    const dragged =
      box.width >= FABRIC_SHAPE_MIN_SIZE || box.height >= FABRIC_SHAPE_MIN_SIZE

    if (!dragged) {
      // 视为单击：按预设或默认尺寸在起点落下
      canvas.remove(session.preview)
      session = null
      placeClickFrame(end)
      return
    }

    setFabricContainerSceneRect(session.preview, {
      left: box.left,
      top: box.top,
      width: Math.max(FABRIC_SHAPE_MIN_SIZE, box.width),
      height: Math.max(FABRIC_SHAPE_MIN_SIZE, box.height),
    })
    const container = session.preview
    container.set({ selectable: true, evented: true })
    session = null
    finishAsSelect(container)
  }

  function placeClickFrame(point: { x: number; y: number }) {
    const presetId = getActiveContainerPresetId()
    const preset = presetId ? resolveFabricContainerPreset(presetId) : null
    const container = preset
      ? createFabricContainerObject(preset, point)
      : createFabricContainerFromRect(
          {
            left: point.x - FABRIC_DEFAULT_FRAME_SIZE.width / 2,
            top: point.y - FABRIC_DEFAULT_FRAME_SIZE.height / 2,
            width: FABRIC_DEFAULT_FRAME_SIZE.width,
            height: FABRIC_DEFAULT_FRAME_SIZE.height,
          },
          { label: '容器', presetId: 'frame' },
        )
    canvas.add(container)
    finishAsSelect(container)
  }

  function onMouseDown(opt: { e: TPointerEvent; target?: FabricObject }) {
    if (getReadonly() || getCurrentTool() !== 'frame') return
    if (getViewportTool?.() === 'hand') return

    const e = opt.e
    if ('button' in e && e.button !== 0) return

    if (session) clearSession(true)

    const point = canvas.getScenePoint(e)
    const preview = createFabricContainerFromRect(
      { left: point.x, top: point.y, width: 1, height: 1 },
      {
        label: '容器',
        presetId: getActiveContainerPresetId() ?? 'frame',
      },
    )
    preview.set({ selectable: false, evented: false })
    canvas.add(preview)
    canvas.discardActiveObject()
    session = { preview, start: point }
    canvas.requestRenderAll()
  }

  function onMouseMove(opt: { e: TPointerEvent }) {
    if (!session) return
    const point = canvas.getScenePoint(opt.e)
    const box = normalizeFabricShapeBox(session.start, point, false)
    setFabricContainerSceneRect(session.preview, {
      left: box.left,
      top: box.top,
      width: Math.max(1, box.width),
      height: Math.max(1, box.height),
    })
    canvas.requestRenderAll()
  }

  function onMouseUp(opt: { e: TPointerEvent }) {
    if (!session) return
    const point = canvas.getScenePoint(opt.e)
    commitDrag(point)
  }

  canvas.on('mouse:down', onMouseDown)
  canvas.on('mouse:move', onMouseMove)
  canvas.on('mouse:up', onMouseUp)

  return () => {
    clearSession(true)
    canvas.off('mouse:down', onMouseDown)
    canvas.off('mouse:move', onMouseMove)
    canvas.off('mouse:up', onMouseUp)
  }
}
