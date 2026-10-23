import {
  ActiveSelection,
  Group,
  Point,
  type Canvas,
  type FabricObject,
} from 'fabric'
import {
  isFabricContainerFrame,
} from '../tools/fabricContainerTool.pure'

/** 画板 Rect 永不可交互（避免双击下钻后被单独拖走） */
export function lockFabricContainerFrameInteraction(obj: FabricObject): void {
  if (!isFabricContainerFrame(obj)) return
  obj.set({
    evented: false,
    selectable: false,
    hasControls: false,
    hasBorders: false,
    lockMovementX: true,
    lockMovementY: true,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
  })
}

/** 闭组：单击命中整组；子对象不抢事件（需双击下钻一层） */
export function applyClosedGroupPointerPolicy(group: Group): void {
  group.set({ subTargetCheck: false, interactive: true })
  for (const raw of group.getObjects()) {
    const o = raw as FabricObject
    if (isFabricContainerFrame(o)) {
      lockFabricContainerFrameInteraction(o)
      continue
    }
    o.set({ evented: false, selectable: false, hasControls: false })
  }
}

/** 已深入选中组内对象：允许在组内命中同级子对象 */
export function applyOpenGroupPointerPolicy(group: Group): void {
  group.set({ subTargetCheck: true, interactive: true })
  for (const raw of group.getObjects()) {
    const o = raw as FabricObject
    if (isFabricContainerFrame(o)) {
      lockFabricContainerFrameInteraction(o)
      continue
    }
    o.set({ evented: true, selectable: true, hasControls: true })
  }
}

/** `obj` 的任一祖先编组是否为 `ancestor`（含直接父组） */
export function hasAncestorGroup(obj: FabricObject, ancestor: Group): boolean {
  let g: Group | undefined = obj.group
  while (g) {
    if (g === ancestor) {
      return true
    }
    g = (g as FabricObject).group as Group | undefined
  }
  return false
}

/** 收集画布上所有普通 Group（不含 ActiveSelection），含嵌套 */
export function collectAllGroupsDepthFirst(objects: FabricObject[]): Group[] {
  const out: Group[] = []
  for (const o of objects) {
    if (o instanceof Group && !(o instanceof ActiveSelection)) {
      out.push(o)
      out.push(...collectAllGroupsDepthFirst(o.getObjects() as FabricObject[]))
    }
  }
  return out
}

/**
 * Figma 式交互：
 * - 悬停/单击：优先命中 Group 的一级子元素，空白处才命中 Group 本身
 * - 选中 Group 本身时保持闭组（避免一次点穿多层）；其子仍可通过一级优先命中选中
 * - 选中某 Group 的后代时：该 Group open（可点同级）
 * - 双击：在当前组再下钻一层
 */
export function syncGroupsInteractionFromCanvasSelection(canvas: Canvas): void {
  const active = canvas.getActiveObject()
  // 误选画板 Rect 时回退到父容器
  if (active && isFabricContainerFrame(active as FabricObject)) {
    const parent = (active as FabricObject).group
    if (parent) {
      canvas.setActiveObject(parent)
      canvas.requestRenderAll()
    } else {
      canvas.discardActiveObject()
      canvas.requestRenderAll()
    }
  }

  const focusObj = canvas.getActiveObject()
  const roots = canvas.getObjects()
  const allGroups = collectAllGroupsDepthFirst(roots)

  if (!focusObj || focusObj instanceof ActiveSelection) {
    for (const g of allGroups) {
      applyClosedGroupPointerPolicy(g)
    }
    return
  }

  const focus = focusObj as FabricObject

  for (const g of allGroups) {
    if (focus === g) {
      // 选中组本身：闭组防点穿；仍靠一级几何优先点到直接子元素
      applyClosedGroupPointerPolicy(g)
    } else if (hasAncestorGroup(focus, g)) {
      applyOpenGroupPointerPolicy(g)
    } else {
      applyClosedGroupPointerPolicy(g)
    }
  }
}

function isDrillableGroup(obj: FabricObject): obj is Group {
  return obj instanceof Group && !(obj instanceof ActiveSelection)
}

/**
 * 悬停/单击命中优先级（相对当前 Fabric target）：
 * 始终优先指针下的一级子元素；空白处才命中该 Group。
 * 嵌套组作为一级整体被命中，不会一次穿到最深；再点 / 双击进下一层。
 */
export function resolvePreferredGroupPointerTarget(
  _canvas: Canvas,
  target: FabricObject | undefined,
  scenePoint: { x: number; y: number },
): FabricObject | undefined {
  if (!target || !isDrillableGroup(target)) {
    return target
  }
  return findDirectChildUnderScenePoint(target, scenePoint) ?? target
}

/**
 * 在给定编组的**直接子级**中，按绘制顺序（由上至下）取第一个包含场景点的对象。
 */
export function findDirectChildUnderScenePoint(
  group: Group,
  scenePoint: { x: number; y: number },
): FabricObject | undefined {
  const pt = new Point(scenePoint.x, scenePoint.y)
  const ordered = group.getObjects().slice().reverse()
  for (const raw of ordered) {
    const obj = raw as FabricObject
    if (obj.visible === false) {
      continue
    }
    if (isFabricContainerFrame(obj)) {
      continue
    }
    try {
      if (typeof obj.containsPoint === 'function' && obj.containsPoint(pt)) {
        return obj
      }
    } catch {
      /* skip broken bounds */
    }
  }
  return undefined
}

/**
 * 解析双击时应下钻的组：优先当前选中的组（Figma：先选中再双击进一层），
 * 否则用指针下的组。
 */
export function resolveGroupToDrillOnDoubleClick(
  canvas: Canvas,
  target: FabricObject | undefined,
  scenePoint: { x: number; y: number },
): Group | undefined {
  const active = canvas.getActiveObject()
  if (active && isDrillableGroup(active as FabricObject)) {
    const group = active as Group
    try {
      if (group.containsPoint(new Point(scenePoint.x, scenePoint.y))) {
        return group
      }
    } catch {
      /* fall through */
    }
  }
  if (target && isDrillableGroup(target)) {
    return target
  }
  // 命中叶子时：若其父组是当前选中，则对该父组下钻（少见兜底）
  if (
    target &&
    active &&
    isDrillableGroup(active as FabricObject) &&
    (target as FabricObject).group === active
  ) {
    return active as Group
  }
  return undefined
}

/**
 * 双击：在解析到的 Group 下再进一层（选中指针下的直接子对象）。
 * 可连续双击深入多层嵌套。
 * @returns 是否已处理
 */
export function tryDrillIntoGroupOnDoubleClick(
  canvas: Canvas,
  target: FabricObject | undefined,
  scenePoint: { x: number; y: number },
): boolean {
  const group = resolveGroupToDrillOnDoubleClick(canvas, target, scenePoint)
  if (!group) {
    return false
  }
  const child = findDirectChildUnderScenePoint(group, scenePoint)
  if (!child) {
    return false
  }
  child.set({ evented: true, selectable: true, hasControls: true })
  canvas.setActiveObject(child)
  canvas.requestRenderAll()
  return true
}
