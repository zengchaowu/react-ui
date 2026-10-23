import {
  Circle,
  Rect,
  Triangle,
  type FabricObject,
} from 'fabric'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'
import type { TpFabricDesignEditorShapeTool } from '../types'

export const FABRIC_SHAPE_MIN_SIZE = 2

export type FabricShapeBox = {
  left: number
  top: number
  width: number
  height: number
}

export function isFabricShapeToolName(
  tool: string,
): tool is TpFabricDesignEditorShapeTool {
  return tool === 'rect' || tool === 'circle' || tool === 'triangle'
}

export function normalizeFabricShapeBox(
  start: { x: number; y: number },
  end: { x: number; y: number },
  constrainSquare: boolean,
): FabricShapeBox {
  let width = Math.abs(end.x - start.x)
  let height = Math.abs(end.y - start.y)
  if (constrainSquare) {
    const size = Math.max(width, height)
    width = size
    height = size
  }
  const left = end.x >= start.x ? start.x : start.x - width
  const top = end.y >= start.y ? start.y : start.y - height
  return { left, top, width, height }
}

export function defaultFabricShapeStyle(kind: TpFabricDesignEditorShapeTool) {
  const fill =
    kind === 'rect'
      ? tokenSolidColors.fabricEditorFillPink
      : kind === 'circle'
        ? tokenSolidColors.fabricEditorFillCyan
        : tokenSolidColors.fabricEditorFillGreen
  return {
    fill,
    stroke: tokenSolidColors.grayColor15,
    strokeWidth: 2,
    strokeUniform: true,
    objectCaching: false,
    selectable: false,
    evented: false,
  }
}

export function createFabricShapePreview(
  kind: TpFabricDesignEditorShapeTool,
  box: FabricShapeBox,
): FabricObject {
  const style = defaultFabricShapeStyle(kind)
  const width = Math.max(1, box.width)
  const height = Math.max(1, box.height)

  if (kind === 'rect') {
    return new Rect({
      ...style,
      left: box.left,
      top: box.top,
      width,
      height,
    })
  }

  if (kind === 'circle') {
    const radius = Math.max(
      FABRIC_SHAPE_MIN_SIZE / 2,
      Math.min(width, height) / 2,
    )
    return new Circle({
      ...style,
      left: box.left + width / 2 - radius,
      top: box.top + height / 2 - radius,
      radius,
    })
  }

  return new Triangle({
    ...style,
    left: box.left,
    top: box.top,
    width,
    height,
  })
}

export function updateFabricShapePreview(
  kind: TpFabricDesignEditorShapeTool,
  preview: FabricObject,
  box: FabricShapeBox,
): void {
  const width = Math.max(1, box.width)
  const height = Math.max(1, box.height)

  if (kind === 'rect' && preview instanceof Rect) {
    preview.set({ left: box.left, top: box.top, width, height })
  } else if (kind === 'circle' && preview instanceof Circle) {
    const radius = Math.max(
      FABRIC_SHAPE_MIN_SIZE / 2,
      Math.min(width, height) / 2,
    )
    preview.set({
      left: box.left + width / 2 - radius,
      top: box.top + height / 2 - radius,
      radius,
    })
  } else if (kind === 'triangle' && preview instanceof Triangle) {
    preview.set({ left: box.left, top: box.top, width, height })
  }
  preview.setCoords()
}

export function shouldConstrainFabricShapeSquare(ev: {
  shiftKey?: boolean
}): boolean {
  return Boolean(ev.shiftKey)
}
