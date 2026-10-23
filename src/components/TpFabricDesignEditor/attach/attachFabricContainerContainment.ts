import type { Canvas } from 'fabric'
import { reparentActiveSelectionAfterDrag } from '../layers/fabricContainerContainment.pure'
import { applyFabricContainerLayoutIfNeeded } from '../layers/fabricContainerLayout.pure'
import { syncGroupsInteractionFromCanvasSelection } from '../layers/fabricGroupPointerPolicy.pure'
import { hasFabricPathEditSession } from '../tools/penTool'

/**
 * 拖动图层松手后：若中心落入容器则挂入（支持容器嵌套）；拖出容器则回到画布根。
 * stack/grid 容器内拖动松手后会重新应用布局。
 */
export function attachFabricContainerContainment(options: {
  canvas: Canvas
  getReadonly: () => boolean
  onReparented?: () => void
}): () => void {
  const { canvas, getReadonly, onReparented } = options
  let moved = false
  let handling = false

  const onMoving = () => {
    moved = true
  }

  const tryReparentAfterDrag = () => {
    if (!moved || handling) return
    moved = false
    if (getReadonly() || hasFabricPathEditSession(canvas)) return
    handling = true
    try {
      const reparented = reparentActiveSelectionAfterDrag(canvas)
      const active = canvas.getActiveObject()
      let layoutChanged = false
      if (active) {
        layoutChanged = applyFabricContainerLayoutIfNeeded(active)
        for (const o of canvas.getActiveObjects()) {
          if (applyFabricContainerLayoutIfNeeded(o)) layoutChanged = true
        }
      }
      if (!reparented && !layoutChanged) return
      syncGroupsInteractionFromCanvasSelection(canvas)
      canvas.requestRenderAll()
      onReparented?.()
    } finally {
      handling = false
    }
  }

  const onMouseUp = () => {
    requestAnimationFrame(tryReparentAfterDrag)
  }

  const onModified = (opt: { action?: string }) => {
    if (opt.action && opt.action !== 'drag') {
      moved = false
      return
    }
    tryReparentAfterDrag()
  }

  canvas.on('object:moving', onMoving)
  canvas.on('mouse:up', onMouseUp)
  canvas.on('object:modified', onModified)

  return () => {
    canvas.off('object:moving', onMoving)
    canvas.off('mouse:up', onMouseUp)
    canvas.off('object:modified', onModified)
  }
}
