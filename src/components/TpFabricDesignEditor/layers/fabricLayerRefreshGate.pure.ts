import type { Canvas } from 'fabric'

const suspended = new WeakSet<Canvas>()

/** 路径编辑临时改动物体树时，暂停图层面板刷新，避免树结构闪动。 */
export function suspendFabricLayerRefresh(canvas: Canvas): void {
  suspended.add(canvas)
}

export function resumeFabricLayerRefresh(canvas: Canvas): void {
  suspended.delete(canvas)
}

export function isFabricLayerRefreshSuspended(canvas: Canvas): boolean {
  return suspended.has(canvas)
}
