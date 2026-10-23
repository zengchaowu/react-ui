import type { Canvas } from 'fabric'
import { renderPenToolOverlay } from './renderPenOverlay.pure'
import type { PenSession, PenToolMutableState } from './penToolSessionTypes'

export function createPenToolOverlay(
  canvas: Canvas,
  getState: () => PenToolMutableState,
) {
  let afterRenderHandler: (() => void) | null = null

  function bind() {
    if (afterRenderHandler) return
    afterRenderHandler = () => {
      const { session, previewNodes, drag } = getState()
      if (!session) return
      const ctx = canvas.contextTop
      if (!ctx) return
      // 必须按设备像素清空，否则拖动/重绘会在上层 canvas 留下控制点残影
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.restore()

      const vpt = canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0]
      if (session.mode === 'draw') {
        renderPenToolOverlay({
          ctx,
          vpt,
          nodes: session.nodes,
          closed: false,
          previewNodes,
        })
        return
      }
      renderPenToolOverlay({
        ctx,
        vpt,
        nodes: session.nodes,
        closed: session.closed,
        selectedNodeIndices: session.selectedNodeIndices,
        marquee:
          drag?.kind === 'marquee'
            ? { start: drag.startPoint, current: drag.currentPoint }
            : null,
        drawPathStroke: false,
      })
    }
    canvas.on('after:render', afterRenderHandler)
  }

  function unbind() {
    if (!afterRenderHandler) return
    canvas.off('after:render', afterRenderHandler)
    afterRenderHandler = null
    canvas.clearContext(canvas.contextTop)
  }

  function requestRender() {
    canvas.requestRenderAll()
  }

  return { bind, unbind, requestRender }
}

export function clearPenOverlayContext(canvas: Canvas) {
  canvas.clearContext(canvas.contextTop)
}
