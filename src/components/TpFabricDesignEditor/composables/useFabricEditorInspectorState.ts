import { nextTick, type ReactiveRef } from './reactivity'
import type { Canvas } from 'fabric'
import type { FabricDesignEditorEmitFn, TpFabricDesignEditorProps } from '../types'
import { useFabricInspectorSections } from './useFabricInspectorSections'
import { useFabricDesignEditorAppearance } from './useFabricDesignEditorAppearance'
import { useFabricDesignEditorLayout } from './useFabricDesignEditorLayout'
import { useFabricDesignEditorTransform } from './useFabricDesignEditorTransform'

export function useFabricEditorInspectorState(options: {
  canvasRef: ReactiveRef<Canvas | undefined>
  props: TpFabricDesignEditorProps
  emit: FabricDesignEditorEmitFn
  hasIconMetaSlot: () => boolean
  getIsDrawTool?: () => boolean
  getBrushStyle?: () => { color: string; width: number }
  setBrushStyle?: (style: Partial<{ color: string; width: number }>) => void
}) {
  const {
    appearanceSelectionActive,
    fillLayers,
    strokeLayers,
    appearanceStrokeWidth,
    strokeAlign,
    syncAppearanceFromSelection,
    addFillLayer,
    removeFillLayer,
    toggleFillVisible,
    applyFillColor,
    applyFillHex,
    applyFillOpacity,
    addStrokeLayer,
    removeStrokeLayer,
    toggleStrokeVisible,
    applyStrokeColor,
    applyStrokeHex,
    applyStrokeOpacity,
    applyStrokeWidthFromUi,
    applyStrokeAlignFromUi,
  } = useFabricDesignEditorAppearance({
    canvasRef: options.canvasRef,
    getProps: () => ({ readonly: options.props.readonly }),
    emit: options.emit,
    getIsDrawTool: options.getIsDrawTool,
    getBrushStyle: options.getBrushStyle,
    setBrushStyle: options.setBrushStyle,
  })

  const {
    transformSelectionActive,
    transformX,
    transformY,
    transformW,
    transformH,
    transformAngle,
    transformFlipX,
    transformFlipY,
    transformCornerRadius,
    lockAspectRatio,
    transformMultiSelection,
    syncTransformFromSelection,
    applyAngleFromUi,
    toggleFlipHorizontal,
    toggleFlipVertical,
    applyPositionFromUi,
    applySizeFromUi,
    applyCornerRadiusFromUi,
    alignSelection,
    toggleLockAspectRatio,
  } = useFabricDesignEditorTransform({
    canvasRef: options.canvasRef,
    getProps: () => ({
      readonly: options.props.readonly,
      fixedCanvasSize: options.props.fixedCanvasSize,
    }),
    emit: options.emit,
  })

  const {
    layoutSelectionActive,
    layoutMode,
    layoutDirection,
    layoutGap,
    layoutPadding,
    layoutAlign,
    layoutJustify,
    layoutColumns,
    layoutClipContent,
    syncLayoutFromSelection,
    applyLayoutModeFromUi,
    applyLayoutDirectionFromUi,
    applyLayoutGapFromUi,
    applyLayoutPaddingFromUi,
    applyLayoutAlignFromUi,
    applyLayoutJustifyFromUi,
    applyLayoutColumnsFromUi,
    applyLayoutClipContentFromUi,
  } = useFabricDesignEditorLayout({
    canvasRef: options.canvasRef,
    getProps: () => ({ readonly: options.props.readonly }),
    emit: options.emit,
  })

  const { inspectorSections } = useFabricInspectorSections({
    hasIconMetaSlot: options.hasIconMetaSlot,
    transformSelectionActive,
    layoutSelectionActive,
    appearanceSelectionActive,
  })

  function syncInspectorFromSelection() {
    nextTick(() => {
      syncTransformFromSelection()
      syncLayoutFromSelection()
      syncAppearanceFromSelection()
    })
  }

  return {
    inspectorSections,
    fillLayers,
    strokeLayers,
    appearanceStrokeWidth,
    strokeAlign,
    transformX,
    transformY,
    transformW,
    transformH,
    transformAngle,
    transformFlipX,
    transformFlipY,
    transformCornerRadius,
    lockAspectRatio,
    transformMultiSelection,
    transformSelectionActive,
    layoutSelectionActive,
    layoutMode,
    layoutDirection,
    layoutGap,
    layoutPadding,
    layoutAlign,
    layoutJustify,
    layoutColumns,
    layoutClipContent,
    appearanceSelectionActive,
    syncAppearanceFromSelection,
    syncTransformFromSelection,
    syncLayoutFromSelection,
    syncInspectorFromSelection,
    addFillLayer,
    removeFillLayer,
    toggleFillVisible,
    applyFillColor,
    applyFillHex,
    applyFillOpacity,
    addStrokeLayer,
    removeStrokeLayer,
    toggleStrokeVisible,
    applyStrokeColor,
    applyStrokeHex,
    applyStrokeOpacity,
    applyStrokeWidthFromUi,
    applyStrokeAlignFromUi,
    alignSelection,
    applyPositionFromUi,
    applySizeFromUi,
    applyAngleFromUi,
    applyCornerRadiusFromUi,
    toggleFlipHorizontal,
    toggleFlipVertical,
    toggleLockAspectRatio,
    applyLayoutModeFromUi,
    applyLayoutDirectionFromUi,
    applyLayoutGapFromUi,
    applyLayoutPaddingFromUi,
    applyLayoutAlignFromUi,
    applyLayoutJustifyFromUi,
    applyLayoutColumnsFromUi,
    applyLayoutClipContentFromUi,
  }
}

export type FabricEditorInspectorState = ReturnType<
  typeof useFabricEditorInspectorState
>
