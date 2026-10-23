import type { ReactiveRef } from './reactivity'
import type { Canvas } from 'fabric'
import { resolveArtboardSize } from '../document/fabricArtboard'
import {
  alignCanvasSelection,
  type FabricAlignMode,
} from '../selection/fabricEditorAlign.pure'
import { parseTransformAngleFromUi } from '../transform/fabricEditorTransformSync.pure'
import {
  applyFabricCornerRadius,
  moveFabricObjectsBy,
  readCanvasSelectionBounds,
  resizeFabricObjectHeight,
  resizeFabricObjectWidth,
  roundTransformMetric,
} from '../transform/fabricEditorTransformMetrics.pure'
import type { TpFabricDesignEditorProps } from '../types'

type TransformEmit = {
  (e: 'object-modified', obj: import('fabric').FabricObject): void
}

export function useFabricTransformMutations(options: {
  canvasRef: ReactiveRef<Canvas | undefined>
  getProps: () => Pick<TpFabricDesignEditorProps, 'readonly' | 'fixedCanvasSize'>
  emit: TransformEmit
  lockAspectRatio: ReactiveRef<boolean>
  transformAngle: ReactiveRef<number>
  afterTransformMutation: () => void
}) {
  function getArtboard() {
    return resolveArtboardSize(options.getProps().fixedCanvasSize)
  }

  function applyTransformToSelection(patch: {
    angle?: number
    flipX?: boolean
    flipY?: boolean
    rotateBy?: number
  }) {
    const canvas = options.canvasRef.value
    if (!canvas || options.getProps().readonly) return
    const objs = canvas.getActiveObjects()
    if (!objs.length) return

    for (const o of objs) {
      const next: {
        angle?: number
        flipX?: boolean
        flipY?: boolean
      } = {}
      if (patch.angle !== undefined) {
        next.angle = patch.angle
      } else if (patch.rotateBy !== undefined) {
        next.angle = (o.angle ?? 0) + patch.rotateBy
      }
      if (patch.flipX !== undefined) next.flipX = patch.flipX
      if (patch.flipY !== undefined) next.flipY = patch.flipY
      o.set(next)
      o.setCoords()
      options.emit('object-modified', o)
    }
    options.afterTransformMutation()
  }

  function toggleFlip(axis: 'flipX' | 'flipY') {
    const canvas = options.canvasRef.value
    if (!canvas || options.getProps().readonly) return
    const objs = canvas.getActiveObjects()
    if (!objs.length) return
    for (const o of objs) {
      o.set({ [axis]: !o[axis] })
      o.setCoords()
      options.emit('object-modified', o)
    }
    options.afterTransformMutation()
  }

  function applyAngleFromUi(raw?: number | string) {
    const deg = parseTransformAngleFromUi(raw, options.transformAngle.value)
    options.transformAngle.value = deg
    applyTransformToSelection({ angle: deg })
  }

  function rotateByDegrees(delta: number) {
    applyTransformToSelection({ rotateBy: delta })
  }

  function toggleFlipHorizontal() {
    toggleFlip('flipX')
  }

  function toggleFlipVertical() {
    toggleFlip('flipY')
  }

  function parseRoundedValue(raw: number | string): number | null {
    if (raw === '' || raw === '-') return null
    const value = roundTransformMetric(
      typeof raw === 'number' ? raw : parseFloat(String(raw)),
    )
    return Number.isFinite(value) ? value : null
  }

  function applyPositionFromUi(axis: 'x' | 'y', raw: number | string) {
    const canvas = options.canvasRef.value
    if (!canvas || options.getProps().readonly) return
    const objs = canvas.getActiveObjects()
    if (!objs.length) return
    const value = parseRoundedValue(raw)
    if (value == null) return

    const bounds = readCanvasSelectionBounds(canvas)
    if (!bounds) return

    const dx = axis === 'x' ? value - bounds.left : 0
    const dy = axis === 'y' ? value - bounds.top : 0
    if (!dx && !dy) return

    moveFabricObjectsBy(objs, dx, dy)
    for (const o of objs) options.emit('object-modified', o)
    options.afterTransformMutation()
  }

  function applySizeFromUi(axis: 'w' | 'h', raw: number | string) {
    const canvas = options.canvasRef.value
    if (!canvas || options.getProps().readonly) return
    const objs = canvas.getActiveObjects()
    if (objs.length !== 1) return

    const value = parseRoundedValue(raw)
    if (value == null || value <= 0) return

    const o = objs[0]!
    if (axis === 'w') {
      resizeFabricObjectWidth(o, value, options.lockAspectRatio.value)
    } else {
      resizeFabricObjectHeight(o, value, options.lockAspectRatio.value)
    }
    options.emit('object-modified', o)
    options.afterTransformMutation()
  }

  function applyCornerRadiusFromUi(raw: number | string) {
    const canvas = options.canvasRef.value
    if (!canvas || options.getProps().readonly) return
    const objs = canvas.getActiveObjects()
    if (objs.length !== 1) return

    const value = parseRoundedValue(raw)
    if (value == null || value < 0) return

    const o = objs[0]!
    applyFabricCornerRadius(o, Math.max(0, value))
    options.emit('object-modified', o)
    options.afterTransformMutation()
  }

  function alignSelection(mode: FabricAlignMode) {
    const canvas = options.canvasRef.value
    if (!canvas || options.getProps().readonly) return
    alignCanvasSelection(canvas, mode, getArtboard())
    for (const o of canvas.getActiveObjects()) {
      options.emit('object-modified', o)
    }
    options.afterTransformMutation()
  }

  return {
    applyAngleFromUi,
    rotateByDegrees,
    toggleFlipHorizontal,
    toggleFlipVertical,
    applyPositionFromUi,
    applySizeFromUi,
    applyCornerRadiusFromUi,
    alignSelection,
  }
}
