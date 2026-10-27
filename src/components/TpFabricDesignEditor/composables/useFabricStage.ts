import { Canvas, Point } from 'fabric'
import { useReactiveShallowRef, useStableBox, type ReactiveRef } from './reactivity'
import {
  collectFabricStageContentObjects,
  measureFabricSceneBounds,
  resolveFabricViewportPanForSceneCenter,
  resolveFabricZoomToFitLevel,
} from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/transform/fabricStageZoomFit.pure'
import { detachArtboardEditingArtifacts } from '@zengchaowu/ui-shared/components/TpFabricDesignEditor/document/fabricArtboard'

export type FabricStageMountOptions = {
  /** 外层可视区域（flex 子节点），用于测量像素尺寸；必须与实际展示区域一致 */
  canvasWrapRef: ReactiveRef<HTMLElement | undefined>
  canvasHostRef: ReactiveRef<HTMLDivElement | undefined>
  /** 容器尚未铺开（宽高为 0）时的逻辑像素回退，通常对应 props.width / props.height */
  getFallbackSize: () => { width: number; height: number }
  /** 传给 `new Canvas(...)` 的选项（勿含 width/height，由舞台测量写入） */
  getFabricConstructorOptions: () => Omit<
    NonNullable<ConstructorParameters<typeof Canvas>[1]>,
    'width' | 'height'
  >
  enableZoom: () => boolean
  minZoom: () => number
  maxZoom: () => number
  onViewportChange?: () => void
}

/**
 * Fabric 画布舞台：DOM 独占创建、尺寸与容器同步、滚轮平移与 Ctrl+滚轮缩放（无限画布）。
 * 尺寸策略：优先使用 `canvasWrapRef` 的 client 尺寸，与 CSS 展示像素一致，避免固定 props 宽高与 flex 布局错位导致控制点命中失效。
 */
