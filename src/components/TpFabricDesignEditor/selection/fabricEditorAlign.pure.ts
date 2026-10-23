import {
  ActiveSelection,
  Group,
  type Canvas,
  type FabricObject,
} from 'fabric'
import { collectFabricContainersDeep } from '../layers/fabricContainerContainment.pure'
import {
  moveFabricObjectsBy,
  readFabricObjectBounds,
} from '../transform/fabricEditorTransformMetrics.pure'
import { isFabricContainerFrame } from '../tools/fabricContainerTool.pure'

export type FabricAlignMode =
  | 'left'
  | 'center-h'
  | 'right'
  | 'top'
  | 'center-v'
  | 'bottom'
  | 'distribute-h'
  | 'distribute-v'

type Bounds = { left: number; top: number; right: number; bottom: number }

function objectBounds(o: FabricObject): Bounds {
  const r = readFabricObjectBounds(o)
  return {
    left: r.left,
    top: r.top,
    right: r.left + r.width,
    bottom: r.top + r.height,
  }
}

function selectionBounds(objs: FabricObject[]): Bounds {
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity
  for (const o of objs) {
    const b = objectBounds(o)
    left = Math.min(left, b.left)
    top = Math.min(top, b.top)
    right = Math.max(right, b.right)
    bottom = Math.max(bottom, b.bottom)
  }
  return { left, top, right, bottom }
}

function containsBounds(outer: Bounds, inner: Bounds): boolean {
  return (
    inner.left >= outer.left - 0.5 &&
    inner.top >= outer.top - 0.5 &&
    inner.right <= outer.right + 0.5 &&
    inner.bottom <= outer.bottom + 0.5
  )
}

/** 结构父级：跳过 ActiveSelection，取真实 Group / 容器 */
function getStructuralParent(obj: FabricObject): Group | null {
  let g: Group | undefined = obj.group as Group | undefined
  while (g) {
    if (g instanceof ActiveSelection) {
      g = (g as FabricObject).group as Group | undefined
      continue
    }
    if (g instanceof Group) return g
    break
  }
  return null
}

/**
 * 若选中对象同属一个父 Group/容器，返回该父级包围盒。
 * 多选进入 ActiveSelection 后 group 会断掉时，回退为几何上能包住选区的最深容器。
 */
function resolveParentReferenceBounds(
  canvas: Canvas | null | undefined,
  objs: FabricObject[],
): Bounds | null {
  if (!objs.length) return null

  const structural = getStructuralParent(objs[0]!)
  if (
    structural &&
    objs.every((o) => getStructuralParent(o) === structural)
  ) {
    return objectBounds(structural)
  }

  if (!canvas) return null

  const sel = selectionBounds(objs)
  const containers = collectFabricContainersDeep(canvas.getObjects())
  let best: Bounds | null = null
  let bestArea = Infinity
  for (const c of containers) {
    if (objs.includes(c)) continue
    const b = objectBounds(c)
    if (!containsBounds(b, sel)) continue
    const area = (b.right - b.left) * (b.bottom - b.top)
    if (area < bestArea) {
      bestArea = area
      best = b
    }
  }
  return best
}

/**
 * 对齐参照框：
 * - 水平/垂直居中：优先相对父容器（或父编组）
 * - 单选其它对齐：有父级则相对父级，否则画板（若有）
 * - 多选其它对齐：相对选区包围盒
 */
function resolveAlignReferenceBox(
  objs: FabricObject[],
  mode: FabricAlignMode,
  artboard?: { width: number; height: number } | null,
  canvas?: Canvas | null,
): Bounds {
  const parentBox = resolveParentReferenceBounds(canvas, objs)
  const isCenter = mode === 'center-h' || mode === 'center-v'

  if (isCenter && parentBox) {
    return parentBox
  }

  if (objs.length === 1 && parentBox) {
    return parentBox
  }

  if (objs.length === 1 && artboard) {
    return {
      left: 0,
      top: 0,
      right: artboard.width,
      bottom: artboard.height,
    }
  }

  return selectionBounds(objs)
}

export function alignFabricObjects(
  objs: FabricObject[],
  mode: FabricAlignMode,
  artboard?: { width: number; height: number } | null,
  canvas?: Canvas | null,
): void {
  if (!objs.length) return

  const work = objs.filter((o) => !isFabricContainerFrame(o))
  if (!work.length) return

  if (mode === 'distribute-h') {
    if (work.length < 3) return
    const sorted = [...work].sort(
      (a, b) => objectBounds(a).left - objectBounds(b).left,
    )
    const first = objectBounds(sorted[0]!)
    const last = objectBounds(sorted[sorted.length - 1]!)
    const totalWidth = sorted.reduce(
      (sum, o) => sum + readFabricObjectBounds(o).width,
      0,
    )
    const gap =
      (last.left -
        first.left -
        totalWidth +
        readFabricObjectBounds(sorted[sorted.length - 1]!).width) /
      (sorted.length - 1)
    let cursor = first.left
    for (const o of sorted) {
      const b = objectBounds(o)
      const dx = cursor - b.left
      if (dx) moveFabricObjectsBy([o], dx, 0)
      cursor += readFabricObjectBounds(o).width + gap
    }
    return
  }

  if (mode === 'distribute-v') {
    if (work.length < 3) return
    const sorted = [...work].sort(
      (a, b) => objectBounds(a).top - objectBounds(b).top,
    )
    const first = objectBounds(sorted[0]!)
    const last = objectBounds(sorted[sorted.length - 1]!)
    const totalHeight = sorted.reduce(
      (sum, o) => sum + readFabricObjectBounds(o).height,
      0,
    )
    const gap =
      (last.top -
        first.top -
        totalHeight +
        readFabricObjectBounds(sorted[sorted.length - 1]!).height) /
      (sorted.length - 1)
    let cursor = first.top
    for (const o of sorted) {
      const b = objectBounds(o)
      const dy = cursor - b.top
      if (dy) moveFabricObjectsBy([o], 0, dy)
      cursor += readFabricObjectBounds(o).height + gap
    }
    return
  }

  const box = resolveAlignReferenceBox(work, mode, artboard, canvas)

  for (const o of work) {
    const b = objectBounds(o)
    let dx = 0
    let dy = 0
    switch (mode) {
      case 'left':
        dx = box.left - b.left
        break
      case 'center-h': {
        const target =
          box.left + (box.right - box.left - readFabricObjectBounds(o).width) / 2
        dx = target - b.left
        break
      }
      case 'right':
        dx = box.right - b.right
        break
      case 'top':
        dy = box.top - b.top
        break
      case 'center-v': {
        const target =
          box.top + (box.bottom - box.top - readFabricObjectBounds(o).height) / 2
        dy = target - b.top
        break
      }
      case 'bottom':
        dy = box.bottom - b.bottom
        break
      default:
        break
    }
    if (dx || dy) moveFabricObjectsBy([o], dx, dy)
  }
}

export function alignCanvasSelection(
  canvas: Canvas,
  mode: FabricAlignMode,
  artboard?: { width: number; height: number } | null,
): void {
  const objs = canvas.getActiveObjects()
  if (!objs.length) return
  alignFabricObjects(objs, mode, artboard, canvas)
}
