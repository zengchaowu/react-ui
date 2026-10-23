import {
  Circle,
  IText,
  Line,
  Rect,
  Triangle,
  type Canvas,
  type FabricObject,
} from 'fabric'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'
import { assignDefaultFabricLayerName } from '../layers/fabricLayerNaming.pure'
import type { TpFabricDesignEditorTool } from '../types'

export function createFabricEditorRectangle() {
  return new Rect({
    left: 80,
    top: 80,
    width: 120,
    height: 90,
    fill: tokenSolidColors.fabricEditorFillPink,
    stroke: tokenSolidColors.grayColor15,
    strokeWidth: 2,
  })
}

export function createFabricEditorCircle() {
  return new Circle({
    left: 260,
    top: 80,
    radius: 56,
    fill: tokenSolidColors.fabricEditorFillCyan,
    stroke: tokenSolidColors.grayColor15,
    strokeWidth: 2,
  })
}

export function createFabricEditorTriangle() {
  return new Triangle({
    left: 420,
    top: 70,
    width: 110,
    height: 100,
    fill: tokenSolidColors.fabricEditorFillGreen,
    stroke: tokenSolidColors.grayColor15,
    strokeWidth: 2,
  })
}

export function createFabricEditorLine() {
  return new Line([40, 320, 220, 380], {
    stroke: tokenSolidColors.grayColor15,
    strokeWidth: 3,
  })
}

export function createFabricEditorText() {
  return new IText('文本', {
    left: 120,
    top: 200,
    fill: tokenSolidColors.grayColor15,
    fontSize: 28,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    editable: true,
  })
}

export function addFabricPrimitiveToCanvas(
  canvas: Canvas,
  object: FabricObject,
  setTool: (tool: TpFabricDesignEditorTool) => void,
) {
  canvas.add(object)
  assignDefaultFabricLayerName(canvas, object)
  canvas.setActiveObject(object)
  canvas.requestRenderAll()
  setTool('select')
}
