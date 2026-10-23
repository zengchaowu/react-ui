import { ActiveSelection, Group, type Canvas, type FabricObject } from 'fabric'
import { isFabricArtboardGuide } from '../document/fabricArtboard'
import { isFabricEditorPaintClone } from '../appearance/fabricEditorPaintLayers.pure'
import {
  isFabricContainerFrame,
  isFabricContainerObject,
  type FabricContainerObject,
} from '../tools/fabricContainerTool.pure'
import { reparentFabricObjectIntoContainer } from './fabricContainerContainment.pure'
import { applyFabricContainerLayoutIfNeeded } from './fabricContainerLayout.pure'

export type LayerTreeReorderPosition = 'before' | 'after' | 'inside'

export function isFabricLayerTreeStackObject(obj: FabricObject): boolean {
  return (
    !isFabricArtboardGuide(obj) &&
    !isFabricEditorPaintClone(obj) &&
    !isFabricContainerFrame(obj)
  )
}

type LayerParent = Canvas | Group

function getLayerParent(obj: FabricObject, canvas: Canvas): LayerParent {
  const g = obj.group
  if (g instanceof Group && !(g instanceof ActiveSelection)) return g
  return canvas
}

function getLayerSiblings(parent: LayerParent, canvas: Canvas): FabricObject[] {
  const raw =
    parent === canvas
      ? canvas.getObjects()
      : (parent as Group).getObjects()
  return raw.filter((o) => isFabricLayerTreeStackObject(o as FabricObject))
}

function isDescendantOf(candidate: FabricObject, ancestor: FabricObject): boolean {
  let cur: FabricObject | undefined = candidate
  while (cur) {
    if (cur === ancestor) return true
    cur = cur.group as FabricObject | undefined
  }
  return false
}

function collectPaintClonesByOwner(canvas: Canvas): Map<string, FabricObject[]> {
  const clonesByOwner = new Map<string, FabricObject[]>()
  for (const o of canvas.getObjects()) {
    if (!isFabricEditorPaintClone(o)) continue
    const ownerId = (
      o as FabricObject & { editorPaintClone?: { ownerId?: string } }
    ).editorPaintClone?.ownerId
    if (!ownerId) continue
    const list = clonesByOwner.get(ownerId) ?? []
    list.push(o)
    clonesByOwner.set(ownerId, list)
  }
  return clonesByOwner
}

function applyCanvasRootOrder(canvas: Canvas, orderedRoots: FabricObject[]) {
  const clonesByOwner = collectPaintClonesByOwner(canvas)
  const stack: FabricObject[] = []

  for (const root of orderedRoots) {
    stack.push(root)
    const ownerId = (root as FabricObject & { editorPaintOwnerId?: string })
      .editorPaintOwnerId
    if (ownerId) {
      stack.push(...(clonesByOwner.get(ownerId) ?? []))
    }
  }

  for (let i = 0; i < stack.length; i++) {
    const obj = stack[i]!
    if (canvas.getObjects().indexOf(obj) !== i) {
      canvas.moveObjectTo(obj, i)
    }
  }
}

function applySiblingOrder(
  canvas: Canvas,
  parent: LayerParent,
  ordered: FabricObject[],
) {
  if (parent === canvas) {
    applyCanvasRootOrder(canvas, ordered)
    return
  }

  ordered.forEach((obj, index) => {
    ;(parent as Group).moveObjectTo(obj, index)
  })
}

function reorderAmongSiblings(
  canvas: Canvas,
  dragObj: FabricObject,
  dropObj: FabricObject,
  position: 'before' | 'after',
  parent: LayerParent,
): boolean {
  const siblings = getLayerSiblings(parent, canvas)
  const dragIdx = siblings.indexOf(dragObj)
  const dropIdx = siblings.indexOf(dropObj)
  if (dragIdx < 0 || dropIdx < 0) return false

  const treeOrder = [...siblings].reverse()
  const dragTreeIdx = treeOrder.indexOf(dragObj)
  const dropTreeIdx = treeOrder.indexOf(dropObj)
  if (dragTreeIdx < 0 || dropTreeIdx < 0) return false

  treeOrder.splice(dragTreeIdx, 1)
  let insertTreeIdx = position === 'before' ? dropTreeIdx : dropTreeIdx + 1
  if (dragTreeIdx < dropTreeIdx) insertTreeIdx -= 1
  insertTreeIdx = Math.max(0, Math.min(treeOrder.length, insertTreeIdx))
  treeOrder.splice(insertTreeIdx, 0, dragObj)

  applySiblingOrder(canvas, parent, [...treeOrder].reverse())
  applyFabricContainerLayoutIfNeeded(
    parent === canvas ? null : (parent as FabricObject),
  )
  return true
}

/**
 * 图层面板拖拽：同级排序，或拖入容器 / 跨父级挂到 drop 同级。
 */
export function reorderFabricLayerTreeSiblings(
  canvas: Canvas,
  dragObj: FabricObject,
  dropObj: FabricObject,
  position: LayerTreeReorderPosition,
): boolean {
  if (dragObj === dropObj) return false
  if (isDescendantOf(dropObj, dragObj)) return false
  if (isFabricContainerFrame(dragObj) || isFabricContainerFrame(dropObj)) {
    return false
  }

  if (position === 'inside') {
    if (!isFabricContainerObject(dropObj)) return false
    const ok = reparentFabricObjectIntoContainer(canvas, dragObj, dropObj)
    if (ok) canvas.requestRenderAll()
    return ok
  }

  const dragParent = getLayerParent(dragObj, canvas)
  const dropParent = getLayerParent(dropObj, canvas)

  if (dragParent === dropParent) {
    const ok = reorderAmongSiblings(
      canvas,
      dragObj,
      dropObj,
      position,
      dragParent,
    )
    if (ok) canvas.requestRenderAll()
    return ok
  }

  // 跨父级：先挂到 drop 的父级，再按 before/after 排序
  if (dropParent === canvas) {
    const owning = getLayerParent(dragObj, canvas)
    if (owning !== canvas) {
      reparentFabricObjectIntoContainer(canvas, dragObj, null)
      if (getLayerParent(dragObj, canvas) !== canvas) {
        const g =
          dragObj.group instanceof Group &&
          !(dragObj.group instanceof ActiveSelection)
            ? dragObj.group
            : null
        if (g) g.remove(dragObj)
        if (!canvas.getObjects().includes(dragObj)) canvas.add(dragObj)
      }
    }
  } else if (isFabricContainerObject(dropParent as FabricObject)) {
    if (
      !reparentFabricObjectIntoContainer(
        canvas,
        dragObj,
        dropParent as FabricContainerObject,
      )
    ) {
      return false
    }
  } else {
    const owning =
      dragObj.group instanceof Group && !(dragObj.group instanceof ActiveSelection)
        ? dragObj.group
        : null
    if (owning) owning.remove(dragObj)
    else if (canvas.getObjects().includes(dragObj)) canvas.remove(dragObj)
    ;(dropParent as Group).add(dragObj)
  }

  const ok = reorderAmongSiblings(
    canvas,
    dragObj,
    dropObj,
    position,
    dropParent,
  )
  if (ok) canvas.requestRenderAll()
  return ok
}
