import type { Canvas } from 'fabric'
import { tokenSolidColors } from '../../../assets/tokens/tokenSolidColors'
import {
  ZCW_APP_THEME_CHANGED_EVENT,
} from '../../../utils/appThemeDom'
import { resolveElementCssColor } from '../utils/resolveElementCssColor'
import {
  FABRIC_EDITOR_RULER_SIZE_PX,
  paintFabricEditorRulers,
} from '../transform/fabricEditorRuler.pure'

function resolveRulerColors(host: HTMLElement) {
  return {
    background: resolveElementCssColor(
      host,
      '--bg-color-container',
      tokenSolidColors.bgColorContainer,
      'backgroundColor',
    ),
    border: resolveElementCssColor(
      host,
      '--border-color',
      tokenSolidColors.borderColorLight,
      'backgroundColor',
    ),
    tick: resolveElementCssColor(
      host,
      '--text-color-secondary',
      tokenSolidColors.textColorMuted,
    ),
    label: resolveElementCssColor(
      host,
      '--text-color-primary',
      tokenSolidColors.grayColor15,
    ),
  }
}

/**
 * 画布边缘标尺叠层（随 viewport 缩放/平移更新）。
 * `getVisible` 为 false 时隐藏；切换可见性后可调用返回的 `redraw`，或触发画布 `requestRenderAll`。
 */
export function attachFabricEditorRulers(options: {
  getHost: () => HTMLElement | undefined
  getCanvas: () => Canvas | undefined
  getVisible: () => boolean
}): { dispose: () => void; redraw: () => void } {
  const hostEl = options.getHost()
  if (!hostEl) return { dispose: () => {}, redraw: () => {} }
  const host: HTMLElement = hostEl

  const style = getComputedStyle(host)
  if (style.position === 'static') {
    host.style.position = 'relative'
  }

  const el = document.createElement('canvas')
  el.setAttribute('data-tp-fabric-rulers', '')
  el.style.cssText = [
    'position:absolute',
    'inset:0',
    'width:100%',
    'height:100%',
    'pointer-events:none',
    'z-index:var(--z-index-sticky)',
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
    if (!options.getVisible()) {
      el.style.display = 'none'
      return
    }
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
    el.style.display = 'block'
    const { w, h } = syncSize()
    const vpt = canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0]
    paintFabricEditorRulers(ctx, {
      width: w,
      height: h,
      zoom: canvas.getZoom(),
      panX: vpt[4]!,
      panY: vpt[5]!,
      sizePx: FABRIC_EDITOR_RULER_SIZE_PX,
      colors: resolveRulerColors(host),
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
