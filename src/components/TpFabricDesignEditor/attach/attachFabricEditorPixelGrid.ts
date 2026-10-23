import type { Canvas } from 'fabric'
import {
  canvasRgba,
  hexToRgb,
  tokenSolidColors,
} from '../../../assets/tokens/tokenSolidColors'
import { ZCW_APP_THEME_CHANGED_EVENT } from '../../../utils/appThemeDom'
import {
  parseCssRgbChannels,
  resolveElementCssColor,
} from '../utils/resolveElementCssColor'
import type { ArtboardSize } from '../document/fabricArtboard'
import {
  paintFabricEditorPixelGrid,
  shouldShowFabricEditorPixelGrid,
} from '../transform/fabricEditorPixelGrid.pure'

function resolvePixelGridColors(host: HTMLElement) {
  const fallback = hexToRgb(tokenSolidColors.grayColor15)
  const ink = resolveElementCssColor(
    host,
    '--text-color-primary',
    tokenSolidColors.grayColor15,
  )
  const rgb = parseCssRgbChannels(ink) ?? fallback
  return {
    line: canvasRgba(rgb[0], rgb[1], rgb[2], 0.12),
    major: canvasRgba(rgb[0], rgb[1], rgb[2], 0.28),
  }
}

/**
 * 高倍缩放时在画布上叠一层像素栅格（随 viewport 更新；低于阈值时隐藏）。
 */
export function attachFabricEditorPixelGrid(options: {
  getHost: () => HTMLElement | undefined
  getCanvas: () => Canvas | undefined
  getArtboard: () => ArtboardSize | null
}): { dispose: () => void; redraw: () => void } {
  const hostEl = options.getHost()
  if (!hostEl) return { dispose: () => {}, redraw: () => {} }
  const host: HTMLElement = hostEl

  const style = getComputedStyle(host)
  if (style.position === 'static') {
    host.style.position = 'relative'
  }

  const el = document.createElement('canvas')
  el.setAttribute('data-tp-fabric-pixel-grid', '')
  el.style.cssText = [
    'position:absolute',
    'inset:0',
    'width:100%',
    'height:100%',
    'pointer-events:none',
    'z-index:var(--z-index-above)',
    'display:none',
  ].join(';')
  host.appendChild(el)

  const ctx = el.getContext('2d')
  let raf = 0
  let boundCanvas: Canvas | null = null

  function syncSize() {
    const w = host.clientWidth
    const h = host.clientHeight
    const dpr = window.devicePixelRatio || 1
    if (el.width !== Math.floor(w * dpr) || el.height !== Math.floor(h * dpr)) {
      el.width = Math.floor(w * dpr)
      el.height = Math.floor(h * dpr)
      el.style.width = `${w}px`
      el.style.height = `${h}px`
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    return { w, h }
  }

  function redraw() {
    raf = 0
    if (!ctx) return
    const canvas = options.getCanvas()
    if (!canvas) {
      el.style.display = 'none'
      return
    }
    if (boundCanvas !== canvas) {
      boundCanvas?.off('after:render', scheduleRedraw)
      boundCanvas = canvas
      boundCanvas.on('after:render', scheduleRedraw)
    }

    const zoom = canvas.getZoom()
    if (!shouldShowFabricEditorPixelGrid(zoom)) {
      el.style.display = 'none'
      return
    }

    el.style.display = 'block'
    const { w, h } = syncSize()
    ctx.clearRect(0, 0, w, h)
    const vpt = canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0]
    paintFabricEditorPixelGrid(ctx, {
      width: w,
      height: h,
      zoom,
      panX: vpt[4]!,
      panY: vpt[5]!,
      artboard: options.getArtboard(),
      colors: resolvePixelGridColors(host),
    })
  }

  function scheduleRedraw() {
    if (raf) return
    raf = requestAnimationFrame(redraw)
  }

  const ro = new ResizeObserver(() => scheduleRedraw())
  ro.observe(host)
  window.addEventListener(ZCW_APP_THEME_CHANGED_EVENT, scheduleRedraw)
  scheduleRedraw()

  return {
    redraw: scheduleRedraw,
    dispose: () => {
      if (raf) cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener(ZCW_APP_THEME_CHANGED_EVENT, scheduleRedraw)
      boundCanvas?.off('after:render', scheduleRedraw)
      boundCanvas = null
      el.remove()
    },
  }
}
