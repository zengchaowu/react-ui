import { useReactiveRef, type ReactiveRef } from './reactivity'
import type { Canvas } from 'fabric'
import { readFabricAppearanceSelectionSnapshot } from '../appearance/fabricEditorAppearanceSync.pure'
import { useFabricAppearanceLayerActions } from './useFabricAppearanceLayerActions'
import type {
  FabricFillPaintLayer,
  FabricStrokeAlign,
  FabricStrokePaintLayer,
} from '../appearance/fabricEditorPaintLayers.pure'
import { defaultStrokeLayer } from '../appearance/fabricEditorPaintLayers.pure'
import type { FabricBrushStyle } from './useFabricEditorToolMode'
import type { TpFabricDesignEditorProps } from '../types'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'

type EmitFn = {
  (e: 'object-modified', obj: import('fabric').FabricObject): void
}

export function useFabricDesignEditorAppearance(options: {
  canvasRef: ReactiveRef<Canvas | undefined>
  getProps: () => Pick<TpFabricDesignEditorProps, 'readonly'>
  emit: EmitFn
  getIsDrawTool?: () => boolean
  getBrushStyle?: () => FabricBrushStyle
  setBrushStyle?: (style: Partial<FabricBrushStyle>) => void
}) {
  const appearanceSelectionActive = useReactiveRef(false)
  const fillLayers = useReactiveRef<FabricFillPaintLayer[]>([])
  const strokeLayers = useReactiveRef<FabricStrokePaintLayer[]>([])
  const appearanceStrokeWidth = useReactiveRef(1)
  const strokeAlign = useReactiveRef<FabricStrokeAlign>('center')

  function applyBrushDraftToState() {
    const brush = options.getBrushStyle?.() ?? {
      color: tokenSolidColors.grayColor15,
      width: 2,
    }
    appearanceSelectionActive.value = true
    fillLayers.value = []
    const stroke = defaultStrokeLayer()
    stroke.hex = brush.color
    strokeLayers.value = [stroke]
    strokeAlign.value = 'center'
    appearanceStrokeWidth.value = brush.width
  }

  function applySnapshotToState(
    snapshot: ReturnType<typeof readFabricAppearanceSelectionSnapshot>,
  ) {
    appearanceSelectionActive.value = snapshot.active
    fillLayers.value = snapshot.fillLayers
    strokeLayers.value = snapshot.strokeLayers
    strokeAlign.value = snapshot.strokeAlign
    appearanceStrokeWidth.value = snapshot.strokeWidth
  }

  function syncAppearanceFromSelection() {
    if (options.getProps().readonly) {
      appearanceSelectionActive.value = false
      return
    }
    const snapshot = readFabricAppearanceSelectionSnapshot(
      options.canvasRef.value,
    )
    if (!snapshot.active && options.getIsDrawTool?.()) {
      applyBrushDraftToState()
      return
    }
    applySnapshotToState(snapshot)
  }

  const layerActions = useFabricAppearanceLayerActions({
    canvasRef: options.canvasRef,
    getReadonly: () => Boolean(options.getProps().readonly),
    emit: options.emit,
    fillLayers,
    strokeLayers,
    appearanceStrokeWidth,
    strokeAlign,
    syncAppearanceFromSelection,
    getIsDrawTool: options.getIsDrawTool,
    setBrushStyle: options.setBrushStyle,
  })

  return {
    appearanceSelectionActive,
    fillLayers,
    strokeLayers,
    appearanceStrokeWidth,
    strokeAlign,
    syncAppearanceFromSelection,
    ...layerActions,
  }
}
