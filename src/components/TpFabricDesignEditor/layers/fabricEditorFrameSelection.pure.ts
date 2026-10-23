import {
  ActiveSelection,
  Group,
  type Canvas,
  type FabricObject,
} from 'fabric'
import { isFabricArtboardGuide } from '../document/fabricArtboard'
import { isFabricEditorPaintClone } from '../appearance/fabricEditorPaintLayers.pure'
import {
  createFabricContainerFromRect,
  isFabricContainerFrame,
  type FabricContainerObject,
} from '../tools/fabricContainerTool.pure'
import { assignDefaultFabricLayerName } from '../layers/fabricLayerNaming.pure'
import { applyFabricEditorObjectControlStyle } from '../selection/fabricEditorSelectionStyle'
import { syncGroupsInteractionFromCanvasSelection } from '../layers/fabricGroupPointerPolicy.pure'

function collectFrameTargets(active: FabricObject): FabricObject[] {
  const raw =
    active instanceof ActiveSelection
      ? (active.getObjects() as FabricObject[])
      : [active]
  return raw.filter(
    (o) =>
      o.visible !== false &&
      !isFabricArtboardGuide(o) &&
      !isFabricContainerFrame(o) &&
      !isFabricEditorPaintClone(o),
  )
}

function sceneAabb(objs: FabricObject[]): {
  left: number
  top: number
  width: number
  height: number
} {
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity
  for (const o of objs) {
    o.setCoords()
    const coords = o.getCoords()
    for (const p of coords) {
      left = Math.min(left, p.x)
      top = Math.min(top, p.y)
      right = Math.max(right, p.x)
      bottom = Math.max(bottom, p.y)
    }
  }
  return {
    left,
    top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
  }
}

/**
 * 将选区打成容器图层（Figma：Frame selection / Ctrl+Alt+G）。
 * 容器尺寸贴合选区包围盒，子对象视觉位置保持不变。
 */
export function frameFabricCanvasSelection(canvas: Canvas): boolean {
  const active = canvas.getActiveObject()
  if (!active) return false

  const targets = collectFrameTargets(active)
  if (!targets.length) return false

  // 先脱 ActiveSelection，让子对象回到画布绝对坐标，再量 AABB
  canvas.discardActiveObject()
  for (const o of targets) {
    o.setCoords()
  }
  const box = sceneAabb(targets)

  // 从真实父 Group 脱出到画布（保留场景位置）；不要提前 canvas.remove
  for (const o of targets) {
    const parent = o.group
    if (parent instanceof Group && !(parent instanceof ActiveSelection)) {
      parent.remove(o)
      if (!canvas.getObjects().includes(o)) {
        canvas.add(o)
      }
      o.setCoords()
    }
  }

  const container = createFabricContainerFromRect(box, {
    label: '容器',
    presetId: 'frame',
  }) as FabricContainerObject
  canvas.add(container)

  // Group.add → enterGroup(removeParentTransform=true) 会从画布取下并换算到组中心系
  for (const o of targets) {
    if (o.group === container) continue
    container.add(o)
  }

  applyFabricEditorObjectControlStyle(container)
  assignDefaultFabricLayerName(canvas, container)
  canvas.setActiveObject(container)
  syncGroupsInteractionFromCanvasSelection(canvas)
  canvas.requestRenderAll()
  return true
}
