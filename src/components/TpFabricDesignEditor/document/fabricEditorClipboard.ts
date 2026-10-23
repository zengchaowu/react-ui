import { ActiveSelection, type Canvas, type FabricObject } from 'fabric'
import { isFabricArtboardGuide } from './fabricArtboard'
import { assignDefaultFabricLayerNamesDeep } from '../layers/fabricLayerNaming.pure'

const PASTE_OFFSET_PX = 12

let clipboardItems: FabricObject[] | null = null
let pasteGeneration = 0

export function clearFabricEditorClipboard() {
  clipboardItems = null
  pasteGeneration = 0
}

export function fabricEditorClipboardHasItems(): boolean {
  return Boolean(clipboardItems?.length)
}

function getCopyableObjects(canvas: Canvas): FabricObject[] {
  return canvas.getActiveObjects().filter((o) => !isFabricArtboardGuide(o))
}

export async function fabricEditorCopySelection(
  canvas: Canvas,
): Promise<boolean> {
  const objects = getCopyableObjects(canvas)
  if (!objects.length) return false
  clipboardItems = await Promise.all(objects.map((o) => o.clone()))
  pasteGeneration = 0
  return true
}

export async function fabricEditorPasteClipboard(
  canvas: Canvas,
): Promise<FabricObject[]> {
  if (!clipboardItems?.length) return []

  pasteGeneration += 1
  const offset = PASTE_OFFSET_PX * pasteGeneration
  const clones = await Promise.all(clipboardItems.map((o) => o.clone()))

  canvas.discardActiveObject()
  for (const clone of clones) {
    clone.set({
      left: (clone.left ?? 0) + offset,
      top: (clone.top ?? 0) + offset,
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
