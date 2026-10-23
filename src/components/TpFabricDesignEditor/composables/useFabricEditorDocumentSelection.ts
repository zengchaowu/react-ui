import type { ReactiveRef } from './reactivity'
import type { Canvas } from 'fabric'
import {
  ActiveSelection,
  Group,
  type FabricObject,
} from 'fabric'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'
import { resolveFabricCanvasBackgroundColor } from '../document/fabricEditorBackground.pure'
import { isFabricArtboardGuide } from '../document/fabricArtboard'
import { clearFabricEditorClipboard, fabricEditorCopySelection, fabricEditorPasteClipboard } from '../document/fabricEditorClipboard'
import type { FabricEditorDocumentContext } from '../document/fabricEditorDocument.types'
import {
  addFabricPrimitiveToCanvas,
  createFabricEditorCircle,
  createFabricEditorLine,
  createFabricEditorRectangle,
  createFabricEditorText,
  createFabricEditorTriangle,
} from '../document/fabricEditorDocumentPrimitives.pure'
import { syncGroupsInteractionFromCanvasSelection } from '../layers/fabricGroupPointerPolicy.pure'
import { frameFabricCanvasSelection } from '../layers/fabricEditorFrameSelection.pure'
import {
  fabricEditorDeselectAll,
  fabricEditorDuplicateSelection,
  fabricEditorNudgeSelection,
  fabricEditorSelectAll,
} from '../selection/fabricEditorSelectionActions'
import { assignDefaultFabricLayerName } from '../layers/fabricLayerNaming.pure'
import type { TpFabricDesignEditorTool } from '../types'

export function useFabricEditorDocumentSelection(options: {
  canvasRef: ReactiveRef<Canvas | undefined>
  ctx: FabricEditorDocumentContext
  setTool: (tool: TpFabricDesignEditorTool) => void
}) {
  const { canvasRef, ctx, setTool } = options

  function afterSelectionMutation(canvas: Canvas) {
    syncGroupsInteractionFromCanvasSelection(canvas)
    ctx.bumpFabricMenuRev()
    ctx.refreshLayers()
  }

  function clearCanvas() {
    const canvas = canvasRef.value
    if (!canvas) return
    canvas.clear()
    canvas.backgroundColor = resolveFabricCanvasBackgroundColor(
      ctx.getBackgroundColor(),
      tokenSolidColors.white,
    )
    clearFabricEditorClipboard()
    ctx.setAppearanceSelectionActive(false)
    canvas.requestRenderAll()
    ctx.bumpFabricMenuRev()
    ctx.refreshLayers()
    ctx.syncStageDimensions?.()
  }

  function addRectangle() {
    const canvas = canvasRef.value
    if (!canvas) return
    addFabricPrimitiveToCanvas(canvas, createFabricEditorRectangle(), setTool)
  }

  function addCircle() {
    const canvas = canvasRef.value
    if (!canvas) return
    addFabricPrimitiveToCanvas(canvas, createFabricEditorCircle(), setTool)
  }

  function addTriangle() {
    const canvas = canvasRef.value
    if (!canvas) return
    addFabricPrimitiveToCanvas(canvas, createFabricEditorTriangle(), setTool)
  }

  function addLine() {
    const canvas = canvasRef.value
    if (!canvas) return
    addFabricPrimitiveToCanvas(canvas, createFabricEditorLine(), setTool)
  }

  function addFabricText() {
    const canvas = canvasRef.value
    if (!canvas) return
    addFabricPrimitiveToCanvas(canvas, createFabricEditorText(), setTool)
  }

  function deleteSelection() {
    const canvas = canvasRef.value
    if (!canvas || ctx.getReadonly()) return
    const active = canvas
      .getActiveObjects()
      .filter((obj) => !isFabricArtboardGuide(obj))
    if (!active.length) return
    canvas.remove(...active)
    canvas.discardActiveObject()
    canvas.requestRenderAll()
    afterSelectionMutation(canvas)
  }

  async function copySelection() {
    const canvas = canvasRef.value
    if (!canvas || ctx.getReadonly()) return
    await fabricEditorCopySelection(canvas)
  }

  async function cutSelection() {
    const canvas = canvasRef.value
    if (!canvas || ctx.getReadonly()) return
    const copied = await fabricEditorCopySelection(canvas)
    if (!copied) return
    deleteSelection()
  }

  async function pasteClipboard() {
    const canvas = canvasRef.value
    if (!canvas || ctx.getReadonly()) return
    const clones = await fabricEditorPasteClipboard(canvas)
    if (clones.length) {
      setTool('select')
      canvas.requestRenderAll()
      afterSelectionMutation(canvas)
      return true
    }
    return false
  }

  function selectAll() {
    const canvas = canvasRef.value
    if (!canvas || ctx.getReadonly()) return
    if (!fabricEditorSelectAll(canvas)) return
    setTool('select')
    canvas.requestRenderAll()
    afterSelectionMutation(canvas)
  }

  function deselectAll() {
    const canvas = canvasRef.value
    if (!canvas || ctx.getReadonly()) return
    fabricEditorDeselectAll(canvas)
    canvas.requestRenderAll()
  }

  async function duplicateSelection() {
    const canvas = canvasRef.value
    if (!canvas || ctx.getReadonly()) return
    const clones = await fabricEditorDuplicateSelection(canvas)
    if (!clones.length) return
    setTool('select')
    canvas.requestRenderAll()
    afterSelectionMutation(canvas)
  }

  function nudgeSelection(dx: number, dy: number) {
    const canvas = canvasRef.value
    if (!canvas || ctx.getReadonly()) return
    if (!fabricEditorNudgeSelection(canvas, dx, dy)) return
    canvas.requestRenderAll()
    afterSelectionMutation(canvas)
  }

  function groupSelection() {
    const canvas = canvasRef.value
    if (!canvas || ctx.getReadonly()) return

    const active = canvas.getActiveObject()
    if (!(active instanceof ActiveSelection)) return

    const objects = active.getObjects().slice()
    if (objects.length < 2) return

    canvas.discardActiveObject()
    canvas.remove(...objects)
    const group = new Group(objects)
    canvas.add(group)
    assignDefaultFabricLayerName(canvas, group)
    canvas.setActiveObject(group)
    canvas.requestRenderAll()
    syncGroupsInteractionFromCanvasSelection(canvas)
  }

  /** 选区 → 容器图层（Figma Frame selection） */
  function frameSelection() {
    const canvas = canvasRef.value
    if (!canvas || ctx.getReadonly()) return
    if (!frameFabricCanvasSelection(canvas)) return
    afterSelectionMutation(canvas)
  }

  function ungroupSelection() {
    const canvas = canvasRef.value
    if (!canvas || ctx.getReadonly()) return

    const active = canvas.getActiveObject()
    if (!(active instanceof Group) || active instanceof ActiveSelection) return

    const group = active as Group
    const items = group.removeAll()
    canvas.remove(group)
    for (const obj of items) {
      canvas.add(obj)
    }
    canvas.discardActiveObject()
    canvas.requestRenderAll()
    syncGroupsInteractionFromCanvasSelection(canvas)
  }

  return {
    clearCanvas,
    addRectangle,
    addCircle,
    addTriangle,
    addLine,
    addFabricText,
    deleteSelection,
    copySelection,
    cutSelection,
    pasteClipboard,
    selectAll,
    deselectAll,
    duplicateSelection,
    nudgeSelection,
    groupSelection,
    frameSelection,
    ungroupSelection,
  }
}
