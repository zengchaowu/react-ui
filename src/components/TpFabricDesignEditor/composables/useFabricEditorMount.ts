import type { Canvas, FabricObject } from 'fabric'
import { useStableBox, type ReactiveRef } from './reactivity'
import { attachFabricEditorInteractions } from '../attach/attachFabricEditorInteractions'
import { attachFabricEditorKeyboard } from '../attach/attachFabricEditorKeyboard'
import { attachFabricEditorSvgDrop } from '../attach/attachFabricEditorSvgDrop'
import { attachFabricSelectionPathHighlight } from '../attach/attachFabricSelectionPathHighlight'
import { attachFabricSelectionSizeBadge } from '../attach/attachFabricSelectionSizeBadge'
import { attachFabricContainerNameLabel } from '../attach/attachFabricContainerNameLabel'
import { attachFabricContainerContainment } from '../attach/attachFabricContainerContainment'
import { attachFabricObjectHoverHighlight } from '../attach/attachFabricObjectHoverHighlight'
import { attachFabricSmartGuides } from '../attach/attachFabricSmartGuides'
import { attachFabricEditorRulers } from '../attach/attachFabricEditorRulers'
import { attachFabricEditorPixelGrid } from '../attach/attachFabricEditorPixelGrid'
import { resolveArtboardSize, type ArtboardSize } from '../document/fabricArtboard'
import { attachFabricShapeTool } from '../attach/attachFabricShapeTool'
import { attachFabricContainerTool } from '../attach/attachFabricContainerTool'
import { attachFabricViewportPan } from '../attach/attachFabricViewportPan'
import {
  applyFabricEditorCanvasSelectionStyle,
  applyFabricEditorObjectControlStyle,
  installFabricEditorSelectionStyle,
} from '../selection/fabricEditorSelectionStyle'
import { syncGroupsInteractionFromCanvasSelection } from '../layers/fabricGroupPointerPolicy.pure'
import { clearFabricEditorClipboard } from '../document/fabricEditorClipboard'
import { attachFabricPenTool, enterFabricPathEdit, hasFabricPathEditSession, commitFabricPathEdit } from '../tools/penTool'
import type { FabricEditorToolMode } from './useFabricEditorToolMode'
import type { useFabricStage } from './useFabricStage'
import type { TpFabricDesignEditorTool } from '../types'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'

type Stage = ReturnType<typeof useFabricStage>

type MountDoc = {
  loadSvgString: (
    text: string,
    opts: {
      replace: boolean
      sourceFileName?: string
      placeAt?: { x: number; y: number }
    },
  ) => Promise<void>
  deleteSelection: () => void
  copySelection: () => void
  cutSelection: () => void
  pasteClipboard: () => void
  pasteClipboardEvent?: (e: ClipboardEvent) => void | Promise<boolean>
  hasEditorClipboardItems?: () => boolean
  selectAll: () => void
  deselectAll: () => void
  duplicateSelection: () => void
  groupSelection: () => void
  frameSelection: () => void
  ungroupSelection: () => void
  nudgeSelection: (dx: number, dy: number) => void
}

