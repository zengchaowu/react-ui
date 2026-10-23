import {
  Circle,
  Group,
  Line,
  Path,
  Rect,
  Triangle,
  util,
  type Canvas,
  type FabricObject,
  type TSimplePathData,
} from 'fabric'
import { findDirectChildUnderScenePoint } from '../../layers/fabricGroupPointerPolicy.pure'
import { pathObjectToSceneNodes } from './penPathData.pure'

function circleLocalPathData(cx: number, cy: number, r: number): TSimplePathData {
  // 四分之一圆三次贝塞尔近似，避免 A 弧转换后手柄丢失导致变形
  const k = r * 0.5522847498
  return util.makePathSimpler([
    ['M', cx, cy - r],
    ['C', cx + k, cy - r, cx + r, cy - k, cx + r, cy],
    ['C', cx + r, cy + k, cx + k, cy + r, cx, cy + r],
    ['C', cx - k, cy + r, cx - r, cy + k, cx - r, cy],
    ['C', cx - r, cy - k, cx - k, cy - r, cx, cy - r],
    ['Z'],
  ])
}

function rectLocalPathData(w: number, h: number): TSimplePathData {
  return util.makePathSimpler([
    ['M', 0, 0],
    ['L', w, 0],
    ['L', w, h],
    ['L', 0, h],
    ['Z'],
  ])
}

function copyObjectTransform(
  from: FabricObject,
  to: FabricObject,
): void {
  to.set({
    left: from.left,
    top: from.top,
    angle: from.angle,
    scaleX: from.scaleX,
    scaleY: from.scaleY,
    skewX: from.skewX,
    skewY: from.skewY,
    flipX: from.flipX,
    flipY: from.flipY,
    originX: from.originX,
    originY: from.originY,
    opacity: from.opacity,
    visible: from.visible,
    ...((from as { name?: string }).name
      ? { name: (from as { name?: string }).name }
      : {}),
  })
}

function paintToString(val: unknown): string | undefined {
  if (val == null || val === '') return undefined
  return String(val)
}

function createPathFromLocalData(
  data: TSimplePathData,
  source: FabricObject,
): Path {
  const path = new Path(util.makePathSimpler(data), {
    fill: paintToString(source.fill) ?? '',
    stroke: paintToString(source.stroke) ?? '',
    strokeWidth: source.strokeWidth ?? 0,
    strokeUniform: true,
    objectCaching: false,
  })
  copyObjectTransform(source, path)
  path.setCoords()
  return path
}

export function isPenEditablePath(path: Path): boolean {
  return pathObjectToSceneNodes(path).nodes.length > 0
}

export function convertFabricObjectToPenPath(obj: FabricObject): Path | null {
  if (obj instanceof Path) {
    return isPenEditablePath(obj) ? obj : null
  }

  if (obj instanceof Rect) {
    const w = obj.width ?? 0
    const h = obj.height ?? 0
    if (w <= 0 || h <= 0) return null
    return createPathFromLocalData(rectLocalPathData(w, h), obj)
  }

  if (obj instanceof Circle) {
    const r = obj.radius ?? 0
    if (r <= 0) return null
    return createPathFromLocalData(circleLocalPathData(r, r, r), obj)
  }

  if (obj instanceof Triangle) {
    const w = obj.width ?? 0
    const h = obj.height ?? 0
    if (w <= 0 || h <= 0) return null
    return createPathFromLocalData(
      util.makePathSimpler([
        ['M', w / 2, 0],
        ['L', w, h],
        ['L', 0, h],
        ['Z'],
      ]),
      obj,
    )
  }

  if (obj instanceof Line) {
    const x1 = obj.x1 ?? 0
    const y1 = obj.y1 ?? 0
    const x2 = obj.x2 ?? 0
    const y2 = obj.y2 ?? 0
    return createPathFromLocalData(
      util.makePathSimpler([
        ['M', x1, y1],
        ['L', x2, y2],
      ]),
      obj,
    )
  }

  return null
}

export function collectPathsInObjectTree(obj: FabricObject): Path[] {
  if (obj instanceof Path) {
    return isPenEditablePath(obj) ? [obj] : []
  }
  if (obj instanceof Group) {
    return obj
      .getObjects()
      .flatMap((child) => collectPathsInObjectTree(child as FabricObject))
      .filter((path) => isPenEditablePath(path))
  }
  return []
}

function findPathUnderGroup(
  group: Group,
  scenePoint: { x: number; y: number },
): Path | null {
  const child = findDirectChildUnderScenePoint(group, scenePoint)
  if (!child) return null
  if (child instanceof Path) {
    return isPenEditablePath(child) ? child : null
  }
  if (child instanceof Group) {
    return findPathUnderGroup(child, scenePoint)
  }
  const converted = convertFabricObjectToPenPath(child)
  return converted
}

export function replaceFabricObjectInParent(
  source: FabricObject,
  replacement: FabricObject,
): void {
  const parent = source.group
  const canvas = source.canvas
  if (!canvas) return

  if (parent instanceof Group) {
    const index = parent.getObjects().indexOf(source)
    // convertFabricObjectToPenPath 拷贝的是组内 left/top；
    // Group.insertAt → enterGroup(..., true) 会假定对象在「画布坐标」并反投影到组局部，
    // 若直接塞入局部坐标会双重变换导致双击进钢笔编辑时图层跳位。
    // 先把 replacement 对齐到 source 的场景矩阵，再插入。
    util.applyTransformToObject(replacement, source.calcTransformMatrix())
    parent.remove(source)
    parent.insertAt(index >= 0 ? index : parent.size(), replacement)
  } else {
    const index = canvas.getObjects().indexOf(source)
    canvas.remove(source)
    canvas.insertAt(index >= 0 ? index : canvas.getObjects().length, replacement)
  }
  replacement.setCoords()
}

/**
 * 将形状转为路径（如需）并替换原对象，返回可钢笔编辑的 Path。
 */
export function preparePenEditPath(
  canvas: Canvas,
  target: FabricObject | undefined,
  scenePoint: { x: number; y: number } | null,
): Path | null {
  if (target instanceof Group) {
    if (scenePoint) {
      const hit = findPathUnderGroup(target, scenePoint)
      if (hit) return hit
      const child = findDirectChildUnderScenePoint(target, scenePoint)
      if (child) {
        const converted = convertFabricObjectToPenPath(child)
        if (converted) {
          replaceFabricObjectInParent(child, converted)
          canvas.requestRenderAll()
          return converted
        }
      }
    }

    const paths = collectPathsInObjectTree(target)
    if (paths.length === 1) return paths[0]!
    return null
  }

  const direct = target ? convertFabricObjectToPenPath(target) : null
  if (direct) {
    if (target instanceof Path) return direct
    replaceFabricObjectInParent(target!, direct)
    canvas.requestRenderAll()
    return direct
  }

  if (!target) {
    const active = canvas.getActiveObject() as FabricObject | undefined
    if (!active || active === target) return null
    return preparePenEditPath(canvas, active, scenePoint)
  }

  return null
}
