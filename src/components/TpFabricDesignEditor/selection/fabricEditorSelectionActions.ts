import { ActiveSelection, type Canvas, type FabricObject } from 'fabric'
import { isFabricArtboardGuide } from '../document/fabricArtboard'
import { assignDefaultFabricLayerNamesDeep } from '../layers/fabricLayerNaming.pure'

const DUPLICATE_OFFSET_PX = 12

export function getSelectableCanvasObjects(canvas: Canvas): FabricObject[] {
  return canvas.getObjects().filter(
    (o) =>
      !isFabricArtboardGuide(o) &&
      o.selectable !== false &&
      o.evented !== false,
  )
}

export function fabricEditorSelectAll(canvas: Canvas): boolean {
  const objects = getSelectableCanvasObjects(canvas)
  if (!objects.length) return false
  if (objects.length === 1) {
    canvas.setActiveObject(objects[0]!)
  } else {
    canvas.setActiveObject(new ActiveSelection(objects, { canvas }))
  }
  return true
}

export function fabricEditorDeselectAll(canvas: Canvas): void {
  canvas.discardActiveObject()
}

export async function fabricEditorDuplicateSelection(
  canvas: Canvas,
): Promise<FabricObject[]> {
  const objects = canvas
    .getActiveObjects()
    .filter((o) => !isFabricArtboardGuide(o))
  if (!objects.length) return []

  const clones = await Promise.all(objects.map((o) => o.clone()))
  canvas.discardActiveObject()

  for (const clone of clones) {
    clone.set({
      left: (clone.left ?? 0) + DUPLICATE_OFFSET_PX,
      top: (clone.top ?? 0) + DUPLICATE_OFFSET_PX,
    })
    clone.setCoords()
    canvas.add(clone)
    assignDefaultFabricLayerNamesDeep(canvas, clone)
  }

  if (clones.length === 1) {
    canvas.setActiveObject(clones[0]!)
  } else if (clones.length > 1) {
    canvas.setActiveObject(new ActiveSelection(clones, { canvas }))
  }

  return clones
}

export function fabricEditorNudgeSelection(
  canvas: Canvas,
  dx: number,
  dy: number,
): boolean {
  const objects = canvas
    .getActiveObjects()
    .filter((o) => !isFabricArtboardGuide(o))
  if (!objects.length) return false

  for (const obj of objects) {
    obj.set({
      left: (obj.left ?? 0) + dx,
      top: (obj.top ?? 0) + dy,
    })
    obj.setCoords()
    canvas.fire('object:modified', { target: obj })
  }

  return true
}
