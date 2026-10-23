import { Rect, type Canvas, type FabricObject } from 'fabric'
import {
  getFabricContainerCornerRadius,
  isFabricContainerObject,
  setFabricContainerCornerRadius,
} from '../tools/fabricContainerTool.pure'

export type FabricTransformBounds = {
  left: number
  top: number
  width: number
  height: number
}

export function roundTransformMetric(n: number): number {
  return Math.round(n)
}

export function readFabricObjectBounds(o: FabricObject): FabricTransformBounds {
  const r = o.getBoundingRect()
  return {
    left: roundTransformMetric(r.left),
    top: roundTransformMetric(r.top),
    width: roundTransformMetric(r.width),
    height: roundTransformMetric(r.height),
  }
}

export function readCanvasSelectionBounds(
  canvas: Canvas,
): FabricTransformBounds | null {
  const objs = canvas.getActiveObjects()
  if (!objs.length) return null

  if (objs.length === 1) {
    return readFabricObjectBounds(objs[0]!)
  }

  let minL = Infinity
  let minT = Infinity
  let maxR = -Infinity
  let maxB = -Infinity

  for (const o of objs) {
    const r = o.getBoundingRect()
    minL = Math.min(minL, r.left)
    minT = Math.min(minT, r.top)
    maxR = Math.max(maxR, r.left + r.width)
    maxB = Math.max(maxB, r.top + r.height)
  }

  return {
    left: roundTransformMetric(minL),
    top: roundTransformMetric(minT),
    width: roundTransformMetric(maxR - minL),
    height: roundTransformMetric(maxB - minT),
  }
}

export function moveFabricObjectsBy(
  objs: FabricObject[],
  dx: number,
  dy: number,
): void {
  for (const o of objs) {
    o.set({
      left: (o.left ?? 0) + dx,
      top: (o.top ?? 0) + dy,
    })
    o.setCoords()
  }
}

export function resizeFabricObjectWidth(
  o: FabricObject,
  targetWidth: number,
  lockAspect = false,
): void {
  const baseW = o.width ?? o.getBoundingRect().width
  const baseH = o.height ?? o.getBoundingRect().height
  if (!baseW || !Number.isFinite(targetWidth) || targetWidth <= 0) return

  const scaleX = targetWidth / baseW
  const patch: { scaleX: number; scaleY?: number } = { scaleX }
  if (lockAspect && baseH) {
    patch.scaleY = (baseH * (o.scaleY ?? 1)) / baseH * scaleX
    patch.scaleY = scaleX * ((o.scaleY ?? 1) / (o.scaleX ?? 1))
    const ratio = (o.scaleY ?? 1) / (o.scaleX ?? 1)
    patch.scaleY = scaleX * ratio
  }
  o.set(patch)
  o.setCoords()
}

export function resizeFabricObjectHeight(
  o: FabricObject,
  targetHeight: number,
  lockAspect = false,
): void {
  const baseH = o.height ?? o.getBoundingRect().height
  const baseW = o.width ?? o.getBoundingRect().width
  if (!baseH || !Number.isFinite(targetHeight) || targetHeight <= 0) return

  const scaleY = targetHeight / baseH
  const patch: { scaleY: number; scaleX?: number } = { scaleY }
  if (lockAspect && baseW) {
    const ratio = (o.scaleX ?? 1) / (o.scaleY ?? 1)
    patch.scaleX = scaleY * ratio
  }
  o.set(patch)
  o.setCoords()
}

export function readFabricCornerRadius(o: FabricObject): number | null {
  if (isFabricContainerObject(o)) {
    return roundTransformMetric(getFabricContainerCornerRadius(o))
  }
  if (o.type !== 'rect') return null
  const rect = o as Rect
  const rx = rect.rx ?? 0
  return roundTransformMetric(rx)
}

export function applyFabricCornerRadius(o: FabricObject, radius: number): void {
  if (isFabricContainerObject(o)) {
    setFabricContainerCornerRadius(o, radius)
    return
  }
  if (o.type !== 'rect') return
  const n = Math.max(0, radius)
  o.set({ rx: n, ry: n })
  o.setCoords()
}
