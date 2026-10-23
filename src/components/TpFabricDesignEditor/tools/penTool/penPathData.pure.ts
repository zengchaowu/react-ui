import { Point, util, type TSimplePathData } from 'fabric'
import type { Path } from 'fabric'
import type { PenEditHit, PenNode } from './types'
import { tokenSolidColors } from '../../../../assets/tokens/tokenSolidColors'

const CLOSE_HIT_PX = 10
const HANDLE_HIT_PX = 7
const ANCHOR_HIT_PX = 8

export function penNodesToPathData(
  nodes: PenNode[],
  closed: boolean,
): TSimplePathData {
  if (nodes.length === 0) return []
  const first = nodes[0]!
  const data: TSimplePathData = [['M', first.x, first.y]]
  for (let i = 1; i < nodes.length; i++) {
    appendPenSegment(data, nodes[i - 1]!, nodes[i]!)
  }
  if (closed && nodes.length > 1) {
    appendPenSegment(data, nodes[nodes.length - 1]!, nodes[0]!)
    data.push(['Z'])
  }
  return data
}

function appendPenSegment(
  data: TSimplePathData,
  from: PenNode,
  to: PenNode,
): void {
  const out = from.handleOut
  const inn = to.handleIn
  if (out && inn) {
    data.push([
      'C',
      from.x + out.x,
      from.y + out.y,
      to.x + inn.x,
      to.y + inn.y,
      to.x,
      to.y,
    ])
    return
  }
  if (out) {
    data.push(['C', from.x + out.x, from.y + out.y, to.x, to.y, to.x, to.y])
    return
  }
  if (inn) {
    data.push(['C', from.x, from.y, to.x + inn.x, to.y + inn.y, to.x, to.y])
    return
  }
  data.push(['L', to.x, to.y])
}

export function pathDataToPenNodes(
  data: TSimplePathData,
): { nodes: PenNode[]; closed: boolean } {
  const nodes: PenNode[] = []
  let closed = false
  let pendingLineStart: PenNode | null = null

  for (const cmd of data) {
    const type = cmd[0]
    if (type === 'M') {
      const current = { x: cmd[1], y: cmd[2] }
      nodes.push(current)
      pendingLineStart = current
    } else if (type === 'L') {
      const node = { x: cmd[1], y: cmd[2] }
      if (pendingLineStart && nodes.length) {
        nodes.push(node)
      }
      pendingLineStart = node
    } else if (type === 'C') {
      const c1x = cmd[1]
      const c1y = cmd[2]
      const c2x = cmd[3]
      const c2y = cmd[4]
      const x = cmd[5]
      const y = cmd[6]
      if (pendingLineStart) {
        pendingLineStart.handleOut = {
          x: c1x - pendingLineStart.x,
          y: c1y - pendingLineStart.y,
        }
      }
      const node: PenNode = {
        x,
        y,
        handleIn: { x: c2x - x, y: c2y - y },
      }
      nodes.push(node)
      pendingLineStart = node
    } else if (type === 'Q') {
      const c1x = cmd[1]
      const c1y = cmd[2]
      const x = cmd[3]
      const y = cmd[4]
      if (pendingLineStart) {
        pendingLineStart.handleOut = {
          x: (c1x - pendingLineStart.x) * (2 / 3),
          y: (c1y - pendingLineStart.y) * (2 / 3),
        }
      }
      const node: PenNode = {
        x,
        y,
        handleIn: { x: (c1x - x) * (2 / 3), y: (c1y - y) * (2 / 3) },
      }
      nodes.push(node)
      pendingLineStart = node
    } else if (type === 'Z') {
      closed = true
    }
  }

  if (closed && nodes.length > 1) {
    const first = nodes[0]!
    const last = nodes[nodes.length - 1]!
    if (Math.hypot(first.x - last.x, first.y - last.y) < 0.01) {
      // 闭合时末点与首点重合：合并手柄到首点，再移除重复点
      if (last.handleIn) {
        first.handleIn = { ...last.handleIn }
      }
      if (last.handleOut && !first.handleOut) {
        first.handleOut = { ...last.handleOut }
      }
      nodes.pop()
    }
  }

  return { nodes, closed }
}

