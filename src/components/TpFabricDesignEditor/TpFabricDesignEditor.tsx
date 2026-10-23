import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import type { Canvas, FabricObject } from 'fabric'
import CwDesignEditorShell from '../CwDesignEditorShell/CwDesignEditorShell'
import CwDesignToolRail from '../CwDesignToolRail/CwDesignToolRail'
import CwFileDropTarget from '../CwFileDropTarget/CwFileDropTarget'
import CwIcon from '../CwIcon/CwIcon'
import type {
  FabricDesignEditorEmitFn,
  TpFabricDesignEditorComponentProps,
  TpFabricDesignEditorEmits,
  TpFabricDesignEditorExpose,
} from './types'
import TpFabricDesignEditorAiPanel from './components/TpFabricDesignEditorAiPanel'
import TpFabricDesignEditorInspectorPanel from './components/TpFabricDesignEditorInspectorPanel'
import TpFabricDesignLeftPanel from './components/TpFabricDesignLeftPanel'
import TpFabricPathEditToolbar from './components/TpFabricPathEditToolbar'
import TpFabricViewportToolbar from './components/TpFabricViewportToolbar'
import { defaultTpFabricDesignEditorRootClass } from './styles'
import { useTpFabricDesignEditor } from './useTpFabricDesignEditor'
import './tp-fabric-editor-stage.css'

export type { TpFabricDesignEditorComponentProps }

export const TpFabricDesignEditor = forwardRef<
  TpFabricDesignEditorExpose,
  TpFabricDesignEditorComponentProps