export function useFabricStage(opts: FabricStageMountOptions) {
  const canvasRef = useReactiveShallowRef<Canvas | undefined>()
  const internals = useStableBox({
    wheelHandler: null as ((e: WheelEvent) => void) | null,
    wheelTargetEl: null as HTMLElement | null,
    resizeObserver: null as ResizeObserver | null,
    resizeRaf: 0,
  })

  function clampZoom(zoom: number): number {
    const maxZ = opts.maxZoom()
    const minZ = opts.minZoom()
    return Math.max(minZ, Math.min(maxZ, zoom))
  }

  function notifyViewportChange() {
    opts.onViewportChange?.()
  }

  function getZoomPercent(): number {
    const canvas = canvasRef.value
    if (!canvas) return 100
    return Math.round(canvas.getZoom() * 100)
  }

  function setZoomPercent(percent: number, center?: Point) {
    const canvas = canvasRef.value
    if (!canvas || !opts.enableZoom()) return
    const zoom = clampZoom(percent / 100)
    const cx = center?.x ?? canvas.width / 2
    const cy = center?.y ?? canvas.height / 2
    canvas.zoomToPoint(new Point(cx, cy), zoom)
    canvas.requestRenderAll()
    notifyViewportChange()
  }

  function zoomIn() {
    setZoomPercent(Math.round(getZoomPercent() * 1.25))
  }

  function zoomOut() {
    setZoomPercent(Math.round(getZoomPercent() / 1.25))
  }

  function resetViewport() {
    const canvas = canvasRef.value
    if (!canvas) return
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
    canvas.setZoom(1)
    canvas.requestRenderAll()
    notifyViewportChange()
  }

  /** 将当前画布内容缩放并居中到可视区域（大容器 / 多对象时比单纯缩小比例更实用） */
  function zoomToFitContent(padding = 40) {
    const canvas = canvasRef.value
    if (!canvas || !opts.enableZoom()) return

    const bounds = measureFabricSceneBounds(
      collectFabricStageContentObjects(canvas),
    )
    if (!bounds) {
      resetViewport()
      return
    }

    const zoom = resolveFabricZoomToFitLevel({
      bounds,
      viewportWidth: canvas.width,
      viewportHeight: canvas.height,
      padding,
      minZoom: opts.minZoom(),
      maxZoom: opts.maxZoom(),
    })
    const centerX = bounds.left + bounds.width / 2
    const centerY = bounds.top + bounds.height / 2
    const { panX, panY } = resolveFabricViewportPanForSceneCenter({
      sceneCenterX: centerX,
      sceneCenterY: centerY,
      viewportWidth: canvas.width,
      viewportHeight: canvas.height,
      zoom,
    })

    canvas.setViewportTransform([zoom, 0, 0, zoom, panX, panY])
    canvas.requestRenderAll()
    notifyViewportChange()
  }

  function measureStageSize(): { width: number; height: number } {
    const wrap = opts.canvasWrapRef.value
    const fb = opts.getFallbackSize()
    if (!wrap) return fb
    const cw = wrap.clientWidth
    const ch = wrap.clientHeight
    if (cw > 0 && ch > 0) {
      return { width: Math.max(1, Math.floor(cw)), height: Math.max(1, Math.floor(ch)) }
    }
    return {
      width: Math.max(1, fb.width),
      height: Math.max(1, fb.height),
    }
  }

  function syncStageDimensions() {
    const canvas = canvasRef.value
    if (!canvas) return
    const { width, height } = measureStageSize()
    canvas.setDimensions({ width, height })
    detachArtboardEditingArtifacts(canvas)
    canvas.calcOffset()
    canvas.requestRenderAll()
    setupZoom()
  }

  function teardownZoom() {
    if (internals.value.wheelTargetEl && internals.value.wheelHandler) {
      internals.value.wheelTargetEl.removeEventListener('wheel', internals.value.wheelHandler, { capture: true })
    }
    internals.value.wheelTargetEl = null
    internals.value.wheelHandler = null
  }

  function resolveWheelTarget(canvas: Canvas): HTMLElement | null {
    return opts.canvasWrapRef.value ?? canvas.upperCanvasEl
  }

  function wantsWheelZoom(e: WheelEvent): boolean {
    return e.ctrlKey || e.metaKey || e.altKey
  }

  function setupZoom() {
    const canvas = canvasRef.value
    teardownZoom()
    if (!canvas) return

    const target = resolveWheelTarget(canvas)
    if (!target) return
    internals.value.wheelTargetEl = target

    internals.value.wheelHandler = (e: WheelEvent) => {
      const activeCanvas = canvasRef.value
      if (!activeCanvas) return

      const zoomModifier = wantsWheelZoom(e) && opts.enableZoom()

      if (zoomModifier) {
        // capture 阶段拦截，避免 Windows/Chrome 把 Ctrl+滚轮当成浏览器缩放
        e.preventDefault()
        e.stopPropagation()

        let zoom = activeCanvas.getZoom()
        zoom *= 0.999 ** e.deltaY
        zoom = clampZoom(zoom)

        const upper = activeCanvas.upperCanvasEl
        const rect = upper.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        activeCanvas.zoomToPoint(new Point(x, y), zoom)
        activeCanvas.requestRenderAll()
        notifyViewportChange()
        return
      }

      e.preventDefault()
      activeCanvas.relativePan(new Point(-e.deltaX, -e.deltaY))
      activeCanvas.requestRenderAll()
      notifyViewportChange()
    }
    target.addEventListener('wheel', internals.value.wheelHandler, { passive: false, capture: true })
  }

  /**
   * 在宿主 div 内创建 canvas 并初始化 Fabric；返回是否成功。
   */
  function mount(): boolean {
    const host = opts.canvasHostRef.value
    if (!host) return false

    host.replaceChildren()
    const el = document.createElement('canvas')
    el.className = 'tp-fabric-stage__canvas block h-full w-full min-h-0'
    el.style.display = 'block'
    host.appendChild(el)

    const { width, height } = measureStageSize()
    const canvas = new Canvas(el, {
      ...opts.getFabricConstructorOptions(),
      width,
      height,
    })
    canvas.upperCanvasEl.removeAttribute('draggable')
    canvasRef.value = canvas

    setupZoom()

    const wrap = opts.canvasWrapRef.value
    if (wrap && typeof ResizeObserver !== 'undefined') {
      internals.value.resizeObserver?.disconnect()
      internals.value.resizeObserver = new ResizeObserver(() => {
        if (internals.value.resizeRaf) cancelAnimationFrame(internals.value.resizeRaf)
        internals.value.resizeRaf = requestAnimationFrame(() => {
          internals.value.resizeRaf = 0
          syncStageDimensions()
        })
      })
      internals.value.resizeObserver.observe(wrap)
    }

    requestAnimationFrame(() => syncStageDimensions())

    return true
  }

  function dispose(): Promise<void> {
    teardownZoom()
    internals.value.resizeObserver?.disconnect()
    internals.value.resizeObserver = null
    if (internals.value.resizeRaf) cancelAnimationFrame(internals.value.resizeRaf)
    internals.value.resizeRaf = 0

    const inst = canvasRef.value
    canvasRef.value = undefined

    if (!inst) {
      opts.canvasHostRef.value?.replaceChildren()
      return Promise.resolve()
    }

    return inst
      .dispose()
      .then(() => undefined)
      .finally(() => {
        opts.canvasHostRef.value?.replaceChildren()
      })
  }

  return {
    canvasRef,
    mount,
    dispose,
    syncStageDimensions,
    measureStageSize,
    setupZoom,
    getZoomPercent,
    setZoomPercent,
    zoomIn,
    zoomOut,
    resetViewport,
    zoomToFitContent,
  }
}