export function pathObjectToSceneNodes(path: Path): {
  nodes: PenNode[]
  closed: boolean
} {
  const pathData = path.path ?? []
  if (!pathData.length) return { nodes: [], closed: false }
  const simplified = util.makePathSimpler(pathData)
  const matrix = path.calcTransformMatrix()
  const transformed = util.transformPath(
    simplified,
    matrix,
    path.pathOffset ?? new Point(0, 0),
  )
  return pathDataToPenNodes(transformed)
}

export function clonePathData(data: TSimplePathData): TSimplePathData {
  return util.makePathSimpler(data)
}

/** 将场景坐标下的节点写回 Path：烘焙为场景空间 path，并重置变换，避免 pathOffset 漂移导致跳位 */
export function applySceneNodesToPathInPlace(
  path: Path,
  nodes: PenNode[],
  closed: boolean,
): void {
  const sceneData = util.makePathSimpler(penNodesToPathData(nodes, closed))
  path.set({
    path: sceneData,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    skewX: 0,
    skewY: 0,
    flipX: false,
    flipY: false,
    originX: 'center',
    originY: 'center',
    objectCaching: false,
  })
  if (typeof path.setDimensions === 'function') {
    path.setDimensions()
  }
  // path 数据已是场景坐标；中心原点下放在 pathOffset，视觉位置与节点一致
  const offset = path.pathOffset ?? new Point(0, 0)
  path.set({
    left: offset.x,
    top: offset.y,
  })
  path.setCoords()
}

export type FabricPathEditGeometrySnapshot = {
  path: TSimplePathData
  left: number
  top: number
  angle: number
  scaleX: number
  scaleY: number
  skewX: number
  skewY: number
  flipX: boolean
  flipY: boolean
  originX: Path['originX']
  originY: Path['originY']
}

export function snapshotFabricPathEditGeometry(
  path: Path,
): FabricPathEditGeometrySnapshot {
  return {
    path: clonePathData(path.path ?? []),
    left: path.left ?? 0,
    top: path.top ?? 0,
    angle: path.angle ?? 0,
    scaleX: path.scaleX ?? 1,
    scaleY: path.scaleY ?? 1,
    skewX: path.skewX ?? 0,
    skewY: path.skewY ?? 0,
    flipX: Boolean(path.flipX),
    flipY: Boolean(path.flipY),
    originX: path.originX,
    originY: path.originY,
  }
}

export function restoreFabricPathEditGeometry(
  path: Path,
  snapshot: FabricPathEditGeometrySnapshot,
): void {
  path.set({
    path: clonePathData(snapshot.path),
    left: snapshot.left,
    top: snapshot.top,
    angle: snapshot.angle,
    scaleX: snapshot.scaleX,
    scaleY: snapshot.scaleY,
    skewX: snapshot.skewX,
    skewY: snapshot.skewY,
    flipX: snapshot.flipX,
    flipY: snapshot.flipY,
    originX: snapshot.originX,
    originY: snapshot.originY,
    objectCaching: false,
  })
  if (typeof path.setDimensions === 'function') {
    path.setDimensions()
  }
  path.setCoords()
}

export function createPathFromSceneNodesWithCtor(
  PathCtor: typeof Path,
  nodes: PenNode[],
  closed: boolean,
  style: {
    fill?: string
    stroke?: string
    strokeWidth?: number
  },
): Path {
  const data = util.makePathSimpler(penNodesToPathData(nodes, closed))
  return new PathCtor(data, {
    fill: style.fill ?? '',
    stroke: style.stroke ?? tokenSolidColors.grayColor15,
    strokeWidth: style.strokeWidth ?? 2,
    strokeUniform: true,
    objectCaching: false,
  })
}

function paintToString(val: unknown): string | undefined {
  if (val == null || val === '') return undefined
  return String(val)
}

export function copyPathStyle(path: Path): {
  fill?: string
  stroke?: string
  strokeWidth?: number
} {
  return {
    fill: paintToString(path.fill),
    stroke: paintToString(path.stroke),
    strokeWidth: path.strokeWidth,
  }
}

export function distanceSq(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy
}

