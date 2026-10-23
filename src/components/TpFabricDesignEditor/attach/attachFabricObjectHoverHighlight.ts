import {
  ActiveSelection,
  type Canvas,
  type FabricObject,
  type TPointerEvent,
  type TPointerEventInfo,
} from 'fabric'
import { isFabricArtboardGuide } from '../document/fabricArtboard'
import { resolvePreferredGroupPointerTarget } from '../layers/fabricGroupPointerPolicy.pure'
import { hasFabricPathEditSession } from '../tools/penTool'
import { paintFabricObjectHoverOutline } from '../transform/fabricEditorHoverOutline.pure'
import { isFabricSelectionDragHiding } from './attachFabricSelectionPathHighlight'
import {
  clearFabricEditorHoverTarget,
  getFabricEditorHoverTarget,
  noteFabricEditorPointerClient,
  resolveFabricEditorNameLabelHit,
  setFabricEditorHoverTarget,
} from './fabricEditorHoverState'

function isSelectionChromeVisible(canvas: Canvas, obj: FabricObject): boolean {
  const active = canvas.getActiveObject()
  if (!active) return false
  if (active === obj) return true
  if (active instanceof ActiveSelection) {
    return (active.getObjects() as FabricObject[]).includes(obj)
  }
  return false
}

function resolveHoverCandidate(
  target: FabricObject | undefined,
  options?: { allowNonInteractive?: boolean },
): FabricObject | null {
  if (!target || target.visible === false) return null
  if (isFabricArtboardGuide(target)) return null
  if (
    !options?.allowNonInteractive &&
    target.selectable === false &&
    target.evented === false
  ) {
    return null
  }
  if (target instanceof ActiveSelection) return null
  return target
}

function resolveHoverFromPointer(
  canvas: Canvas,
  target: FabricObject | undefined,
  e?: Event,
): FabricObject | null {
  if (!e || !('clientX' in e)) {
    return resolveHoverCandidate(target)
  }
  const scenePoint = canvas.getScenePoint(e as TPointerEvent)
  const preferred = resolvePreferredGroupPointerTarget(
    canvas,
    target,
    scenePoint,
  )
  // 一级子元素优先：即便闭组下暂未 evented 也画 hover
  if (preferred && preferred !== target) {
    return (
      resolveHoverCandidate(preferred, { allowNonInteractive: true }) ??
      resolveHoverCandidate(target)
    )
  }
  return resolveHoverCandidate(preferred ?? target)
}

function notePointerFromEvent(canvas: Canvas, e?: Event) {
  if (!e || !('clientX' in e)) return
  const pe = e as PointerEvent | MouseEvent
  noteFabricEditorPointerClient(canvas, pe.clientX, pe.clientY)
}

type CanvasWithTarget = Canvas & { _target?: FabricObject }

/**
 * 选择工具下悬停图层画品牌色边框。
 * 名称区域用几何命中；容器/编组优先高亮一级子元素（含已选中该组时），
 * 嵌套再点 / 双击逐层深入。
 */
export function attachFabricObjectHoverHighlight(options: {
  canvas: Canvas
  getReadonly: () => boolean
  canHover: () => boolean
}): () => void {
  const { canvas, getReadonly, canHover } = options
  let pendingOutClear = 0

  function clearIfNeeded() {
    if (clearFabricEditorHoverTarget(canvas)) {
      canvas.requestRenderAll()
    }
  }

  function applyHover(next: FabricObject | null) {
    if (setFabricEditorHoverTarget(canvas, next)) {
      canvas.requestRenderAll()
    }
  }

  const onMouseMove = (opt: TPointerEventInfo) => {
    notePointerFromEvent(canvas, opt.e)
    if (pendingOutClear) {
      cancelAnimationFrame(pendingOutClear)
      pendingOutClear = 0
    }
    if (getReadonly() || !canHover() || hasFabricPathEditSession(canvas)) {
      clearIfNeeded()
      return
    }

    // 名称命中优先（标签在 upper-canvas 之上视觉层，事件仍由 canvas 收）
    const nameHit = resolveFabricEditorNameLabelHit(canvas)
    if (nameHit) {
      applyHover(nameHit)
      return
    }

    const next = resolveHoverFromPointer(canvas, opt.target, opt.e)
    applyHover(next)
  }

  const onMouseOut = (opt: TPointerEventInfo) => {
    notePointerFromEvent(canvas, opt.e)
    if (pendingOutClear) cancelAnimationFrame(pendingOutClear)
    pendingOutClear = requestAnimationFrame(() => {
      pendingOutClear = 0
      if (resolveFabricEditorNameLabelHit(canvas)) return
      clearIfNeeded()
    })
  }

  /** 点名称视为点图层；点容器时优先一级子元素 */
  const onMouseDownBefore = (opt: TPointerEventInfo) => {
    notePointerFromEvent(canvas, opt.e)
    if (getReadonly() || !canHover() || hasFabricPathEditSession(canvas)) return
    const nameHit = resolveFabricEditorNameLabelHit(canvas)
    if (nameHit) {
      ;(canvas as CanvasWithTarget)._target = nameHit
      applyHover(nameHit)
      return
    }
    if (!opt.e || !('clientX' in opt.e)) return
    const scenePoint = canvas.getScenePoint(opt.e as TPointerEvent)
    const preferred = resolvePreferredGroupPointerTarget(
      canvas,
      opt.target,
      scenePoint,
    )
    if (preferred && preferred !== opt.target) {
      // 闭组子节点本不可选；临时放开以便单击命中一级子元素
      preferred.set({ evented: true, selectable: true, hasControls: true })
      ;(canvas as CanvasWithTarget)._target = preferred
      applyHover(
        resolveHoverCandidate(preferred, { allowNonInteractive: true }),
      )
    }
  }

  const onAfterRender = (opt: { ctx?: CanvasRenderingContext2D }) => {
    if (
      getReadonly() ||
      !canHover() ||
      hasFabricPathEditSession(canvas) ||
      isFabricSelectionDragHiding(canvas)
    ) {
      return
    }
    const hovered = getFabricEditorHoverTarget(canvas)
    if (!hovered || hovered.visible === false) return
    if (isSelectionChromeVisible(canvas, hovered)) return

    const ctx = opt.ctx ?? canvas.getContext()
    if (!ctx) return
    const vpt = canvas.viewportTransform ?? [1, 0, 0, 1, 0, 0]
    paintFabricObjectHoverOutline(ctx, hovered, vpt)
  }

  canvas.on('mouse:move', onMouseMove)
  canvas.on('mouse:out', onMouseOut)
  canvas.on('mouse:down:before', onMouseDownBefore)
  canvas.on('after:render', onAfterRender)

  return () => {
    if (pendingOutClear) cancelAnimationFrame(pendingOutClear)
    clearFabricEditorHoverTarget(canvas)
    canvas.off('mouse:move', onMouseMove)
    canvas.off('mouse:out', onMouseOut)
    canvas.off('mouse:down:before', onMouseDownBefore)
    canvas.off('after:render', onAfterRender)
  }
}
