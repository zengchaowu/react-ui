import { useReactiveRef, type ReactiveRef } from './reactivity'
import {
  ActiveSelection,
  loadSVGFromString,
  Point,
  type Canvas,
  type FabricObject,
} from 'fabric'
import {
  exportArtboardSvg,
  resolveArtboardSize,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/document/fabricArtboard'
import { tokenSolidColors } from '@zengchaowu/ui-shared/assets/tokens/tokenSolidColors'
import { resolveFabricCanvasBackgroundColor } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/document/fabricEditorBackground.pure'
import type { FabricEditorDocumentContext } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/document/fabricEditorDocument.types'
import {
  layerExportBasenameForSvg,
  sanitizeSvgFilenameBase,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/layers/fabricDesignEditorLayerTree.pure'
import {
  sanitizeSvgMarkupBeforeEditorImport,
  wrapFabricObjectSvgAsDocument,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/document/fabricDesignEditorPure'
import {
  hydrateFabricDesignDocument,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/document/fabricDesignDocument.pure'
import { buildFabricDesignSelectionContext } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/document/fabricDesignDocumentSerialize.pure'
import type { FabricDesignDocumentV1 } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/document/fabricDesignDocument.types'
import {
  materializeSvgImportRoots,
  triggerSvgFileDownload,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/import/fabricEditorSvgImport.pure'
import {
  createFabricImageFromFile,
  placeImportedFabricRoots,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/import/fabricEditorImageImport.pure'
import {
  ensureFabricLayerNamesInTree,
  importLayerBaseNameFromFileName,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/layers/fabricLayerNaming.pure'
import { syncGroupsInteractionFromCanvasSelection } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/layers/fabricGroupPointerPolicy.pure'
import type { TpFabricDesignEditorTool } from '../types'

export function useFabricEditorDocumentSvg(options: {
  canvasRef: ReactiveRef<Canvas | undefined>
  ctx: FabricEditorDocumentContext
  setTool: (tool: TpFabricDesignEditorTool) => void
}) {
  const { canvasRef, ctx, setTool } = options
  const appendStaggerIndex = useReactiveRef(0)

  function commitImportedRoots(
    canvas: Canvas,
    roots: FabricObject[],
    opts: {
      replace: boolean
      placeAt?: { x: number; y: number }
      rootBaseName?: string
    },
  ) {
    if (opts.replace) {
      canvas.clear()
      canvas.backgroundColor = resolveFabricCanvasBackgroundColor(
        ctx.getBackgroundColor(),
        tokenSolidColors.white,
      )
      appendStaggerIndex.value = 0
    } else {
      placeImportedFabricRoots(roots, {
        placeAt: opts.placeAt,
        appendStaggerIndex: opts.placeAt ? undefined : appendStaggerIndex.value++,
      })
    }

    for (const root of roots) {
      canvas.add(root)
    }
    ensureFabricLayerNamesInTree(canvas, roots, {
      rootBaseName: opts.rootBaseName,
    })

    if (roots.length === 1) {
      canvas.setActiveObject(roots[0]!)
    } else if (roots.length > 1) {
      canvas.setActiveObject(new ActiveSelection(roots, { canvas }))
    } else {
      canvas.discardActiveObject()
    }
    setTool('select')
    canvas.requestRenderAll()
    syncGroupsInteractionFromCanvasSelection(canvas)
    ctx.syncStageDimensions?.()
    ctx.refreshLayers()
    ctx.bumpFabricMenuRev()
  }

  async function loadSvgString(
    raw: string,
    loadOpts?: {
      replace?: boolean
      sourceFileName?: string
      placeAt?: { x: number; y: number }
    },
  ): Promise<void> {
    const canvas = canvasRef.value
    if (!canvas) return

    const replace = loadOpts?.replace ?? false
    const placeAt = loadOpts?.placeAt
    const rootBaseName = loadOpts?.sourceFileName
      ? importLayerBaseNameFromFileName(loadOpts.sourceFileName, 'SVG')
      : undefined
    try {
      const { objects, options: svgOpts } = await loadSVGFromString(
        sanitizeSvgMarkupBeforeEditorImport(raw),
      )
      const items = objects.filter((o): o is FabricObject => o != null)
      if (!items.length) {
        // 替换模式下空文档也要清空画布，否则页面切换会残留上一页内容
        if (replace) {
          canvas.clear()
          canvas.backgroundColor = resolveFabricCanvasBackgroundColor(
            ctx.getBackgroundColor(),
            tokenSolidColors.white,
          )
          appendStaggerIndex.value = 0
          canvas.discardActiveObject()
          canvas.requestRenderAll()
          syncGroupsInteractionFromCanvasSelection(canvas)
          ctx.syncStageDimensions?.()
          ctx.refreshLayers()
          ctx.bumpFabricMenuRev()
        }
        return
      }

      const groupElements = ctx.getSvgImportGroupElements() !== false
      const roots = materializeSvgImportRoots(
        items,
        svgOpts as Record<string, unknown>,
        groupElements,
      )

      commitImportedRoots(canvas, roots, { replace, placeAt, rootBaseName })
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      ctx.emit('error', err)
      throw err
    }
  }

  /** 导入 PNG/JPG 等栅格图为图片图层。 */
  async function loadImageFile(
    file: File,
    loadOpts?: {
      replace?: boolean
      placeAt?: { x: number; y: number }
    },
  ): Promise<void> {
    const canvas = canvasRef.value
    if (!canvas) return

    const replace = loadOpts?.replace ?? false
    const placeAt = loadOpts?.placeAt
    const rootBaseName = importLayerBaseNameFromFileName(file.name, '图片')
    try {
      const image = await createFabricImageFromFile(file)
      commitImportedRoots(canvas, [image], {
        replace,
        placeAt,
        rootBaseName,
      })
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      ctx.emit('error', err)
      throw err
    }
  }

  function getSvgString(): string {
    const canvas = canvasRef.value
    if (!canvas) return ''
    const artboard = resolveArtboardSize(ctx.getFixedCanvasSize())
    if (artboard) return exportArtboardSvg(canvas, artboard)
    return canvas.toSVG()
  }

  /** 页面文档往返：始终用完整画布 SVG，避免 artboard/图标导出丢结构导致无法还原。 */
  function getCanvasDocumentSvg(): string {
    const canvas = canvasRef.value
    if (!canvas) return ''
    return canvas.toSVG()
  }

  function getSelectionSvgString(): string {
    const canvas = canvasRef.value
    const obj = canvas?.getActiveObject() as FabricObject | undefined
    if (!obj || typeof obj.toSVG !== 'function') return ''
    return wrapFabricObjectSvgAsDocument(obj)
  }

  /** 选区同构上下文 JSON（Design Document 形状：version + mode + roots），不是 SVG。 */
  function getSelectionContextJson(): string {
    const canvas = canvasRef.value
    if (!canvas) {
      return JSON.stringify({ version: 1, mode: 'empty', roots: [] })
    }
    const objs = canvas.getActiveObjects()
    return JSON.stringify(buildFabricDesignSelectionContext(objs))
  }

  function placeRootsAtCenter(
    canvas: Canvas,
    roots: FabricObject[],
    center: Point,
  ) {
    if (roots.length === 1) {
      const root = roots[0]!
      root.setPositionByOrigin(center, 'center', 'center')
      root.setCoords()
      canvas.add(root)
      ensureFabricLayerNamesInTree(canvas, [root], { rootBaseName: '设计稿' })
      canvas.setActiveObject(root)
      return
    }
    for (const root of roots) {
      canvas.add(root)
    }
    ensureFabricLayerNamesInTree(canvas, roots, { rootBaseName: '设计稿' })
    const selection = new ActiveSelection(roots, { canvas })
    selection.setPositionByOrigin(center, 'center', 'center')
    selection.setCoords()
    canvas.setActiveObject(selection)
  }

  function replaceSelectionWithDesignDocument(doc: FabricDesignDocumentV1): void {
    const canvas = canvasRef.value
    if (!canvas || ctx.getReadonly()) return
    const activeObj = canvas.getActiveObject()
    if (!activeObj) {
      const err = new Error('请先选中要替换的图层')
      ctx.emit('error', err)
      throw err
    }
    const center = activeObj.getCenterPoint()
    const roots = hydrateFabricDesignDocument(doc, {
      origin: { left: center.x, top: center.y },
    })
    if (!roots.length) return
    const objs = canvas.getActiveObjects().slice()
    canvas.discardActiveObject()
    canvas.remove(...objs)
    placeRootsAtCenter(canvas, roots, center)
    setTool('select')
    canvas.requestRenderAll()
    syncGroupsInteractionFromCanvasSelection(canvas)
    ctx.syncStageDimensions?.()
    ctx.refreshLayers()
    ctx.bumpFabricMenuRev()
  }

  function exportSvgToFile() {
    const svg = getSvgString()
    ctx.emit('export-svg', svg)
    triggerSvgFileDownload(svg, sanitizeSvgFilenameBase('画布', '画布'))
  }

  function exportSelectedSvgToFile() {
    const canvas = canvasRef.value
    const active = canvas?.getActiveObject() as FabricObject | undefined
    const svg = getSelectionSvgString()
    if (!svg.trim() || !active) {
      ctx.emit(
        'error',
        new Error('请先选中要导出的图形（可多选后先「分组」再导出）'),
      )
      return
    }
    ctx.emit('export-svg-selection', svg)
    triggerSvgFileDownload(
      svg,
      sanitizeSvgFilenameBase(layerExportBasenameForSvg(active), '选中图层'),
    )
  }

  function applyDesignDocument(
    doc: FabricDesignDocumentV1,
    loadOpts?: { replace?: boolean; placeAt?: { x: number; y: number } },
  ): void {
    const canvas = canvasRef.value
    if (!canvas || ctx.getReadonly()) return
    const replace = loadOpts?.replace === true
    const roots = hydrateFabricDesignDocument(doc, {
      origin: loadOpts?.placeAt
        ? { left: loadOpts.placeAt.x, top: loadOpts.placeAt.y }
        : undefined,
    })
    if (!roots.length) return
    commitImportedRoots(canvas, roots, {
      replace,
      placeAt: loadOpts?.placeAt,
      rootBaseName: '设计稿',
    })
  }

  return {
    appendStaggerIndex,
    loadSvgString,
    loadImageFile,
    getSvgString,
    getCanvasDocumentSvg,
    getSelectionSvgString,
    getSelectionContextJson,
    replaceSelectionWithDesignDocument,
    exportSvgToFile,
    exportSelectedSvgToFile,
    applyDesignDocument,
  }
}