export function hitTestPenNodes(
  nodes: PenNode[],
  closed: boolean,
  point: { x: number; y: number },
  zoom: number,
): PenEditHit | null {
  const closeR = CLOSE_HIT_PX / zoom
  const anchorR = ANCHOR_HIT_PX / zoom
  const handleR = HANDLE_HIT_PX / zoom

  if (nodes.length > 2 && !closed) {
    const first = nodes[0]!
    if (distanceSq(point.x, point.y, first.x, first.y) <= closeR * closeR) {
      return { kind: 'close', index: 0 }
    }
  }

  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i]!
    if (node.handleOut) {
      const hx = node.x + node.handleOut.x
      const hy = node.y + node.handleOut.y
      if (distanceSq(point.x, point.y, hx, hy) <= handleR * handleR) {
        return { kind: 'handleOut', index: i }
      }
    }
    if (node.handleIn) {
      const hx = node.x + node.handleIn.x
      const hy = node.y + node.handleIn.y
      if (distanceSq(point.x, point.y, hx, hy) <= handleR * handleR) {
        return { kind: 'handleIn', index: i }
      }
    }
    if (distanceSq(point.x, point.y, node.x, node.y) <= anchorR * anchorR) {
      return { kind: 'anchor', index: i }
    }
  }

  return null
}

export function mirrorHandle(handle: { x: number; y: number }): {
  x: number
  y: number
} {
  return { x: -handle.x, y: -handle.y }
}

export function clonePenNodes(nodes: PenNode[]): PenNode[] {
  return nodes.map((node) => ({
    x: node.x,
    y: node.y,
    handleIn: node.handleIn ? { ...node.handleIn } : undefined,
    handleOut: node.handleOut ? { ...node.handleOut } : undefined,
  }))
}

export function buildPreviewNodes(
  nodes: PenNode[],
  cursor: { x: number; y: number },
  pendingHandle: { x: number; y: number } | null,
  /** 拖拽出手柄时，新锚点在按下位置（非松开位置） */
  anchor?: { x: number; y: number } | null,
): PenNode[] {
  const preview = clonePenNodes(nodes)
  if (preview.length === 0) return preview
  if (pendingHandle && anchor) {
    preview.push({
      x: anchor.x,
      y: anchor.y,
      handleIn: mirrorHandle(pendingHandle),
      handleOut: { ...pendingHandle },
    })
    return preview
  }
  preview.push({ x: cursor.x, y: cursor.y })
  return preview
}

export function removePenNode(
  nodes: PenNode[],
  index: number,
  closed: boolean,
): { nodes: PenNode[]; closed: boolean } {
  if (index < 0 || index >= nodes.length) {
    return { nodes, closed }
  }
  const next = clonePenNodes(nodes)
  next.splice(index, 1)
  if (next.length < 2) {
    return { nodes: next, closed: false }
  }
  if (index === 0 && closed) {
    next[0]!.handleIn = undefined
  }
  return { nodes: next, closed: closed && next.length > 2 }
}

/** 按从大到小删除多个锚点，避免下标错位 */
export function removePenNodes(
  nodes: PenNode[],
  indices: number[],
  closed: boolean,
): { nodes: PenNode[]; closed: boolean } {
  const unique = [...new Set(indices.filter((i) => i >= 0 && i < nodes.length))]
  unique.sort((a, b) => b - a)
  let nextNodes = nodes
  let nextClosed = closed
  for (const index of unique) {
    const result = removePenNode(nextNodes, index, nextClosed)
    nextNodes = result.nodes
    nextClosed = result.closed
  }
  return { nodes: nextNodes, closed: nextClosed }
}

/** 场景坐标矩形内的锚点下标（含边界） */
export function collectPenAnchorIndicesInRect(
  nodes: PenNode[],
  rect: { left: number; top: number; right: number; bottom: number },
): number[] {
  const left = Math.min(rect.left, rect.right)
  const right = Math.max(rect.left, rect.right)
  const top = Math.min(rect.top, rect.bottom)
  const bottom = Math.max(rect.top, rect.bottom)
  const indices: number[] = []
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!
    if (
      node.x >= left &&
      node.x <= right &&
      node.y >= top &&
      node.y <= bottom
    ) {
      indices.push(i)
    }
  }
  return indices
}
