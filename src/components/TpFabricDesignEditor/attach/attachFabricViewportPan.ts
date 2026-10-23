import { Point, type Canvas } from 'fabric'
import type { TpFabricViewportTool } from '../types'

export function attachFabricViewportPan(options: {
  canvas: Canvas
  getReadonly: () => boolean
  getViewportTool: () => TpFabricViewportTool
}): () => void {
  const { canvas } = options
  let panning = false
  let lastX = 0
  let lastY = 0

  function pointerXY(e: Event): { x: number; y: number } | null {
    if (e instanceof MouseEvent) {
      return { x: e.clientX, y: e.clientY }
    }
    if (e instanceof TouchEvent && e.touches[0]) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    return null
  }

  function onMouseDown(opt: { e: Event }) {
    if (options.getReadonly()) return
    if (options.getViewportTool() !== 'hand') return
    const e = opt.e
    if (e instanceof MouseEvent && e.button !== 0) return

    const point = pointerXY(e)
    if (!point) return

    panning = true
    lastX = point.x
    lastY = point.y
    canvas.setCursor('grabbing')
  }

  function onMouseMove(opt: { e: Event }) {
    if (!panning) return
    const point = pointerXY(opt.e)
    if (!point) return

    const dx = point.x - lastX
    const dy = point.y - lastY
    lastX = point.x
    lastY = point.y
    canvas.relativePan(new Point(dx, dy))
  }

  function endPan() {
    if (!panning) return
    panning = false
    if (options.getViewportTool() === 'hand') {
      canvas.setCursor('grab')
    }
  }

  canvas.on('mouse:down', onMouseDown)
  canvas.on('mouse:move', onMouseMove)
  canvas.on('mouse:up', endPan)
  canvas.on('mouse:out', endPan)

  return () => {
    canvas.off('mouse:down', onMouseDown)
    canvas.off('mouse:move', onMouseMove)
    canvas.off('mouse:up', endPan)
    canvas.off('mouse:out', endPan)
  }
}
