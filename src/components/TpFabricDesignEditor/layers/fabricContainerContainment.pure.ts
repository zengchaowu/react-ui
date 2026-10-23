import {
  ActiveSelection,
  Group,
  Point,
  type Canvas,
  type FabricObject,
} from 'fabric'
import {
  isFabricContainerFrame,
  isFabricContainerObject,
  type FabricContainerObject,
} from '../tools/fabricContainerTool.pure'
import { isFabricArtboardGuide } from '../document/fabricArtboard'
import { isFabricEditorPaintClone } from '../appearance/fabricEditorPaintLayers.pure'
import { applyFabricContainerLayoutIfNeeded } from './fabricContainerLayout.pure'

function isDescendantOf(
  candidate: FabricObject,
  ancestor: FabricObject,
): boolean {
  let cur: FabricObject | undefined = candidate
  while (cur) {
    if (cur === ancestor) return true
    cur = cur.group as FabricObject | undefined
  }
  return false
}

function getOwningGroup(obj: FabricObject): Group | null {
  const g = obj.group
  if (g instanceof Group && !(g instanceof ActiveSelection)) return g
  return null
}

function objectCenterScene(obj: FabricObject): Point {
  return obj.getCenterPoint()
}

function containerContainsScenePoint(
  container: FabricContainerObject,
  point: Point,
): boolean {
  try {
    return container.containsPoint(point)
  } catch {
    const r = container.getBoundingRect()
    return (
      point.x >= r.left &&
      point.x <= r.left + r.width &&
      point.y >= r.top &&
      point.y <= r.top + r.height
    )
  }
}

/** 深度优先收集容器（含嵌套）。 */
export function collectFabricContainersDeep(
  objects: FabricObject[],
): FabricContainerObject[] {
  const out: FabricContainerObject[] = []
  for (const obj of objects) {
    if (isFabricArtboardGuide(obj) || isFabricEditorPaintClone(obj)) continue
    if (obj.visible === false) continue
    if (isFabricContainerObject(obj)) {
      out.push(obj)
      out.push(
        ...collectFabricContainersDeep(
          (obj.getObjects() as FabricObject[]).filter(
            (c) => !isFabricContainerFrame(c),
          ),
        ),
      )
    } else if (obj instanceof Group && !(obj instanceof ActiveSelection)) {
      out.push(
        ...collectFabricContainersDeep(obj.getObjects() as FabricObject[]),
      )
    }
  }
  return out
}

/**
 * 命中最深一层容器（嵌套时取最内层）；排除自身及其子孙。
 */
export function findDeepestContainerAtScenePoint(
  canvas: Canvas,
  point: Point,
  exclude: Iterable<FabricObject> = [],
): FabricContainerObject | null {
  const excluded = new Set(exclude)
  const containers = collectFabricContainersDeep(canvas.getObjects()).filter(
    (c) => {
      if (excluded.has(c)) return false
      for (const e of excluded) {
        if (isDescendantOf(c, e)) return false
      }
      return true
    },
  )

  let best: FabricContainerObject | null = null
  let bestDepth = -1
  for (const c of containers) {
    if (!containerContainsScenePoint(c, point)) continue
    let depth = 0
    let p: FabricObject | undefined = c.group as FabricObject | undefined
    while (p) {
      depth += 1
      p = p.group as FabricObject | undefined
    }
    if (depth >= bestDepth) {
      best = c
      bestDepth = depth
    }
  }
  return best
}

/**
 * 将对象挂到目标容器（或挂回画布根）。保持屏幕视觉位置不变。
 */
export function reparentFabricObjectIntoContainer(
  canvas: Canvas,
  obj: FabricObject,
  container: FabricContainerObject | null,
): boolean {
  if (!obj || isFabricContainerFrame(obj) || isFabricArtboardGuide(obj)) {
    return false
  }
  if (obj instanceof ActiveSelection) return false

  if (container) {
    if (container === obj) return false
    if (isDescendantOf(container, obj)) return false
    const owning = getOwningGroup(obj)
    if (owning === container) return false

    if (owning) {
      owning.remove(obj)
    } else if (canvas.getObjects().includes(obj)) {
      canvas.remove(obj)
    }

    container.add(obj)
    // 内容放在画板矩形之上
    const objs = container.getObjects()
    const idx = objs.indexOf(obj)
    if (idx >= 0 && idx !== objs.length - 1) {
      container.moveObjectTo(obj, objs.length - 1)
    }
    obj.setCoords()
    container.setCoords()
    applyFabricContainerLayoutIfNeeded(container)
    return true
  }

  // 迁出到画布根：仅当当前在容器（或其内普通编组且祖先含容器）中
  const owning = getOwningGroup(obj)
  if (!owning) return false
  if (!isFabricContainerObject(owning) && !hasContainerAncestor(owning)) {
    return false
  }

  const prevOwner = owning
  owning.remove(obj)
  canvas.add(obj)
  obj.setCoords()
  if (isFabricContainerObject(prevOwner)) {
    applyFabricContainerLayoutIfNeeded(prevOwner)
  }
  return true
}

function hasContainerAncestor(obj: FabricObject): boolean {
  let p: FabricObject | undefined = obj
  while (p) {
    if (isFabricContainerObject(p)) return true
    p = p.group as FabricObject | undefined
  }
  return false
}

/**
 * 拖动结束后：按选区中心落入的最深容器做挂载 / 脱出。
 */
export function reparentActiveSelectionAfterDrag(canvas: Canvas): boolean {
  const active = canvas.getActiveObject()
  if (!active || active.visible === false) return false

  const movingObjects: FabricObject[] =
    active instanceof ActiveSelection
      ? (active.getObjects() as FabricObject[])
      : [active]

  if (!movingObjects.length) return false

  const exclude = new Set<FabricObject>()
  for (const o of movingObjects) {
    exclude.add(o)
    if (o instanceof Group) {
      for (const c of collectFabricContainersDeep([o])) exclude.add(c)
    }
  }

  const center = objectCenterScene(active)
  const hit = findDeepestContainerAtScenePoint(canvas, center, exclude)

  // 已在同一容器内且未拖到其他容器 → 无操作
  if (!(active instanceof ActiveSelection)) {
    const owning = getOwningGroup(active)
    if (hit && owning === hit) return false
    if (!hit && (!owning || !isFabricContainerObject(owning))) return false
  } else {
    const allAlready =
      hit != null &&
      movingObjects.every((o) => getOwningGroup(o) === hit)
    const noneNeedExit =
      hit == null &&
      movingObjects.every((o) => {
        const owning = getOwningGroup(o)
        return !owning || !isFabricContainerObject(owning)
      })
    if (allAlready || noneNeedExit) return false
  }

  if (active instanceof ActiveSelection) {
    canvas.discardActiveObject()
    let changed = false
    for (const o of movingObjects) {
      if (reparentFabricObjectIntoContainer(canvas, o, hit)) changed = true
    }
    if (!changed) {
      if (movingObjects.length === 1) {
        canvas.setActiveObject(movingObjects[0]!)
      } else {
        canvas.setActiveObject(new ActiveSelection(movingObjects, { canvas }))
      }
      return false
    }
    if (movingObjects.length === 1) {
      canvas.setActiveObject(movingObjects[0]!)
    } else {
      canvas.setActiveObject(new ActiveSelection(movingObjects, { canvas }))
    }
    canvas.requestRenderAll()
    return true
  }

  const ok = reparentFabricObjectIntoContainer(canvas, active, hit)
  if (ok) {
    canvas.setActiveObject(active)
    canvas.requestRenderAll()
  }
  return ok
}
