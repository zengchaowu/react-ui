import type { Canvas } from 'fabric'
import {
  getFabricContainerLayout,
  getFabricContainerClipContent,
  isFabricContainerObject,
  type FabricContainerLayout,
} from '../tools/fabricContainerTool.pure'

export type FabricLayoutSelectionSnapshot = {
  active: boolean
  layout: FabricContainerLayout
  clipContent: boolean
}

export const EMPTY_FABRIC_LAYOUT_SNAPSHOT: FabricLayoutSelectionSnapshot = {
  active: false,
  layout: {
    mode: 'free',
    direction: 'vertical',
    gap: 8,
    padding: 8,
    align: 'start',
    justify: 'start',
    columns: 2,
  },
  clipContent: false,
}

/** 仅单选且为容器时显示布局检视项。 */
export function readFabricLayoutSelectionSnapshot(
  canvas: Canvas | undefined,
): FabricLayoutSelectionSnapshot {
  if (!canvas) {
    return {
      ...EMPTY_FABRIC_LAYOUT_SNAPSHOT,
      layout: { ...EMPTY_FABRIC_LAYOUT_SNAPSHOT.layout },
    }
  }
  const objs = canvas.getActiveObjects()
  if (objs.length !== 1) {
    return {
      ...EMPTY_FABRIC_LAYOUT_SNAPSHOT,
      layout: { ...EMPTY_FABRIC_LAYOUT_SNAPSHOT.layout },
    }
  }
  const o = objs[0]!
  if (!isFabricContainerObject(o)) {
    return {
      ...EMPTY_FABRIC_LAYOUT_SNAPSHOT,
      layout: { ...EMPTY_FABRIC_LAYOUT_SNAPSHOT.layout },
    }
  }
  return {
    active: true,
    layout: getFabricContainerLayout(o),
    clipContent: getFabricContainerClipContent(o),
  }
}
