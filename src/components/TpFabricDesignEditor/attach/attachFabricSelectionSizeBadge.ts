import type { Canvas, FabricObject } from 'fabric'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'
import { roundTransformMetric } from '../transform/fabricEditorTransformMetrics.pure'
import { readFabricSelectionOverlayLayout } from '../transform/fabricSelectionOverlayLayout.pure'
import { isFabricSelectionDragHiding } from './attachFabricSelectionPathHighlight'
import { hasFabricPathEditSession } from '../tools/penTool'

const BADGE_GAP_PX = 12

function formatSizeLabel(width: number, height: number): string {
  const w = roundTransformMetric(Math.abs(width))
  const h = roundTransformMetric(Math.abs(height))
  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))
  return `${fmt(w)} × ${fmt(h)}`
}

function resolveBadgeHost(canvas: Canvas): HTMLElement | null {
  const upper = canvas.upperCanvasEl
  const host = upper?.parentElement
  if (!host) return null
  const style = getComputedStyle(host)
  if (style.position === 'static') {
    host.style.position = 'relative'
  }
  return host
}

/**
 * 选中图层底部尺寸徽章（贴局部底边中点，随旋转）。
 */
export function attachFabricSelectionSizeBadge(canvas: Canvas): () => void {
  const host = resolveBadgeHost(canvas)
  if (!host) return () => {}

  const el = document.createElement('div')
  el.setAttribute('data-tp-fabric-selection-size', '')
  el.style.cssText = [
    'position:absolute',
    'left:0',
    'top:0',
    'z-index:var(--z-index-above-high)',
    'display:none',
    'pointer-events:none',
    'box-sizing:border-box',
    `padding:2px 6px`,
    `border-radius:4px`,
    `background:${tokenSolidColors.brandColor6}`,
    `color:${tokenSolidColors.white}`,
    'font:11px system-ui, -apple-system, sans-serif',
    'line-height:1.2',
    'white-space:nowrap',
    'user-select:none',
    'transform-origin:left top',
  ].join(';')
  host.appendChild(el)

  function hide() {
    el.style.display = 'none'
  }

  function update() {
    if (hasFabricPathEditSession(canvas) || isFabricSelectionDragHiding(canvas)) {
      hide()
      return
    }
    const active = canvas.getActiveObject() as FabricObject | undefined
    if (!active || active.visible === false || !canvas.getActiveObjects().length) {
      hide()
      return
    }

    const layout = readFabricSelectionOverlayLayout(canvas, active, {
      nameGapPx: 0,
      sizeGapPx: BADGE_GAP_PX,
    })
    if (!layout) {
      hide()
      return
    }

    el.textContent = formatSizeLabel(layout.width, layout.height)
    el.style.display = 'block'
    // 先写出内容再量宽，沿顶边方向回半宽，使徽章中心落在底边中点
    const halfW = el.offsetWidth / 2
    el.style.left = `${layout.sizeAnchorCanvas.x - layout.alongTopCanvas.x * halfW}px`
    el.style.top = `${layout.sizeAnchorCanvas.y - layout.alongTopCanvas.y * halfW}px`
    el.style.transform = `rotate(${layout.edgeAngleDeg}deg)`
  }

  canvas.on('after:render', update)
  canvas.on('selection:cleared', hide)

  return () => {
    canvas.off('after:render', update)
    canvas.off('selection:cleared', hide)
    el.remove()
  }
}
