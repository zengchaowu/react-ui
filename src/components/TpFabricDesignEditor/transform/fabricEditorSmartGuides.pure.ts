import type { FabricObject } from 'fabric'

export type FabricSmartGuideBox = {
  left: number
  top: number
  right: number
  bottom: number
  cx: number
  cy: number
}

export type FabricSmartGuideLine =
  | { orient: 'v'; x: number; y1: number; y2: number }
  | { orient: 'h'; y: number; x1: number; x2: number }

export type FabricSmartSnapResult = {
  dx: number
  dy: number
  guides: FabricSmartGuideLine[]
}

type AxisEdge = { value: number; spanStart: number; spanEnd: number }

/** 场景坐标系轴对齐包围盒（忽略 viewport） */
export function getFabricObjectSmartGuideBox(obj: FabricObject): FabricSmartGuideBox {
  obj.setCoords()
  const coords = obj.getCoords()
  const xs = coords.map((p) => p.x)
  const ys = coords.map((p) => p.y)
  const left = Math.min(...xs)
  const right = Math.max(...xs)
  const top = Math.min(...ys)
  const bottom = Math.max(...ys)
  return {
    left,
    right,
    top,
    bottom,
    cx: (left + right) / 2,
    cy: (top + bottom) / 2,
  }
}

function xEdges(box: FabricSmartGuideBox): AxisEdge[] {
  return [
    { value: box.left, spanStart: box.top, spanEnd: box.bottom },
    { value: box.cx, spanStart: box.top, spanEnd: box.bottom },
    { value: box.right, spanStart: box.top, spanEnd: box.bottom },
  ]
}

function yEdges(box: FabricSmartGuideBox): AxisEdge[] {
  return [
    { value: box.top, spanStart: box.left, spanEnd: box.right },
    { value: box.cy, spanStart: box.left, spanEnd: box.right },
    { value: box.bottom, spanStart: box.left, spanEnd: box.right },
  ]
}

function mergeSpan(
  a0: number,
  a1: number,
  b0: number,
  b1: number,
): { start: number; end: number } {
  return {
    start: Math.min(a0, a1, b0, b1),
    end: Math.max(a0, a1, b0, b1),
  }
}

/**
 * 相对参考包围盒计算吸附位移与对齐线。
 * - `applySnap=false`：只产出靠近阈值内的引导线，dx/dy 为 0
 * - `applySnap=true`：位移吸到最近对齐边，并带对应引导线
 */
export function computeFabricSmartSnap(options: {
  moving: FabricSmartGuideBox
  references: FabricSmartGuideBox[]
  threshold: number
  applySnap: boolean
}): FabricSmartSnapResult {
  const { moving, references, threshold, applySnap } = options
  if (!references.length || threshold <= 0) {
    return { dx: 0, dy: 0, guides: [] }
  }

  let bestDx = 0
  let bestDxAbs = threshold
  let bestDy = 0
  let bestDyAbs = threshold
  let guideV: FabricSmartGuideLine | null = null
  let guideH: FabricSmartGuideLine | null = null

  const movingX = xEdges(moving)
  const movingY = yEdges(moving)

  for (const ref of references) {
    const refX = xEdges(ref)
    const refY = yEdges(ref)

    for (const me of movingX) {
      for (const re of refX) {
        const delta = re.value - me.value
        const abs = Math.abs(delta)
        if (abs > bestDxAbs) continue
        bestDxAbs = abs
        bestDx = delta
        const span = mergeSpan(me.spanStart, me.spanEnd, re.spanStart, re.spanEnd)
        guideV = {
          orient: 'v',
          x: re.value,
          y1: span.start,
          y2: span.end,
        }
      }
    }

    for (const me of movingY) {
      for (const re of refY) {
        const delta = re.value - me.value
        const abs = Math.abs(delta)
        if (abs > bestDyAbs) continue
        bestDyAbs = abs
        bestDy = delta
        const span = mergeSpan(me.spanStart, me.spanEnd, re.spanStart, re.spanEnd)
        guideH = {
          orient: 'h',
          y: re.value,
          x1: span.start,
          x2: span.end,
        }
      }
    }
  }

  const guides: FabricSmartGuideLine[] = []
  if (guideV && bestDxAbs < threshold) guides.push(guideV)
  if (guideH && bestDyAbs < threshold) guides.push(guideH)

  if (!applySnap) {
    return { dx: 0, dy: 0, guides }
  }

  return {
    dx: bestDxAbs < threshold ? bestDx : 0,
    dy: bestDyAbs < threshold ? bestDy : 0,
    guides,
  }
}
