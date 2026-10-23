import type { Canvas } from 'fabric'
import {
  readFillLayers,
  readStrokeAlign,
  readStrokeLayers,
  type FabricFillPaintLayer,
  type FabricStrokeAlign,
  type FabricStrokePaintLayer,
} from './fabricEditorPaintLayers.pure'
import { firstLeafForAppearance } from '../document/fabricDesignEditorPure'

export type FabricAppearanceSelectionSnapshot = {
  active: boolean
  fillLayers: FabricFillPaintLayer[]
  strokeLayers: FabricStrokePaintLayer[]
  strokeAlign: FabricStrokeAlign
  strokeWidth: number
}

export const EMPTY_FABRIC_APPEARANCE_SNAPSHOT: FabricAppearanceSelectionSnapshot = {
  active: false,
  fillLayers: [],
  strokeLayers: [],
  strokeAlign: 'center',
  strokeWidth: 1,
}

export function readFabricAppearanceSelectionSnapshot(
  canvas: Canvas | undefined,
): FabricAppearanceSelectionSnapshot {
  if (!canvas) return { ...EMPTY_FABRIC_APPEARANCE_SNAPSHOT }

  const objs = canvas.getActiveObjects()
  if (!objs.length) return { ...EMPTY_FABRIC_APPEARANCE_SNAPSHOT }

  const leaf = firstLeafForAppearance(objs[0]!)
  const sw = leaf.strokeWidth
  return {
    active: true,
    fillLayers: readFillLayers(leaf),
    strokeLayers: readStrokeLayers(leaf),
    strokeAlign: readStrokeAlign(leaf),
    strokeWidth:
      typeof sw === 'number' && Number.isFinite(sw) ? sw : 1,
  }
}
