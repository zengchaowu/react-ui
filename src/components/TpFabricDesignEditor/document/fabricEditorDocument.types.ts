import type { TpFabricDesignEditorProps, TpFabricDesignEditorTool } from '../types'

export type FabricEditorDocumentEmitFn = {
  (e: 'error', err: Error): void
  (e: 'export-svg', svg: string): void
  (e: 'export-svg-selection', svg: string): void
}

export type FabricEditorDocumentContext = {
  getReadonly: () => boolean
  getBackgroundColor: () => string | undefined
  getFixedCanvasSize: () => TpFabricDesignEditorProps['fixedCanvasSize']
  getSvgImportGroupElements: () => boolean | undefined
  syncStageDimensions?: () => void
  setTool: (tool: TpFabricDesignEditorTool) => void
  bumpFabricMenuRev: () => void
  refreshLayers: () => void
  setAppearanceSelectionActive: (active: boolean) => void
  emit: FabricEditorDocumentEmitFn
}
