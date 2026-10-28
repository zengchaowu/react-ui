import { useRef } from 'react'
import { tokenSolidColors } from '@zengchaowu/ui-shared/assets/tokens/tokenSolidColors'
import type { CwPdfDocument, CwPdfRotation } from '@zengchaowu/ui-shared/components/CwPdfEditor/types'
import {
  openPdfDocument,
  paintEditedRunsOnCanvas,
  paintPdfRunEditBackdrop,
  type CwPdfViewport,
} from '@zengchaowu/ui-shared/components/CwPdfEditor/functions/pdfDocument'
import { pageEditSignature, type PdfPageSlot } from '@zengchaowu/ui-shared/components/CwPdfEditor/functions/pdfPageLayout'

type PdfJsDoc = Awaited<ReturnType<typeof openPdfDocument>>

/** Vue nextTick 的等价：等本轮 state 落地、DOM 画完再执行。 */
function afterRender() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0)
  })
}

export interface UsePdfEditorCanvasPaintOptions {
  getPdf: () => CwPdfDocument
  getLayouts: () => PdfPageSlot[]
  getPageWidth: () => number
  getPageViews: () => Record<string, CwPdfViewport>
  setPageViews: (views: Record<string, CwPdfViewport>) => void
  getAspects: () => Record<string, number>
  setAspects: (aspects: Record<string, number>) => void
  stageViewport: () => ParentNode | null | undefined
}

