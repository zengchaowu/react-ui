import { Group, type Canvas, type FabricObject } from 'fabric'
import type {
  PenToolInteractionSnapshot,
} from './penToolSessionTypes'

export function walkFabricObjects(
  objects: FabricObject[],
  fn: (obj: FabricObject) => void,
): void {
  for (const obj of objects) {
    fn(obj)
    if (obj instanceof Group) {
      walkFabricObjects(obj.getObjects() as FabricObject[], fn)
    }
  }
}

export function createPenToolCanvasLock(
  canvas: Canvas,
  getCurrentTool: () => string,
  onPathEditSessionChange?: (active: boolean) => void,
) {
  let interactionSnapshots: Map<FabricObject, PenToolInteractionSnapshot> | null =
    null
  let canvasCursorSnapshot: {
    selection: boolean
    defaultCursor: string
    hoverCursor: string
    moveCursor: string
  } | null = null

  function suspend() {
    if (interactionSnapshots) return

    interactionSnapshots = new Map()
    canvasCursorSnapshot = {
      selection: canvas.selection,
      defaultCursor: canvas.defaultCursor,
      hoverCursor: canvas.hoverCursor,
      moveCursor: canvas.moveCursor,
    }

    walkFabricObjects(canvas.getObjects(), (obj) => {
      interactionSnapshots!.set(obj, {
        selectable: obj.selectable,
        evented: obj.evented,
        hasControls: obj.hasControls,
        hasBorders: obj.hasBorders,
        hoverCursor: obj.hoverCursor ?? undefined,
        lockMovementX: obj.lockMovementX,
        lockMovementY: obj.lockMovementY,
      })
      obj.set({
        selectable: false,
        evented: false,
        hasControls: false,
        hasBorders: false,
        hoverCursor: 'default',
        lockMovementX: true,
        lockMovementY: true,
      })
    })

    canvas.discardActiveObject()
    canvas.selection = false
    canvas.defaultCursor = 'default'
    canvas.hoverCursor = 'default'
    canvas.moveCursor = 'default'
    canvas.requestRenderAll()
    onPathEditSessionChange?.(true)
  }

  function restore() {
    if (interactionSnapshots) {
      for (const [obj, snap] of interactionSnapshots) {
        obj.set({
          selectable: snap.selectable,
          evented: snap.evented,
          hasControls: snap.hasControls,
          hasBorders: snap.hasBorders,
          hoverCursor: snap.hoverCursor,
          lockMovementX: snap.lockMovementX,
          lockMovementY: snap.lockMovementY,
        })
      }
      interactionSnapshots = null
      onPathEditSessionChange?.(false)
    }

    if (canvasCursorSnapshot) {
      canvas.defaultCursor = canvasCursorSnapshot.defaultCursor
      canvas.hoverCursor = canvasCursorSnapshot.hoverCursor
      canvas.moveCursor = canvasCursorSnapshot.moveCursor
      canvasCursorSnapshot = null
    }

    canvas.selection = getCurrentTool() === 'select'
  }

  return { suspend, restore }
}
