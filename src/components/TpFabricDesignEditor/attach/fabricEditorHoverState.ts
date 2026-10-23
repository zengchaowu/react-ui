import type { Canvas, FabricObject } from 'fabric'

export type FabricEditorNameLabelHitEntry = {
  el: HTMLElement
  subject: FabricObject
}

type HoverState = {
  target: FabricObject | null
  nameLabels: FabricEditorNameLabelHitEntry[]
  lastClientX: number
  lastClientY: number
}

const hoverByCanvas = new WeakMap<Canvas, HoverState>()

/** 名称命中区相对 DOM 盒向下多扩一段，桥接名称与图层顶边的空隙 */
const NAME_HIT_EXTRA_BOTTOM_PX = 14
const NAME_HIT_PAD_PX = 3

function ensure(canvas: Canvas): HoverState {
  let state = hoverByCanvas.get(canvas)
  if (!state) {
    state = {
      target: null,
      nameLabels: [],
      lastClientX: 0,
      lastClientY: 0,
    }
    hoverByCanvas.set(canvas, state)
  }
  return state
}

export function getFabricEditorHoverTarget(canvas: Canvas): FabricObject | null {
  return hoverByCanvas.get(canvas)?.target ?? null
}

export function setFabricEditorNameLabels(
  canvas: Canvas,
  labels: FabricEditorNameLabelHitEntry[],
): void {
  ensure(canvas).nameLabels = labels
}

export function noteFabricEditorPointerClient(
  canvas: Canvas,
  clientX: number,
  clientY: number,
): void {
  const state = ensure(canvas)
  state.lastClientX = clientX
  state.lastClientY = clientY
}

function pointHitsLabelRect(
  el: HTMLElement,
  x: number,
  y: number,
): boolean {
  if (el.style.display === 'none') return false
  const r = el.getBoundingClientRect()
  return (
    x >= r.left - NAME_HIT_PAD_PX &&
    x <= r.right + NAME_HIT_PAD_PX &&
    y >= r.top - NAME_HIT_PAD_PX &&
    y <= r.bottom + NAME_HIT_EXTRA_BOTTOM_PX
  )
}

/**
 * 用名称叠层几何做命中（标签 `pointer-events:none`，不依赖 DOM hover）。
 * 多个标签重叠时取后注册者（更靠上绘制的）。
 */
export function resolveFabricEditorNameLabelHit(
  canvas: Canvas,
): FabricObject | null {
  const state = hoverByCanvas.get(canvas)
  if (!state?.nameLabels.length) return null
  const { lastClientX: x, lastClientY: y, nameLabels } = state
  for (let i = nameLabels.length - 1; i >= 0; i -= 1) {
    const entry = nameLabels[i]!
    if (pointHitsLabelRect(entry.el, x, y)) return entry.subject
  }
  return null
}

export function setFabricEditorHoverTarget(
  canvas: Canvas,
  target: FabricObject | null,
): boolean {
  const state = ensure(canvas)
  const changed = state.target !== target
  state.target = target
  return changed
}

export function clearFabricEditorHoverTarget(canvas: Canvas): boolean {
  return setFabricEditorHoverTarget(canvas, null)
}