export function usePdfEditorCanvasPaint(options: UsePdfEditorCanvasPaintOptions) {
  // 函数体每次渲染都重建（和 Vue 闭包读 ref 一样总能拿到最新值），只有可变的绘制现场留在 ref 里。
  const optionsRef = useRef(options)
  optionsRef.current = options
  const storeRef = useRef<{
    pdfDoc: PdfJsDoc | null
    paintToken: number
    paintEpoch: number
    renderTasks: Map<number, { cancel: () => void }>
  } | null>(null)
  if (!storeRef.current) {
    storeRef.current = { pdfDoc: null, paintToken: 0, paintEpoch: 0, renderTasks: new Map() }
  }
  const store = storeRef.current

  function getPdfDoc() {
    return store.pdfDoc
  }

  function setPdfDoc(doc: PdfJsDoc | null) {
    store.pdfDoc = doc
  }

  function bumpPaintEpoch() {
    store.paintEpoch += 1
  }

  function cancelPaint() {
    store.paintToken += 1
    for (const task of store.renderTasks.values()) task.cancel()
    store.renderTasks.clear()
  }

  function invalidatePageCanvas(pageIndex: number) {
    if (pageIndex < 0) return
    const canvas = optionsRef.current
      .stageViewport()
      ?.querySelector<HTMLCanvasElement>(`canvas[data-pdf-page="${pageIndex}"]`)
    if (canvas) delete canvas.dataset.pdfPaint
  }

  function repaintPage(pageIndex: number) {
    invalidatePageCanvas(pageIndex)
    void paintVisible()
  }

  /** 只重绘指定页（用于切换编辑 run 时擦掉上一段的白底遮罩）。 */
  async function repaintPages(pageIndices: number[], after?: () => void) {
    const indices = [...new Set(pageIndices)].filter((index) => index >= 0)
    if (!indices.length) {
      after?.()
      return
    }
    const token = ++store.paintToken
    await afterRender()
    const stage = optionsRef.current.stageViewport()
    if (!stage || token !== store.paintToken) return
    for (const index of indices) {
      if (token !== store.paintToken) return
      const canvas = stage.querySelector<HTMLCanvasElement>(`canvas[data-pdf-page="${index}"]`)
      if (canvas) await paintCanvas(index, canvas, token)
    }
    if (token === store.paintToken) after?.()
  }

  async function paintVisible() {
    const token = ++store.paintToken
    await afterRender()
    const stage = optionsRef.current.stageViewport()
    if (!stage || token !== store.paintToken) return
    const canvases = stage.querySelectorAll<HTMLCanvasElement>('canvas[data-pdf-page]')
    for (const canvas of canvases) {
      if (token !== store.paintToken) return
      const index = Number(canvas.dataset.pdfPage)
      await paintCanvas(index, canvas, token)
    }
  }

  async function paintCanvas(index: number, canvas: HTMLCanvasElement, token: number) {
    const page = optionsRef.current.getPdf().pages[index]
    const slot = optionsRef.current.getLayouts()[index]
    if (!page || !slot || slot.height < 2) return
    const pageWidth = optionsRef.current.getPageWidth()
    const dpr = window.devicePixelRatio || 1
    const signature = `${store.paintEpoch}:${page.sourceIndex}:${page.rotation}:${Math.round(pageWidth)}:${Math.round(slot.height)}:${dpr}:${pageEditSignature(page)}`
    if (canvas.dataset.pdfPaint === signature) return
    const previous = store.renderTasks.get(index)
    previous?.cancel()
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (page.sourceIndex < 0 || !store.pdfDoc) {
      canvas.width = Math.ceil(pageWidth * dpr)
      canvas.height = Math.ceil(slot.height * dpr)
      ctx.fillStyle = tokenSolidColors.white
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      if (token === store.paintToken) canvas.dataset.pdfPaint = signature
      return
    }
    const pdfPage = await store.pdfDoc.getPage(page.sourceIndex + 1)
    if (token !== store.paintToken) return
    const rotation = (((pdfPage.rotate || 0) + page.rotation) % 360) as CwPdfRotation
    const base = pdfPage.getViewport({ scale: 1, rotation })
    const key = `${page.sourceIndex}:${page.rotation}`
    const ratio = Math.round((base.width / base.height) * 1000) / 1000
    if (optionsRef.current.getAspects()[key] !== ratio) {
      optionsRef.current.setAspects({ ...optionsRef.current.getAspects(), [key]: ratio })
    }
    const viewport = pdfPage.getViewport({ scale: (pageWidth * dpr) / base.width, rotation })
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    ctx.fillStyle = tokenSolidColors.white
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const task = pdfPage.render({ canvasContext: ctx, viewport })
    store.renderTasks.set(index, task)
    let painted = false
    try {
      await task.promise
      if (token === store.paintToken) {
        const layoutViewport = optionsRef.current.getPageViews()[key]
        if (layoutViewport && page.runs?.length) {
          paintEditedRunsOnCanvas(ctx, page.runs, layoutViewport, slot.height, pageWidth, viewport.width)
        }
      }
      painted = token === store.paintToken
    } catch {
      // 翻页或缩放会取消上一次绘制
    } finally {
      if (store.renderTasks.get(index) === task) store.renderTasks.delete(index)
    }
    if (painted) canvas.dataset.pdfPaint = signature
  }

  async function capturePageViews() {
    const doc = store.pdfDoc
    if (!doc) return
    const next: Record<string, CwPdfViewport> = {}
    for (const page of optionsRef.current.getPdf().pages) {
      if (page.sourceIndex < 0) continue
      const key = `${page.sourceIndex}:${page.rotation}`
      if (next[key]) continue
      const pdfPage = await doc.getPage(page.sourceIndex + 1)
      const rotation = (((pdfPage.rotate || 0) + page.rotation) % 360) as CwPdfRotation
      const viewport = pdfPage.getViewport({ scale: 1, rotation })
      next[key] = { width: viewport.width, height: viewport.height, transform: [...viewport.transform] }
    }
    optionsRef.current.setPageViews(next)
  }

  async function destroyPdfDoc() {
    await store.pdfDoc?.destroy()
    store.pdfDoc = null
  }

  function paintEditBackdrop(pageIndex: number, runId: string) {
    const options = optionsRef.current
    const page = options.getPdf().pages[pageIndex]
    const slot = options.getLayouts()[pageIndex]
    if (!page || !slot || page.sourceIndex < 0) return
    const canvas = options
      .stageViewport()
      ?.querySelector<HTMLCanvasElement>(`canvas[data-pdf-page="${pageIndex}"]`)
    if (!canvas || !canvas.dataset.pdfPaint) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const run = page.runs?.find((item) => item.id === runId)
    const layoutViewport = options.getPageViews()[`${page.sourceIndex}:${page.rotation}`]
    if (!run || !layoutViewport) return
    paintPdfRunEditBackdrop(ctx, run, layoutViewport, slot.height, options.getPageWidth(), canvas.width)
  }

  return {
    getPdfDoc,
    setPdfDoc,
    bumpPaintEpoch,
    cancelPaint,
    invalidatePageCanvas,
    repaintPage,
    repaintPages,
    paintVisible,
    paintEditBackdrop,
    capturePageViews,
    destroyPdfDoc,
  }
}
