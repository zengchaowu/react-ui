import type { ReactiveRef } from './reactivity'
import type { Canvas } from 'fabric'
import {
  applyPaintLayersToObject,
  defaultFillLayer,
  defaultStrokeLayer,
  forEachAppearanceLeaf,
  type FabricFillPaintLayer,
  type FabricStrokeAlign,
  type FabricStrokePaintLayer,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/appearance/fabricEditorPaintLayers.pure'
import {
  parseFabricEditorHexInput,
  parseFabricEditorOpacityPercentInput,
  parseFabricEditorStrokeAlignInput,
  parseFabricEditorStrokeWidthInput,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/appearance/fabricEditorAppearanceInput.pure'

type AppearanceEmit = {
  (e: 'object-modified', obj: import('fabric').FabricObject): void
}

export function useFabricAppearanceLayerActions(options: {
  canvasRef: ReactiveRef<Canvas | undefined>
  getReadonly: () => boolean
  emit: AppearanceEmit
  fillLayers: ReactiveRef<FabricFillPaintLayer[]>
  strokeLayers: ReactiveRef<FabricStrokePaintLayer[]>
  appearanceStrokeWidth: ReactiveRef<number>
  strokeAlign: ReactiveRef<FabricStrokeAlign>
  syncAppearanceFromSelection: () => void
  getIsDrawTool?: () => boolean
  setBrushStyle?: (style: {
    color?: string
    width?: number
  }) => void
}) {
  async function commitAppearance() {
    const canvas = options.canvasRef.value
    if (!canvas || options.getReadonly()) return
    const objs = canvas.getActiveObjects()

    // 画笔工具且无选中：把描边写回笔刷，不改画布对象
    if (!objs.length && options.getIsDrawTool?.()) {
      const topStroke = options.strokeLayers.value.find((l) => l.visible)
      options.setBrushStyle?.({
        color: topStroke?.hex,
        width: options.appearanceStrokeWidth.value,
      })
      return
    }

    if (!objs.length) return

    const fills = options.fillLayers.value.map((l) => ({ ...l }))
    const strokes = options.strokeLayers.value.map((l) => ({ ...l }))
    const width = options.appearanceStrokeWidth.value
    const align = options.strokeAlign.value

    for (const root of objs) {
      const leaves: import('fabric').FabricObject[] = []
      forEachAppearanceLeaf(root, (leaf) => leaves.push(leaf))
      for (const leaf of leaves) {
        await applyPaintLayersToObject(
          canvas,
          leaf,
          fills,
          strokes,
          width,
          align,
        )
        options.emit('object-modified', leaf)
      }
    }

    canvas.requestRenderAll()
    options.syncAppearanceFromSelection()
  }

  function addFillLayer() {
    options.fillLayers.value = [
      ...options.fillLayers.value,
      defaultFillLayer(),
    ]
    void commitAppearance()
  }

  function removeFillLayer(index: number) {
    options.fillLayers.value = options.fillLayers.value.filter(
      (_, i) => i !== index,
    )
    void commitAppearance()
  }

  function toggleFillVisible(index: number) {
    const layer = options.fillLayers.value[index]
    if (!layer) return
    layer.visible = !layer.visible
    void commitAppearance()
  }

  function applyFillColor(index: number, ev: Event) {
    const layer = options.fillLayers.value[index]
    if (!layer || layer.unsupported) return
    const input = ev.target
    if (!(input instanceof HTMLInputElement)) return
    layer.hex = input.value
    void commitAppearance()
  }

  function applyFillHex(index: number, raw: string) {
    const layer = options.fillLayers.value[index]
    if (!layer || layer.unsupported) return
    const hex = parseFabricEditorHexInput(raw)
    if (!hex) return
    layer.hex = hex
    void commitAppearance()
  }

  function applyFillOpacity(index: number, raw: number | string) {
    const layer = options.fillLayers.value[index]
    if (!layer || layer.unsupported) return
    const opacity = parseFabricEditorOpacityPercentInput(raw)
    if (opacity == null) return
    layer.opacity = opacity
    void commitAppearance()
  }

  function addStrokeLayer() {
    options.strokeLayers.value = [
      ...options.strokeLayers.value,
      defaultStrokeLayer(),
    ]
    void commitAppearance()
  }

  function removeStrokeLayer(index: number) {
    options.strokeLayers.value = options.strokeLayers.value.filter(
      (_, i) => i !== index,
    )
    void commitAppearance()
  }

  function toggleStrokeVisible(index: number) {
    const layer = options.strokeLayers.value[index]
    if (!layer) return
    layer.visible = !layer.visible
    void commitAppearance()
  }

  function applyStrokeColor(index: number, ev: Event) {
    const layer = options.strokeLayers.value[index]
    if (!layer || layer.unsupported) return
    const input = ev.target
    if (!(input instanceof HTMLInputElement)) return
    layer.hex = input.value
    void commitAppearance()
  }

  function applyStrokeHex(index: number, raw: string) {
    const layer = options.strokeLayers.value[index]
    if (!layer || layer.unsupported) return
    const hex = parseFabricEditorHexInput(raw)
    if (!hex) return
    layer.hex = hex
    void commitAppearance()
  }

  function applyStrokeOpacity(index: number, raw: number | string) {
    const layer = options.strokeLayers.value[index]
    if (!layer || layer.unsupported) return
    const opacity = parseFabricEditorOpacityPercentInput(raw)
    if (opacity == null) return
    layer.opacity = opacity
    void commitAppearance()
  }

  function applyStrokeWidthFromUi(raw?: number | string) {
    options.appearanceStrokeWidth.value = parseFabricEditorStrokeWidthInput(
      raw,
      options.appearanceStrokeWidth.value,
    )
    void commitAppearance()
  }

  function applyStrokeAlignFromUi(value: unknown) {
    const align = parseFabricEditorStrokeAlignInput(value)
    if (!align) return
    options.strokeAlign.value = align
    void commitAppearance()
  }

  return {
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
  }
}
