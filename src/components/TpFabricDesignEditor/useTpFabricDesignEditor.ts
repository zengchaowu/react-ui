import { useEffect, useRef } from 'react'
import type {
  FabricDesignEditorEmitFn,
  TpFabricDesignEditorComponentProps,
} from './types'
import { runFabricEditorContextMenuAction } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/document/fabricEditorContextMenuActions.pure'
import { useFabricEditorDocument } from './composables/useFabricEditorDocument'
import { useFabricEditorInspectorState } from './composables/useFabricEditorInspectorState'
import { useFabricEditorLayerPanel } from './composables/useFabricEditorLayerPanel'
import { useFabricStage } from './composables/useFabricStage'
import { useFabricDesignEditorContextMenu } from './composables/useFabricDesignEditorContextMenu'
import { useFabricDesignEditorAiPanel } from './composables/useFabricDesignEditorAiPanel'
import { useFabricEditorToolMode, type FabricEditorToolMode } from './composables/useFabricEditorToolMode'
import { useFabricToolRail } from './composables/useFabricToolRail'
import { useFabricSvgImport } from './composables/useFabricSvgImport'
import { useFabricEditorPages } from './composables/useFabricEditorPages'
import { useFabricEditorComponents } from './composables/useFabricEditorComponents'
import { createFabricEditorLifecycle } from './composables/useFabricEditorMount'
import { useFabricEditorPropsSync } from './composables/useFabricEditorPropsSync'
import {
  nextTick,
  useReactiveComputed,
  useReactiveRef,
  useStableBox,
  useWatch,
} from './composables/reactivity'
import { tpFabricEditorStageClass } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/styles'
import { resolveFabricCanvasBackgroundColor } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/document/fabricEditorBackground.pure'