export function createFabricEditorLifecycle(options: {
  stage: Stage
  canvasRef: ReactiveRef<Canvas | undefined>
  canvasWrapRef: ReactiveRef<HTMLElement | undefined>
  toolMode: FabricEditorToolMode
  doc: MountDoc
  getReadonly: () => boolean
  getDrawBrushColor: () => string | undefined
  getInitialSvg: () => string | undefined
  getFixedCanvasSize: () => number | ArtboardSize | null | undefined
  getActiveContainerPresetId: () => string | null
  bindCanvasContextMenu: (canvas: Canvas) => void
  unbindCanvasContextMenu: () => void
  bumpFabricMenuRev: () => void
  refreshLayers: () => void
  syncAppearanceFromSelection: () => void
  syncTransformFromSelection: () => void
  syncLayerTreeSelectionFromCanvas: () => void
  onCanvasFilesDrop: (
    files: File[],
    placeAt?: { x: number; y: number },
  ) => void
  onObjectEvent: (
    e: 'object-added' | 'object-removed' | 'object-modified',
    obj: FabricObject,
  ) => void
  onReady: (canvas: Canvas) => void
  onError: (err: Error) => void
}) {

  const detachBox = useStableBox<Record<string, (() => void) | null>>({})

  function mountEditor() {
    if (!options.stage.mount()) return

    const canvas = options.canvasRef.value
    if (!canvas) return

    detachBox.value.uninstallFabricEditorSelectionStyle?.()
    detachBox.value.uninstallFabricEditorSelectionStyle = installFabricEditorSelectionStyle()
    applyFabricEditorCanvasSelectionStyle(canvas)
    for (const obj of canvas.getObjects()) {
      applyFabricEditorObjectControlStyle(obj)
    }

    const setTool = (tool: TpFabricDesignEditorTool) => options.toolMode.setTool(tool)

    attachFabricEditorInteractions({
      canvas,
      getReadonly: options.getReadonly,
      getCurrentTool: () => options.toolMode.currentTool.value,
      setTool,
      emit(e, obj) {
        options.onObjectEvent(e, obj)
      },
      bumpFabricMenuRev: options.bumpFabricMenuRev,
      refreshLayers: options.refreshLayers,
      syncAppearanceFromSelection: options.syncAppearanceFromSelection,
      syncTransformFromSelection: options.syncTransformFromSelection,
      syncLayerTreeSelectionFromCanvas: options.syncLayerTreeSelectionFromCanvas,
      enterPathEditFromDoubleClick: (target, scenePoint) =>
        enterFabricPathEdit(canvas, target, scenePoint),
    })
    syncGroupsInteractionFromCanvasSelection(canvas)

    detachBox.value.detachFabricPenTool?.()
    detachBox.value.detachFabricPenTool = attachFabricPenTool({
      canvas,
      getReadonly: options.getReadonly,
      getCurrentTool: () => options.toolMode.currentTool.value,
      getViewportTool: () => options.toolMode.getEffectiveViewportTool(),
      getDefaults: () => ({
        fill: options.getDrawBrushColor() ?? tokenSolidColors.grayColor15,
        stroke: '',
        strokeWidth: 0,
      }),
      onPathCommitted: () => {
        options.syncAppearanceFromSelection()
        options.syncTransformFromSelection()
        options.refreshLayers()
      },
      applyObjectControlStyle: applyFabricEditorObjectControlStyle,
      onPathEditSessionChange: (active) => {
        options.toolMode.setPathEditActive(active)
      },
      setTool,
    })

    detachBox.value.detachFabricShapeTool?.()
    detachBox.value.detachFabricShapeTool = attachFabricShapeTool({
      canvas,
      getReadonly: options.getReadonly,
      getCurrentTool: () => options.toolMode.currentTool.value,
      getViewportTool: () => options.toolMode.getEffectiveViewportTool(),
      setTool,
    })

    detachBox.value.detachFabricContainerTool?.()
    detachBox.value.detachFabricContainerTool = attachFabricContainerTool({
      canvas,
      getReadonly: options.getReadonly,
      getCurrentTool: () => options.toolMode.currentTool.value,
      getActiveContainerPresetId: options.getActiveContainerPresetId,
      getViewportTool: () => options.toolMode.getEffectiveViewportTool(),
      setTool,
    })

    detachBox.value.detachFabricViewportPan?.()
    detachBox.value.detachFabricViewportPan = attachFabricViewportPan({
      canvas,
      getReadonly: options.getReadonly,
      getViewportTool: () => options.toolMode.getEffectiveViewportTool(),
    })

    detachBox.value.detachFabricSelectionPathHighlight?.()
    detachBox.value.detachFabricSelectionPathHighlight = attachFabricSelectionPathHighlight(canvas)

    detachBox.value.detachFabricObjectHoverHighlight?.()
    detachBox.value.detachFabricObjectHoverHighlight = attachFabricObjectHoverHighlight({
      canvas,
      getReadonly: options.getReadonly,
      canHover: () =>
        options.toolMode.currentTool.value === 'select' &&
        options.toolMode.getEffectiveViewportTool() === 'select',
    })

    detachBox.value.detachFabricSmartGuides?.()
    detachBox.value.detachFabricSmartGuides = attachFabricSmartGuides({
      canvas,
      getReadonly: options.getReadonly,
    })

    detachBox.value.detachFabricSelectionSizeBadge?.()
    detachBox.value.detachFabricSelectionSizeBadge = attachFabricSelectionSizeBadge(canvas)

    detachBox.value.detachFabricContainerNameLabel?.()
    detachBox.value.detachFabricContainerNameLabel = attachFabricContainerNameLabel(canvas)

    detachBox.value.detachFabricContainerContainment?.()
    detachBox.value.detachFabricContainerContainment = attachFabricContainerContainment({
      canvas,
      getReadonly: options.getReadonly,
      onReparented: () => {
        options.refreshLayers()
        options.syncLayerTreeSelectionFromCanvas()
        options.bumpFabricMenuRev()
      },
    })

    detachBox.value.detachFabricEditorRulers?.()
    const rulers = attachFabricEditorRulers({
      getHost: () => options.canvasWrapRef.value,
      getCanvas: () => options.canvasRef.value,
      getVisible: () => options.toolMode.showRulers.value,
    })
    detachBox.value.detachFabricEditorRulers = rulers.dispose

    detachBox.value.detachFabricEditorPixelGrid?.()
    const pixelGrid = attachFabricEditorPixelGrid({
      getHost: () => options.canvasWrapRef.value,
      getCanvas: () => options.canvasRef.value,
      getArtboard: () => resolveArtboardSize(options.getFixedCanvasSize()),
    })
    detachBox.value.detachFabricEditorPixelGrid = pixelGrid.dispose

    detachBox.value.detachFabricEditorSvgDrop?.()
    detachBox.value.detachFabricEditorSvgDrop = attachFabricEditorSvgDrop({
      getWrapEl: () => options.canvasWrapRef.value,
      getCanvas: () => options.canvasRef.value,
      getReadonly: options.getReadonly,
      onFilesDrop: options.onCanvasFilesDrop,
    })

    detachBox.value.detachFabricEditorKeyboard?.()
    detachBox.value.detachFabricEditorKeyboard = attachFabricEditorKeyboard({
      getReadonly: options.getReadonly,
      getCanvas: () => options.canvasRef.value,
      getCurrentTool: () => options.toolMode.currentTool.value,
      hasPathEditSession: () => hasFabricPathEditSession(options.canvasRef.value),
      deleteSelection: () => options.doc.deleteSelection(),
      canDeleteSelection: () => options.toolMode.currentTool.value !== 'pen',
      copySelection: () => options.doc.copySelection(),
      cutSelection: () => options.doc.cutSelection(),
      pasteClipboard: () => options.doc.pasteClipboard(),
      pasteClipboardEvent: (e) => options.doc.pasteClipboardEvent?.(e),
      hasEditorClipboardItems: () =>
        options.doc.hasEditorClipboardItems?.() ?? false,
      selectAll: () => options.doc.selectAll(),
      deselectAll: () => options.doc.deselectAll(),
      duplicateSelection: () => options.doc.duplicateSelection(),
      groupSelection: () => options.doc.groupSelection(),
      frameSelection: () => options.doc.frameSelection(),
      ungroupSelection: () => options.doc.ungroupSelection(),
      nudgeSelection: (dx, dy) => options.doc.nudgeSelection(dx, dy),
      setTool,
      setViewportTool: options.toolMode.setViewportTool,
      setSpacePanHeld: options.toolMode.setSpacePanHeld,
      addRectangle: () => setTool('rect'),
      addCircle: () => setTool('circle'),
    })

    options.bindCanvasContextMenu(canvas)
    options.toolMode.applyCanvasToolMode()
    options.toolMode.viewportZoomPercent.value = options.stage.getZoomPercent()

    options.onReady(canvas)
    options.refreshLayers()

    const initialSvg = options.getInitialSvg()?.trim()
    if (initialSvg) {
      options.doc.loadSvgString(initialSvg, { replace: true }).catch((err) =>
        options.onError(err instanceof Error ? err : new Error(String(err))),
      )
    }
  }

  function disposeEditor() {
    detachBox.value.detachFabricViewportPan?.()
    detachBox.value.detachFabricViewportPan = null
    detachBox.value.detachFabricSelectionPathHighlight?.()
    detachBox.value.detachFabricSelectionPathHighlight = null
    detachBox.value.detachFabricObjectHoverHighlight?.()
    detachBox.value.detachFabricObjectHoverHighlight = null
    detachBox.value.detachFabricSmartGuides?.()
    detachBox.value.detachFabricSmartGuides = null
    detachBox.value.detachFabricSelectionSizeBadge?.()
    detachBox.value.detachFabricSelectionSizeBadge = null
    detachBox.value.detachFabricContainerNameLabel?.()
    detachBox.value.detachFabricContainerNameLabel = null
    detachBox.value.detachFabricContainerContainment?.()
    detachBox.value.detachFabricContainerContainment = null
    detachBox.value.detachFabricEditorRulers?.()
    detachBox.value.detachFabricEditorRulers = null
    detachBox.value.detachFabricEditorPixelGrid?.()
    detachBox.value.detachFabricEditorPixelGrid = null
    detachBox.value.detachFabricPenTool?.()
    detachBox.value.detachFabricPenTool = null
    detachBox.value.detachFabricShapeTool?.()
    detachBox.value.detachFabricShapeTool = null
    detachBox.value.detachFabricContainerTool?.()
    detachBox.value.detachFabricContainerTool = null
    detachBox.value.detachFabricEditorKeyboard?.()
    detachBox.value.detachFabricEditorKeyboard = null
    detachBox.value.detachFabricEditorSvgDrop?.()
    detachBox.value.detachFabricEditorSvgDrop = null
    clearFabricEditorClipboard()
    detachBox.value.uninstallFabricEditorSelectionStyle?.()
    detachBox.value.uninstallFabricEditorSelectionStyle = null
    options.unbindCanvasContextMenu()
    void options.stage.dispose()
  }

  return {
    mountEditor,
    disposeEditor,
    commitPathEdit: () => commitFabricPathEdit(options.canvasRef.value),
  }
}
