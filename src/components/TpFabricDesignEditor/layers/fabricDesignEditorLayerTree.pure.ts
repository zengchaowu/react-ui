import { ActiveSelection, Group, type Canvas, type FabricObject } from 'fabric'
import {
  applyOpenGroupPointerPolicy,
  syncGroupsInteractionFromCanvasSelection,
} from './fabricGroupPointerPolicy.pure'
import { fabricLayerTypeBaseLabel } from './fabricLayerNaming.pure'

/**
 * 图层树点击后用于 `canvas.setActiveObject` 的目标。
 * SVG 导入后子路径常为 `selectable: false`，若直接激活子对象，Fabric 会从编组中错误拆解或重算坐标导致「跳位」；
 * 沿父链上升到首个可作为画布选中目标的祖先（一般为根 Group）。
 */
export function resolveFabricObjectForCanvasActivation(o: FabricObject): FabricObject {
  let cur = o
  while (cur.group && cur.selectable === false) {
    cur = cur.group as FabricObject
  }
  return cur
}

/**
 * 沿父 Group 链向上，直到画布上的顶层对象（`canvas.getObjects()` 中的那一层）。
 * 用于扁平图层面板：选中组内子对象时，树仍只高亮对应的顶层「编组」或根图层一行。
 */
export function fabricTopLevelOnCanvas(o: FabricObject): FabricObject {
  let cur = o
  while (cur.group) {
    cur = cur.group as FabricObject
  }
  return cur
}

/** 图层面板选中：必要时打开父编组命中，并激活目标对象。 */
export function activateFabricObjectFromLayerTree(
  canvas: Canvas,
  target: FabricObject,
): void {
  activateFabricObjectsFromLayerTree(canvas, [target])
}

/** 图层面板多选：激活一个或多个对象（≥2 时使用 ActiveSelection）。 */
export function activateFabricObjectsFromLayerTree(
  canvas: Canvas,
  targets: FabricObject[],
): void {
  if (!targets.length) {
    canvas.discardActiveObject()
    syncGroupsInteractionFromCanvasSelection(canvas)
    canvas.requestRenderAll()
    return
  }

  for (const target of targets) {
    let ancestor: FabricObject | undefined = target
    while (ancestor?.group) {
      const g = ancestor.group as Group
      if (g instanceof Group && !(g instanceof ActiveSelection)) {
        applyOpenGroupPointerPolicy(g)
      }
      ancestor = g as FabricObject
    }
  }

  const actives = targets.map((target) =>
    target.selectable === false
      ? resolveFabricObjectForCanvasActivation(target)
      : target,
  )

  if (actives.length === 1) {
    canvas.setActiveObject(actives[0]!)
  } else {
    canvas.setActiveObject(new ActiveSelection(actives, { canvas }))
  }
  syncGroupsInteractionFromCanvasSelection(canvas)
  canvas.requestRenderAll()
}

/**
 * 画布场景坐标下的轴对齐包围盒尺寸（px），含缩放/旋转后的视觉占位。
 * 与 Fabric 控制框一致时使用 {@link FabricObject.getBoundingRect}。
 */
export function layerDimensionsLabel(o: FabricObject): string {
  try {
    const r = o.getBoundingRect()
    const w = Math.round(r.width * 10) / 10
    const h = Math.round(r.height * 10) / 10
    if (!Number.isFinite(w) || !Number.isFinite(h)) return ''
    return `${w}×${h}`
  } catch {
    return ''
  }
}

/** 图层面板展示名；优先使用对象 `name`（如「矩形 1」） */
export function layerLabelForFabricObject(o: FabricObject): string {
  const custom = String((o as { name?: unknown }).name ?? '').trim()
  if (custom) return custom
  return fabricLayerTypeBaseLabel(o)
}

export function setFabricLayerDisplayName(o: FabricObject, name: string): void {
  o.set('name', name.trim())
}

/** 图层是否处于「锁定」态（移动/缩放/旋转均锁定） */
export function isFabricLayerLocked(o: FabricObject): boolean {
  const custom = (o as FabricObject & { layerLocked?: unknown }).layerLocked
  if (typeof custom === 'boolean') return custom
  return Boolean(
    o.lockMovementX &&
      o.lockMovementY &&
      o.lockScalingX &&
      o.lockScalingY &&
      o.lockRotation,
  )
}

/** 锁定/解锁图层或编组（仍可选中，不可变换） */
export function setFabricLayerLocked(o: FabricObject, locked: boolean): void {
  o.set({
    layerLocked: locked,
    lockMovementX: locked,
    lockMovementY: locked,
    lockScalingX: locked,
    lockScalingY: locked,
    lockRotation: locked,
    lockSkewingX: locked,
    lockSkewingY: locked,
  })
}

/** 显示/隐藏图层或编组 */
export function setFabricLayerVisible(o: FabricObject, visible: boolean): void {
  o.set({ visible })
}

/**
 * 导出 SVG 下载名的语义化基底（与图层面板 {@link layerLabelForFabricObject} 一致；多选框单独命名）。
 */
export function layerExportBasenameForSvg(o: FabricObject): string {
  if (o instanceof ActiveSelection) {
    const objs = o.getObjects()
    const n = objs.length
    if (n === 1 && objs[0]) return layerLabelForFabricObject(objs[0])
    return `多选 (${n})`
  }
  return layerLabelForFabricObject(o)
}

/** 去掉路径非法字符，避免下载失败；过长截断 */
export function sanitizeSvgFilenameBase(raw: string, fallback: string): string {
  let s = raw.replace(/\s+/g, ' ').trim()
  if (!s) return fallback
  s = s.replace(/[/\\:*?"<>|\u0000-\u001f]/g, '_').replace(/_+/g, '_').trim()
  if (!s) return fallback
  const max = 100
  return s.length > max ? s.slice(0, max) : s
}