export function useTpFabricDesignEditor(
  props: TpFabricDesignEditorComponentProps,
  emit: FabricDesignEditorEmitFn,
) {
  // Vue props 是响应式代理，任意时刻读取都是最新值；React 用 propsRef 对齐该语义。
  const propsRef = useRef(props)
  propsRef.current = props

  const canvasWrapRef = useReactiveRef<HTMLElement | undefined>()
  const canvasHostRef = useReactiveRef<HTMLDivElement | undefined>()

  const toolModeBox = useStableBox<{ current: FabricEditorToolMode | null }>({
    current: null,
  })

  const stage = useFabricStage({
    canvasWrapRef,
    canvasHostRef,
    getFallbackSize: () => ({
      width: propsRef.current.width ?? 800,
      height: propsRef.current.height ?? 600,
    }),
    getFabricConstructorOptions: () => ({
      backgroundColor: resolveFabricCanvasBackgroundColor(propsRef.current.backgroundColor),
      preserveObjectStacking: true,
      centeredScaling: false,
      centeredRotation: true,
      // 默认自由缩放；按住 Shift（uniScaleKey）时等比锁定
      uniformScaling: false,
      uniScaleKey: 'shiftKey',
    }),
    enableZoom: () => propsRef.current.enableZoom ?? true,
    minZoom: () => propsRef.current.minZoom ?? 0.05,
    maxZoom: () => propsRef.current.maxZoom ?? 32,
    onViewportChange: () => {
      const tm = toolModeBox.value.current
      if (tm) tm.viewportZoomPercent.value = stage.getZoomPercent()
    },
  })

  const canvasRef = stage.canvasRef

  const toolMode = useFabricEditorToolMode({
    canvasRef,
    getReadonly: () => propsRef.current.readonly ?? false,
    getDrawBrushColor: () => propsRef.current.drawBrushColor,
  })
  toolModeBox.value.current = toolMode

  const inspector = useFabricEditorInspectorState({
    canvasRef,
    props,
    emit,
    hasIconMetaSlot: () => Boolean(propsRef.current.inspectorIconMetaSlot),
    getIsDrawTool: () => toolMode.currentTool.value === 'draw',
    getBrushStyle: () => toolMode.getBrushStyle(),
    setBrushStyle: (style) => toolMode.setBrushStyle(style),
  })

  useWatch(
    () => toolMode.currentTool.value,
    () => {
      inspector.syncAppearanceFromSelection()
    },
  )

  let doc!: ReturnType<typeof useFabricEditorDocument>
  let componentsApi!: ReturnType<typeof useFabricEditorComponents>

  const {
    bumpFabricMenuRev,
    bindCanvasContextMenu,
    unbindCanvasContextMenu,
    openLayerContextMenu,
  } = useFabricDesignEditorContextMenu({
    canvasRef,
    getProps: () => ({ readonly: propsRef.current.readonly }),
    onSelect: (key) => {
      if (key === 'create-component') {
        componentsApi.createFromSelection()
        return
      }
      runFabricEditorContextMenuAction(key, doc)
    },
  })

  const layerPanel = useFabricEditorLayerPanel({
    canvasRef,
    getShowLayersPanel: () => propsRef.current.showLayersPanel ?? true,
    getReadonly: () => propsRef.current.readonly ?? false,
    inspector,
    openLayerContextMenu,
  })

  doc = useFabricEditorDocument({
    canvasRef,
    getProps: () => ({
      readonly: propsRef.current.readonly,
      backgroundColor: propsRef.current.backgroundColor,
      fixedCanvasSize: propsRef.current.fixedCanvasSize,
      svgImportGroupElements: propsRef.current.svgImportGroupElements,
    }),
    syncStageDimensions: () => stage.syncStageDimensions(),
    emit,
    setTool: toolMode.setTool,
    bumpFabricMenuRev,
    refreshLayers: layerPanel.refreshLayers,
    appearanceSelectionActive: inspector.appearanceSelectionActive,
  })

  const aiPanel = useFabricDesignEditorAiPanel({
    getProps: () => ({ readonly: propsRef.current.readonly, designAi: propsRef.current.designAi }),
    getSelectionContextJson: () => doc.getSelectionContextJson(),
    hasSelection: () => {
      const canvas = canvasRef.value
      return Boolean(canvas && canvas.getActiveObjects().length > 0)
    },
    applyDesignDocument: (designDoc, opts) =>
      doc.applyDesignDocument(designDoc, opts),
    replaceSelectionWithDesignDocument: (designDoc) =>
      doc.replaceSelectionWithDesignDocument(designDoc),
    emit,
  })

  const svgImport = useFabricSvgImport({
    getReadonly: () => propsRef.current.readonly ?? false,
    getDefaultImportMode: () => propsRef.current.svgImportMode ?? 'append',
    loadSvgString: doc.loadSvgString,
    loadImageFile: doc.loadImageFile,
    emit,
  })

  const pagesApi = useFabricEditorPages({
    getReadonly: () => propsRef.current.readonly ?? false,
    getSvgString: () => doc.getCanvasDocumentSvg(),
    loadPageSvg: (svg) => doc.loadSvgString(svg, { replace: true }),
    clearCanvas: () => doc.clearCanvas(),
  })

  componentsApi = useFabricEditorComponents({
    getReadonly: () => propsRef.current.readonly ?? false,
    getSelectionSvgString: () => doc.getSelectionSvgString(),
    placeComponentSvg: (svg) => doc.loadSvgString(svg, { replace: false }),
  })

  const canCreateComponent = useReactiveComputed(
    () => inspector.transformSelectionActive.value,
  )

  const toolRail = useFabricToolRail({
    getHiddenKeys: () => propsRef.current.toolRailHiddenKeys,
    setTool: toolMode.setTool,
    setContainerPreset: toolMode.setContainerPreset,
    openFilePicker: svgImport.openFilePicker,
    groupSelection: () => doc.groupSelection(),
    frameSelection: () => doc.frameSelection(),
    ungroupSelection: () => doc.ungroupSelection(),
    exportSvgToFile: () => doc.exportSvgToFile(),
    exportSelectedSvgToFile: () => doc.exportSelectedSvgToFile(),
    deleteSelection: () => doc.deleteSelection(),
    clearCanvas: () => doc.clearCanvas(),
  })

  const { mountEditor, disposeEditor, commitPathEdit } = createFabricEditorLifecycle({
    stage,
    canvasRef,
    canvasWrapRef,
    toolMode,
    doc,
    getReadonly: () => propsRef.current.readonly ?? false,
    getDrawBrushColor: () => propsRef.current.drawBrushColor,
    getInitialSvg: () => propsRef.current.initialSvg,
    getFixedCanvasSize: () => propsRef.current.fixedCanvasSize,
    getActiveContainerPresetId: () => toolMode.activeContainerPresetId.value,
    bindCanvasContextMenu,
    unbindCanvasContextMenu,
    bumpFabricMenuRev,
    refreshLayers: () => nextTick(() => layerPanel.refreshLayers()),
    syncAppearanceFromSelection: inspector.syncAppearanceFromSelection,
    syncTransformFromSelection: inspector.syncTransformFromSelection,
    syncLayerTreeSelectionFromCanvas: layerPanel.syncLayerTreeSelectionFromCanvas,
    onCanvasFilesDrop: svgImport.onCanvasFilesDrop,
    onObjectEvent(e, obj) {
      if (e === 'object-added') emit('object-added', obj)
      else if (e === 'object-removed') emit('object-removed', obj)
      else emit('object-modified', obj)
    },
    onReady: (canvas) => emit('ready', canvas),
    onError: (err) => emit('error', err),
  })

  useFabricEditorPropsSync({
    props,
    canvasRef,
    stage,
    toolMode,
    doc,
    bumpFabricMenuRev,
    refreshLayers: layerPanel.refreshLayers,
    clearLayerState: layerPanel.clearLayerState,
  })

  const lifecycleRef = useRef({ mountEditor, disposeEditor, pagesApi, layerPanel })
  lifecycleRef.current = { mountEditor, disposeEditor, pagesApi, layerPanel }

  useEffect(() => {
    const { mountEditor: mount } = lifecycleRef.current
    mount()
    return () => {
      const { disposeEditor: dispose, pagesApi: pages, layerPanel: layers } =
        lifecycleRef.current
      pages.flushActivePage()
      dispose()
      layers.clearLayerState()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    canvasHostClass: tpFabricEditorStageClass,
    canvasWrapRef,
    canvasHostRef,
    stage,
    toolMode,
    layerPanel,
    inspector,
    svgImport,
    toolRail,
    doc,
    aiPanel,
    commitPathEdit,
    pagesApi,
    componentsApi,
    canCreateComponent,
  }
}