>(function TpFabricDesignEditor(props, ref) {
  const {
    readonly = false,
    showToolbar = true,
    showLayersPanel = true,
    enableZoom = true,
    toolRailPlacement = 'top',
    shellHeaderSlot,
    toolRailLeadingSlot,
    inspectorIconMetaSlot,
  } = props

  // Vue props 响应式语义：emit 稳定且始终读取最新回调
  const latestPropsRef = useRef(props)
  latestPropsRef.current = props
  const emit = useMemo<FabricDesignEditorEmitFn>(() => {
    const fn = (
      event: keyof TpFabricDesignEditorEmits & string,
      ...args: unknown[]
    ) => {
      const p = latestPropsRef.current
      switch (event) {
        case 'ready':
          p.onReady?.(args[0] as Canvas)
          break
        case 'error':
          p.onError?.(args[0] as Error)
          break
        case 'design-ai-applied':
          p.onDesignAiApplied?.()
          break
        case 'export-svg':
          p.onExportSvg?.(args[0] as string)
          break
        case 'export-svg-selection':
          p.onExportSvgSelection?.(args[0] as string)
          break
        case 'object-added':
          p.onObjectAdded?.(args[0] as FabricObject)
          break
        case 'object-removed':
          p.onObjectRemoved?.(args[0] as FabricObject)
          break
        case 'object-modified':
          p.onObjectModified?.(args[0] as FabricObject)
          break
      }
    }
    return fn as FabricDesignEditorEmitFn
  }, [])

  const {
    canvasHostClass,
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
  } = useTpFabricDesignEditor(props, emit)

  const {
    aiAssistantEnabled,
    aiAssistantReady,
    showAssistantPanel,
    agentDisplayName,
    hasSelectionContext,
    chatListMessages,
    streaming: aiStreaming,
    executingPlan,
    busy: aiBusy,
    activePlan,
    planAwaitingStart,
    toggleAiPanel,
    closeAiPanel,
    clearChat,
    stopStream,
    startPlanExecution,
    onComposerSubmit,
  } = aiPanel

  const {
    pages,
    activePageId,
    switching: pageSwitching,
    selectPage,
    addPage,
    renamePage,
    deletePage,
  } = pagesApi

  const {
    components,
    createFromSelection: createComponentFromSelection,
    placeComponent,
    renameComponent,
    deleteComponent,
  } = componentsApi

  const {
    viewportTool,
    pathEditActive,
    pathEditTool,
    viewportZoomPercent,
    showRulers,
    setViewportTool,
    setPathEditTool,
    setShowRulers,
    setTool,
    toolRailActiveKey,
  } = toolMode

  const {
    layerTreeData,
    layerSelectedKeys,
    moveLayerByTreeReorder,
    onLayerRename,
    onLayerToggleVisible,
    onLayerToggleLocked,
    onLayerTreeSelectedKeysUpdate,
    onLayerContextMenu,
  } = layerPanel

  const { toolRailGroups, onToolRailItemClick } = toolRail

  const { fileInputRef, openFilePicker, onFileChange, onCanvasFilesDrop } =
    svgImport

  useImperativeHandle(ref, () => ({
    getCanvas: () => stage.canvasRef.value,
    getSvgString: doc.getSvgString,
    getSelectionSvgString: doc.getSelectionSvgString,
    loadSvgString: doc.loadSvgString,
    loadImageFile: doc.loadImageFile,
    clearCanvas: doc.clearCanvas,
    openImportPicker: openFilePicker,
    exportSvgToFile: doc.exportSvgToFile,
    exportSelectedSvgToFile: doc.exportSelectedSvgToFile,
    groupSelection: doc.groupSelection,
    frameSelection: doc.frameSelection,
    ungroupSelection: doc.ungroupSelection,
    addRectangle: doc.addRectangle,
    addCircle: doc.addCircle,
    addTriangle: doc.addTriangle,
    addLine: doc.addLine,
    addFabricText: doc.addFabricText,
    deleteSelection: doc.deleteSelection,
    setTool,
  }))

  return (
    <div className={defaultTpFabricDesignEditorRootClass}>
      <CwDesignEditorShell
        showToolRail={showToolbar && !readonly}
        showLeftPanel={showLayersPanel}
        showInspector={showToolbar && !readonly && !showAssistantPanel.value}
        showAssistant={showAssistantPanel.value}
        headerSlot={shellHeaderSlot}
        toolRailSlot={
          pathEditActive.value ? (
            <TpFabricPathEditToolbar
              activeTool={pathEditTool.value}
              onActiveToolChange={setPathEditTool}
              onDone={commitPathEdit}
            />
          ) : (
            <CwDesignToolRail
              groups={toolRailGroups.value}
              activeKey={toolRailActiveKey.value}
              placement={toolRailPlacement}
              onItemClick={onToolRailItemClick}
              leadingSlot={toolRailLeadingSlot}
            />
          )
        }
        leftPanelSlot={
          <TpFabricDesignLeftPanel
            readonly={readonly}
            switching={pageSwitching.value}
            pages={pages.value}
            activePageId={activePageId.value}
            layerData={layerTreeData.value}
            layerSelectedKeys={pathEditActive.value ? [] : layerSelectedKeys.value}
            layerSelectable={!readonly && !pathEditActive.value}
            layerRenameable={!readonly && !pathEditActive.value}
            layerReorderable={!readonly && !pathEditActive.value}
            components={components.value}
            canCreateComponent={canCreateComponent.value}
            onSelectPage={selectPage}
            onAddPage={addPage}
            onDeletePage={deletePage}
            onRenamePage={renamePage}
            onLayerSelectedKeysChange={onLayerTreeSelectedKeysUpdate}
            onLayerRename={onLayerRename}
            onLayerToggleVisible={onLayerToggleVisible}
            onLayerToggleLocked={onLayerToggleLocked}
            onLayerReorder={moveLayerByTreeReorder}
            onLayerContextMenu={onLayerContextMenu}
            onCreateComponent={createComponentFromSelection}
            onPlaceComponent={placeComponent}
            onRenameComponent={renameComponent}
            onDeleteComponent={deleteComponent}
          />
        }
        inspectorSlot={
          <TpFabricDesignEditorInspectorPanel
            sections={inspector.inspectorSections.value}
            readonly={readonly}
            fillLayers={inspector.fillLayers.value}
            strokeLayers={inspector.strokeLayers.value}
            appearanceStrokeWidth={inspector.appearanceStrokeWidth.value}
            strokeAlign={inspector.strokeAlign.value}
            transformX={inspector.transformX.value}
            transformY={inspector.transformY.value}
            transformW={inspector.transformW.value}
            transformH={inspector.transformH.value}
            transformAngle={inspector.transformAngle.value}
            transformFlipX={inspector.transformFlipX.value}
            transformFlipY={inspector.transformFlipY.value}
            transformCornerRadius={inspector.transformCornerRadius.value}
            lockAspectRatio={inspector.lockAspectRatio.value}
            transformMultiSelection={inspector.transformMultiSelection.value}
            layoutMode={inspector.layoutMode.value}
            layoutDirection={inspector.layoutDirection.value}
            layoutGap={inspector.layoutGap.value}
            layoutPadding={inspector.layoutPadding.value}
            layoutAlign={inspector.layoutAlign.value}
            layoutJustify={inspector.layoutJustify.value}
            layoutColumns={inspector.layoutColumns.value}
            layoutClipContent={inspector.layoutClipContent.value}
            inspectorIconMetaSlot={inspectorIconMetaSlot}
            onAlign={inspector.alignSelection}
            onApplyPosition={inspector.applyPositionFromUi}
            onApplySize={inspector.applySizeFromUi}
            onApplyAngle={inspector.applyAngleFromUi}
            onApplyCornerRadius={inspector.applyCornerRadiusFromUi}
            onFlipHorizontal={inspector.toggleFlipHorizontal}
            onFlipVertical={inspector.toggleFlipVertical}
            onToggleLockAspect={inspector.toggleLockAspectRatio}
            onApplyLayoutMode={inspector.applyLayoutModeFromUi}
            onApplyLayoutDirection={inspector.applyLayoutDirectionFromUi}
            onApplyLayoutGap={inspector.applyLayoutGapFromUi}
            onApplyLayoutPadding={inspector.applyLayoutPaddingFromUi}
            onApplyLayoutAlign={inspector.applyLayoutAlignFromUi}
            onApplyLayoutJustify={inspector.applyLayoutJustifyFromUi}
            onApplyLayoutColumns={inspector.applyLayoutColumnsFromUi}
            onApplyLayoutClipContent={inspector.applyLayoutClipContentFromUi}
            onAddFill={inspector.addFillLayer}
            onRemoveFill={inspector.removeFillLayer}
            onToggleFillVisible={inspector.toggleFillVisible}
            onApplyFillColor={inspector.applyFillColor}
            onApplyFillHex={inspector.applyFillHex}
            onApplyFillOpacity={inspector.applyFillOpacity}
            onAddStroke={inspector.addStrokeLayer}
            onRemoveStroke={inspector.removeStrokeLayer}
            onToggleStrokeVisible={inspector.toggleStrokeVisible}
            onApplyStrokeColor={inspector.applyStrokeColor}
            onApplyStrokeHex={inspector.applyStrokeHex}
            onApplyStrokeOpacity={inspector.applyStrokeOpacity}
            onApplyStrokeWidth={inspector.applyStrokeWidthFromUi}
            onApplyStrokeAlign={inspector.applyStrokeAlignFromUi}
          />
        }
        assistantSlot={
          <TpFabricDesignEditorAiPanel
            agentDisplayName={agentDisplayName.value}
            hasSelectionContext={hasSelectionContext.value}
            messages={chatListMessages.value}
            streaming={aiStreaming.value}
            executingPlan={executingPlan.value}
            busy={aiBusy.value}
            ready={aiAssistantReady.value}
            activePlan={activePlan.value}
            planAwaitingStart={planAwaitingStart.value}
            onClose={closeAiPanel}
            onClear={clearChat}
            onStop={stopStream}
            onStartPlan={startPlanExecution}
            onSubmit={onComposerSubmit}
          />
        }
      >
        <CwFileDropTarget
          disabled={readonly}
          texts={{ hint: '松开以导入文件' }}
          className="min-h-0 min-w-0 flex-1"
          onFilesDrop={(files) => onCanvasFilesDrop(files)}
        >
          <div
            ref={(el) => {
              canvasWrapRef.value = el ?? undefined
            }}
            className={[
              'relative h-full min-h-0 w-full min-w-0 flex-1',
              readonly ? 'pointer-events-none opacity-90' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div
              ref={(el) => {
                canvasHostRef.value = el ?? undefined
              }}
              className={canvasHostClass}
            />
            {showToolbar && !readonly && (
              <TpFabricViewportToolbar
                viewportTool={viewportTool.value}
                zoomPercent={viewportZoomPercent.value}
                showRulers={showRulers.value}
                disabled={!enableZoom}
                onViewportToolChange={setViewportTool}
                onShowRulersChange={setShowRulers}
                onZoomSet={(percent) => stage.setZoomPercent(percent)}
                onZoomReset={() => stage.resetViewport()}
                onZoomFit={() => stage.zoomToFitContent()}
              />
            )}
            {aiAssistantEnabled.value && (
              <button
                type="button"
                className={[
                  'absolute bottom-4 right-4 z-[var(--z-index-sticky)] inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-color-container)] text-[var(--brand-color-6)] transition-[background-color,color] hover:bg-[var(--button-brand-tint-active-bg)]',
                  showAssistantPanel.value
                    ? 'bg-[var(--button-brand-tint-active-bg)]'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                title={agentDisplayName.value}
                aria-label="打开 AI 助手"
                onClick={toggleAiPanel}
              >
                <CwIcon name="common--nav--ai-line" prefix="icon" size={1.25} />
              </button>
            )}
          </div>
        </CwFileDropTarget>
      </CwDesignEditorShell>

      <input
        ref={(el) => {
          fileInputRef.value = el ?? undefined
        }}
        type="file"
        accept=".svg,.png,.jpg,.jpeg,image/svg+xml,image/png,image/jpeg"
        multiple
        className="hidden"
        onChange={(e) => onFileChange(e.nativeEvent)}
      />
    </div>
  )
})

export default TpFabricDesignEditor
