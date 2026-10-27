import { useReactiveComputed, useReactiveRef, type ReactiveRef } from './reactivity'
import { PencilBrush } from 'fabric'
import type { Canvas } from 'fabric'
import { attachFabricShapeTool, notifyFabricShapeToolChange } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/attach/attachFabricShapeTool'
import {
  fabricContainerPresetKey,
  resolveFabricContainerPreset,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/tools/fabricContainerPresets.pure'
import { isTpFabricShapeTool, type TpFabricDesignEditorTool, type TpFabricViewportTool } from '../types'
import { notifyFabricPenToolChange, hasFabricPathEditSession } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/tools/penTool'
import { tokenSolidColors } from '@zengchaowu/ui-shared/assets/tokens/tokenSolidColors'
import { createFabricBrushCursor } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/layers/fabricLayerThumbnail.pure'

/** 路径编辑顶栏子工具：编辑锚点 / 抓手平移 */
export type TpFabricPathEditTool = 'node' | 'hand'

export type FabricBrushStyle = {
  color: string
  width: number
}

export function useFabricEditorToolMode(options: {
  canvasRef: ReactiveRef<Canvas | undefined>
  getReadonly: () => boolean
  getDrawBrushColor: () => string | undefined
}) {
  const currentTool = useReactiveRef<TpFabricDesignEditorTool>('select')
  const activeContainerPresetId = useReactiveRef<string | null>(null)
  const viewportTool = useReactiveRef<TpFabricViewportTool>('select')
  /** 按住空格时的临时抓手（不改动工具栏选中态，行为同 Figma） */
  const spacePanHeld = useReactiveRef(false)
  const pathEditActive = useReactiveRef(false)
  const pathEditTool = useReactiveRef<TpFabricPathEditTool>('node')
  const viewportZoomPercent = useReactiveRef(100)
  /** 画布边缘标尺（默认开启） */
  const showRulers = useReactiveRef(true)
  const brushColor = useReactiveRef(
    options.getDrawBrushColor() ?? tokenSolidColors.grayColor15,
  )
  const brushWidth = useReactiveRef(2)

  function getBrushStyle(): FabricBrushStyle {
    return { color: brushColor.value, width: brushWidth.value }
  }

  function setBrushStyle(style: Partial<FabricBrushStyle>) {
    if (typeof style.color === 'string' && style.color.trim()) {
      brushColor.value = style.color.trim()
    }
    if (
      typeof style.width === 'number' &&
      Number.isFinite(style.width) &&
      style.width > 0
    ) {
      brushWidth.value = style.width
    }
    applyCanvasToolMode()
  }

  function getEffectiveViewportTool(): TpFabricViewportTool {
    if (spacePanHeld.value) return 'hand'
    if (viewportTool.value === 'hand') return 'hand'
    if (pathEditActive.value && pathEditTool.value === 'hand') return 'hand'
    return 'select'
  }

  function applyCanvasToolMode() {
    const canvas = options.canvasRef.value
    if (!canvas || options.getReadonly()) return

    const editingPath = pathEditActive.value || hasFabricPathEditSession(canvas)
    const handMode =
      spacePanHeld.value ||
      viewportTool.value === 'hand' ||
      (editingPath && pathEditTool.value === 'hand')

    if (handMode && !editingPath) {
      canvas.skipTargetFind = true
      canvas.selection = false
      canvas.isDrawingMode = false
      canvas.defaultCursor = 'grab'
      canvas.hoverCursor = 'grab'
      canvas.moveCursor = 'grabbing'
      notifyFabricPenToolChange(canvas)
      notifyFabricShapeToolChange(canvas)
      canvas.requestRenderAll()
      return
    }

    canvas.skipTargetFind = false
    canvas.selection = editingPath ? false : currentTool.value === 'select'
    canvas.isDrawingMode = currentTool.value === 'draw'

    if (editingPath) {
      // 路径编辑中不显示图层选中框 / 控制点 / 尺寸徽章
      canvas.discardActiveObject()
    }

    if (isTpFabricShapeTool(currentTool.value) || currentTool.value === 'frame') {
      canvas.selection = false
    }

    if (currentTool.value === 'draw') {
      const brush = new PencilBrush(canvas)
      brush.color = brushColor.value
      brush.width = brushWidth.value
      canvas.freeDrawingBrush = brush
      const cursor = createFabricBrushCursor(brushWidth.value, brushColor.value)
      canvas.freeDrawingCursor = cursor
      canvas.defaultCursor = cursor
      canvas.hoverCursor = cursor
      canvas.moveCursor = cursor
    }

    if (editingPath && handMode) {
      canvas.defaultCursor = 'grab'
      canvas.hoverCursor = 'grab'
      canvas.moveCursor = 'grabbing'
    } else if (editingPath) {
      canvas.defaultCursor = 'default'
      canvas.hoverCursor = 'default'
      canvas.moveCursor = 'default'
    } else if (currentTool.value === 'text') {
      canvas.defaultCursor = 'text'
      canvas.hoverCursor = 'text'
      canvas.moveCursor = 'text'
    } else if (currentTool.value === 'draw') {
      // 光标已在上方按笔刷尺寸设置
    } else if (
      currentTool.value === 'pen' ||
      currentTool.value === 'frame' ||
      isTpFabricShapeTool(currentTool.value)
    ) {
      canvas.defaultCursor = 'crosshair'
      canvas.hoverCursor = 'crosshair'
      canvas.moveCursor = 'crosshair'
    } else {
      // 选择工具：悬停/拖动选中图层时不改成 move 光标
      canvas.defaultCursor = 'default'
      canvas.hoverCursor = 'default'
      canvas.moveCursor = 'default'
    }
    notifyFabricPenToolChange(canvas)
    notifyFabricShapeToolChange(canvas)
    canvas.requestRenderAll()
  }

  function setSpacePanHeld(held: boolean) {
    if (spacePanHeld.value === held) return
    spacePanHeld.value = held
    applyCanvasToolMode()
  }

  function setPathEditActive(active: boolean) {
    pathEditActive.value = active
    if (active) {
      pathEditTool.value = 'node'
      viewportTool.value = 'select'
    } else {
      pathEditTool.value = 'node'
    }
    applyCanvasToolMode()
  }

  function setPathEditTool(tool: TpFabricPathEditTool) {
    pathEditTool.value = tool
    viewportTool.value = tool === 'hand' ? 'hand' : 'select'
    applyCanvasToolMode()
  }

  function setShowRulers(visible: boolean) {
    showRulers.value = visible
    options.canvasRef.value?.requestRenderAll()
  }

  function toggleShowRulers() {
    setShowRulers(!showRulers.value)
  }

  function setViewportTool(tool: TpFabricViewportTool) {
    viewportTool.value = tool
    if (pathEditActive.value) {
      pathEditTool.value = tool === 'hand' ? 'hand' : 'node'
    }
    applyCanvasToolMode()
  }

  function setTool(tool: TpFabricDesignEditorTool) {
    currentTool.value = tool
    // 进入容器工具时默认「绘制」模式；机型尺寸仅由 setContainerPreset 设置
    activeContainerPresetId.value = null
    viewportTool.value = 'select'
    if (pathEditActive.value) {
      pathEditTool.value = 'node'
    }
    applyCanvasToolMode()
  }

  function setContainerPreset(presetId: string) {
    if (!resolveFabricContainerPreset(presetId)) return
    activeContainerPresetId.value = presetId
    currentTool.value = 'frame'
    viewportTool.value = 'select'
    applyCanvasToolMode()
  }

  const toolRailActiveKey = useReactiveComputed(() => {
    if (currentTool.value === 'frame') {
      if (activeContainerPresetId.value) {
        return fabricContainerPresetKey(activeContainerPresetId.value)
      }
      return 'frame'
    }
    return currentTool.value
  })

  return {
    currentTool,
    activeContainerPresetId,
    viewportTool,
    pathEditActive,
    pathEditTool,
    viewportZoomPercent,
    showRulers,
    applyCanvasToolMode,
    getEffectiveViewportTool,
    setSpacePanHeld,
    getBrushStyle,
    setBrushStyle,
    setPathEditActive,
    setPathEditTool,
    setShowRulers,
    toggleShowRulers,
    setViewportTool,
    setTool,
    setContainerPreset,
    toolRailActiveKey,
  }
}

export type FabricEditorToolMode = ReturnType<typeof useFabricEditorToolMode>
