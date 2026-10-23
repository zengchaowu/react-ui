import type { Canvas } from 'fabric'
import {
  readCanvasSelectionBounds,
  readFabricCornerRadius,
  roundTransformMetric,
} from './fabricEditorTransformMetrics.pure'

export type FabricTransformSelectionSnapshot = {
  active: boolean
  multiSelection: boolean
  angle: number
  flipX: boolean
  flipY: boolean
  x: number
  y: number
  w: number
  h: number
  cornerRadius: number | null
}

export const EMPTY_FABRIC_TRANSFORM_SNAPSHOT: FabricTransformSelectionSnapshot = {
  active: false,
  multiSelection: false,
  angle: 0,
  flipX: false,
  flipY: false,
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  cornerRadius: null,
}

export function normalizeFabricDisplayAngle(angle: number): number {
  let a = angle % 360
  if (a > 180) a -= 360
  if (a <= -180) a += 360
  return roundTransformMetric(a)
}

export function readFabricTransformSelectionSnapshot(
  canvas: Canvas | undefined,
): FabricTransformSelectionSnapshot {
  if (!canvas) return { ...EMPTY_FABRIC_TRANSFORM_SNAPSHOT }

  const objs = canvas.getActiveObjects()
  if (!objs.length) return { ...EMPTY_FABRIC_TRANSFORM_SNAPSHOT }

  const o = objs[0]!
  const bounds = readCanvasSelectionBounds(canvas)
  return {
    active: true,
    multiSelection: objs.length > 1,
    angle: normalizeFabricDisplayAngle(o.angle ?? 0),
    flipX: !!o.flipX,
    flipY: !!o.flipY,
    x: bounds?.left ?? 0,
    y: bounds?.top ?? 0,
    w: bounds?.width ?? 0,
    h: bounds?.height ?? 0,
    cornerRadius: objs.length === 1 ? readFabricCornerRadius(o) : null,
  }
}

export function parseTransformAngleFromUi(
  raw: number | string | undefined,
  fallback: number,
): number {
  if (raw === undefined || raw === '' || raw === '-') return fallback
  const deg = roundTransformMetric(
    typeof raw === 'number' ? raw : parseFloat(String(raw)),
  )
  return Number.isFinite(deg) ? deg : fallback
}
