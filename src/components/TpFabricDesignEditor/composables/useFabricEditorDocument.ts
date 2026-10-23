import { useStableBox, type ReactiveRef } from './reactivity'
import type { Canvas } from 'fabric'
import type { TpFabricDesignEditorProps, TpFabricDesignEditorTool } from '../types'
import type { FabricEditorDocumentContext } from '../document/fabricEditorDocument.types'
import {
  fabricEditorClipboardHasItems,
} from '../document/fabricEditorClipboard'
import {
  imageFilesFromClipboardEvent,
  readSystemClipboardImageFiles,
} from '../import/fabricEditorImageImport.pure'
import { useFabricEditorDocumentSelection } from './useFabricEditorDocumentSelection'
import { useFabricEditorDocumentSvg } from './useFabricEditorDocumentSvg'

type DocumentEmit = FabricEditorDocumentContext['emit']

export function useFabricEditorDocument(options: {
  canvasRef: ReactiveRef<Canvas | undefined>
  getProps: () => Pick<
    TpFabricDesignEditorProps,
    | 'readonly'
    | 'backgroundColor'
    | 'fixedCanvasSize'
    | 'svgImportGroupElements'
  >
  syncStageDimensions?: () => void
  emit: DocumentEmit
  setTool: (tool: TpFabricDesignEditorTool) => void
  bumpFabricMenuRev: () => void
  refreshLayers: () => void
  appearanceSelectionActive: ReactiveRef<boolean>
}) {
  const ctx: FabricEditorDocumentContext = {
    getReadonly: () => options.getProps().readonly ?? false,
    getBackgroundColor: () => options.getProps().backgroundColor,
    getFixedCanvasSize: () => options.getProps().fixedCanvasSize,
    getSvgImportGroupElements: () => options.getProps().svgImportGroupElements,
    syncStageDimensions: options.syncStageDimensions,
    setTool: options.setTool,
    bumpFabricMenuRev: options.bumpFabricMenuRev,
    refreshLayers: options.refreshLayers,
    setAppearanceSelectionActive: (active) => {
      options.appearanceSelectionActive.value = active
    },
    emit: options.emit,
  }

  const selection = useFabricEditorDocumentSelection({
    canvasRef: options.canvasRef,
    ctx,
    setTool: options.setTool,
  })

  const svg = useFabricEditorDocumentSvg({
    canvasRef: options.canvasRef,
    ctx,
    setTool: options.setTool,
  })

  /** 避免 clipboard.read 与 paste 事件各粘贴一次 */
  const pasteState = useStableBox({ lastExternalPasteAt: 0 })

  async function importClipboardImageFiles(files: File[]): Promise<boolean> {
    if (!files.length || ctx.getReadonly()) return false
    for (const file of files) {
      await svg.loadImageFile(file, { replace: false })
    }
    pasteState.value.lastExternalPasteAt = Date.now()
    options.setTool('select')
    return true
  }

  /**
   * 优先粘贴编辑器内复制的图层；若为空则尝试系统剪贴板图片（Clipboard API）。
   */
  async function pasteClipboard(): Promise<void> {
    if (ctx.getReadonly()) return
    if (fabricEditorClipboardHasItems()) {
      await selection.pasteClipboard()
      return
    }
    const files = await readSystemClipboardImageFiles()
    if (files.length) {
      await importClipboardImageFiles(files)
    }
  }

  /**
   * `paste` 事件（右键粘贴 / Safari 等）：从 clipboardData 导入图片。
   */
  async function pasteClipboardEvent(e: ClipboardEvent): Promise<boolean> {
    if (ctx.getReadonly()) return false
    if (fabricEditorClipboardHasItems()) return false
    if (Date.now() - pasteState.value.lastExternalPasteAt < 400) return false
    const files = imageFilesFromClipboardEvent(e)
    if (!files.length) return false
    e.preventDefault()
    await importClipboardImageFiles(files)
    return true
  }

  return {
    ...selection,
    ...svg,
    pasteClipboard,
    pasteClipboardEvent,
    hasEditorClipboardItems: fabricEditorClipboardHasItems,
  }
}
