import type { Canvas } from 'fabric'
import type { TpFabricDesignEditorProps } from '../types'
import type { useFabricStage } from './useFabricStage'
import type { FabricEditorToolMode } from './useFabricEditorToolMode'
import { tokenSolidColors } from '@zengchaowu/ui-shared/assets/tokens/tokenSolidColors'
import { resolveFabricCanvasBackgroundColor } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/document/fabricEditorBackground.pure'
import { nextTick, useWatch, type ReactiveRef } from './reactivity'

type Stage = ReturnType<typeof useFabricStage>

type PropsSyncDoc = {
  loadSvgString: (
    text: string,
    opts: {
      replace: boolean
      sourceFileName?: string
      placeAt?: { x: number; y: number }
    },
  ) => Promise<void>
}

export function useFabricEditorPropsSync(options: {
  props: TpFabricDesignEditorProps
  canvasRef: ReactiveRef<Canvas | undefined>
  stage: Stage
  toolMode: FabricEditorToolMode
  doc: PropsSyncDoc
  bumpFabricMenuRev: () => void
  refreshLayers: () => void
  clearLayerState: () => void
}) {
  useWatch(
    () => options.props.showLayersPanel,
    (show) => {
      if (show) nextTick(() => options.refreshLayers())
      else options.clearLayerState()
      nextTick(() => {
        options.stage.syncStageDimensions()
        requestAnimationFrame(() => options.stage.syncStageDimensions())
      })
    },
  )

  useWatch(
    () =>
      `${options.props.width}|${options.props.height}|${JSON.stringify(options.props.fixedCanvasSize ?? null)}`,
    () => {
      nextTick(() => options.stage.syncStageDimensions())
    },
  )

  useWatch(
    () => options.props.backgroundColor,
    (c) => {
      const canvas = options.canvasRef.value
      if (!canvas) return
      canvas.backgroundColor = resolveFabricCanvasBackgroundColor(
        c,
        tokenSolidColors.white,
      )
      canvas.requestRenderAll()
    },
  )

  useWatch(
    () => options.props.initialSvg,
    (svg) => {
      if (!options.canvasRef.value || svg == null || !svg.trim()) return
      options.doc.loadSvgString(svg, { replace: true }).catch(() => {})
    },
  )

  useWatch(
    () => options.props.readonly,
    () => {
      options.toolMode.applyCanvasToolMode()
    },
  )

  // Vue 侧为 deep watch：React 以 JSON 快照近似（stream 函数不参与比较）
  useWatch(
    () => JSON.stringify(options.props.designAi ?? null),
    () => {
      options.bumpFabricMenuRev()
    },
  )

  useWatch(
    () => options.props.enableZoom,
    () => {
      options.stage.setupZoom()
    },
  )
}
