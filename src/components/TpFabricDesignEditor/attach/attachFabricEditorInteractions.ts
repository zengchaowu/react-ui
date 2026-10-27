import type { FabricObject, TPointerEvent } from 'fabric'
import { IText, type Canvas } from 'fabric'
import {
  syncGroupsInteractionFromCanvasSelection,
  tryDrillIntoGroupOnDoubleClick,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/layers/fabricGroupPointerPolicy.pure'
import { tokenSolidColors } from '@zengchaowu/ui-shared/assets/tokens/tokenSolidColors'
import { applyFabricEditorObjectControlStyle } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/selection/fabricEditorSelectionStyle'
import {
  removePaintClonesForObject,
  syncPaintCloneTransforms,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/appearance/fabricEditorPaintLayers.pure'
import { assignDefaultFabricLayerName } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/layers/fabricLayerNaming.pure'
import { hasFabricPathEditSession } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/tools/penTool'
import { isFabricLayerRefreshSuspended } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/layers/fabricLayerRefreshGate.pure'
import type { TpFabricDesignEditorTool } from '../types'

type EditorEmit = (
  e: 'object-added' | 'object-removed' | 'object-modified',
  obj: FabricObject,
) => void

/**
 * 画布事件：对象增删改、选区与外观同步、文本工具与双击编辑。
 * 监听挂在 Fabric 实例上，随 `canvas.dispose()` 一并移除。
 */
export function attachFabricEditorInteractions(options: {
  canvas: Canvas
  getReadonly: () => boolean
  getCurrentTool: () => TpFabricDesignEditorTool
  setTool: (t: TpFabricDesignEditorTool) => void
  emit: EditorEmit
  bumpFabricMenuRev: () => void
  refreshLayers: () => void
  syncAppearanceFromSelection: () => void
  syncTransformFromSelection: () => void
  syncLayerTreeSelectionFromCanvas: () => void
  enterPathEditFromDoubleClick?: (
    target: FabricObject | undefined,
    scenePoint: { x: number; y: number },
  ) => boolean
}) {
  const {
    canvas,
    getReadonly,
    getCurrentTool,
    setTool,
    emit,
    bumpFabricMenuRev,
    refreshLayers,
    syncAppearanceFromSelection,
    syncTransformFromSelection,
    syncLayerTreeSelectionFromCanvas,
    enterPathEditFromDoubleClick,
  } = options

  function refreshLayersIfAllowed() {
    if (
      hasFabricPathEditSession(canvas) ||
      isFabricLayerRefreshSuspended(canvas)
    ) {
      return
    }
    refreshLayers()
  }

  function syncLayerSelectionIfAllowed() {
    if (
      hasFabricPathEditSession(canvas) ||
      isFabricLayerRefreshSuspended(canvas)
    ) {
      return
    }
    syncLayerTreeSelectionFromCanvas()
  }

  canvas.on('object:added', (e) => {
    const t = e.target
    if (t) {
      applyFabricEditorObjectControlStyle(t)
      emit('object-added', t)
    }
    bumpFabricMenuRev()
    refreshLayersIfAllowed()
  })
  canvas.on('object:removed', (e) => {
    const t = e.target
    if (t) {
      removePaintClonesForObject(canvas, t)
      emit('object-removed', t)
    }
    bumpFabricMenuRev()
    refreshLayersIfAllowed()
  })
  canvas.on('object:modified', (e) => {
    const t = e.target
    if (t) {
      if (!hasFabricPathEditSession(canvas)) {
        syncPaintCloneTransforms(t)
      }
      emit('object-modified', t)
    }
    syncAppearanceFromSelection()
    syncTransformFromSelection()
    refreshLayersIfAllowed()
  })

  canvas.on('selection:created', () => {
    if (hasFabricPathEditSession(canvas)) {
      canvas.discardActiveObject()
      canvas.requestRenderAll()
      return
    }
    const active = canvas.getActiveObject()
    if (active) applyFabricEditorObjectControlStyle(active)
    syncGroupsInteractionFromCanvasSelection(canvas)
    syncAppearanceFromSelection()
    syncTransformFromSelection()
    bumpFabricMenuRev()
    syncLayerSelectionIfAllowed()
  })
  canvas.on('selection:updated', () => {
    if (hasFabricPathEditSession(canvas)) {
      canvas.discardActiveObject()
      canvas.requestRenderAll()
      return
    }
    const active = canvas.getActiveObject()
    if (active) applyFabricEditorObjectControlStyle(active)
    syncGroupsInteractionFromCanvasSelection(canvas)
    syncAppearanceFromSelection()
    syncTransformFromSelection()
    bumpFabricMenuRev()
    syncLayerSelectionIfAllowed()
  })
  canvas.on('selection:cleared', () => {
    syncGroupsInteractionFromCanvasSelection(canvas)
    syncAppearanceFromSelection()
    syncTransformFromSelection()
    bumpFabricMenuRev()
    syncLayerSelectionIfAllowed()
  })

  canvas.on('mouse:dblclick', (opt) => {
    if (getReadonly()) return

    const t = opt.target as FabricObject | undefined
    const e = opt.e as TPointerEvent

    if (t instanceof IText && t.editable !== false) {
      canvas.setActiveObject(t)
      t.enterEditing(e)
      canvas.requestRenderAll()
      return
    }

    if (getCurrentTool() !== 'select') {
      return
    }

    const scenePoint = canvas.getScenePoint(e)
    if (enterPathEditFromDoubleClick?.(t, scenePoint)) {
      syncAppearanceFromSelection()
      syncTransformFromSelection()
      bumpFabricMenuRev()
      return
    }

    if (tryDrillIntoGroupOnDoubleClick(canvas, t, scenePoint)) {
      syncGroupsInteractionFromCanvasSelection(canvas)
      syncAppearanceFromSelection()
      syncTransformFromSelection()
      bumpFabricMenuRev()
      refreshLayersIfAllowed()
      syncLayerSelectionIfAllowed()
    }
  })

  canvas.on('mouse:down', (opt) => {
    if (getReadonly() || getCurrentTool() !== 'text') return
    if (opt.target) return

    const e = opt.e as TPointerEvent
    if ('button' in e && e.button !== 0) return

    const pointer = canvas.getScenePoint(e)
    const text = new IText('输入文字', {
      left: pointer.x,
      top: pointer.y,
      fill: tokenSolidColors.grayColor15,
      fontSize: 22,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    })
    canvas.add(text)
    assignDefaultFabricLayerName(canvas, text)
    canvas.setActiveObject(text)
    queueMicrotask(() => {
      text.enterEditing()
      canvas.requestRenderAll()
    })
    syncAppearanceFromSelection()
    syncTransformFromSelection()
    setTool('select')
  })
}
