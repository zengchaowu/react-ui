/**
 * 浮层栈：z-index 分层 + DOM 顺序层叠 + Scoped Portal dismiss。
 *
 * - **视觉（modal 档）**：Dialog / Sheet / Popup / 全屏预览等 `--z-index-modal`；同档内 `bringOverlayHostToFront` append 到末尾
 * - **视觉（toast 档）**：Toast / Hud `--z-index-toast`，始终盖在 modal 档之上
 * - **挂载**：Dialog/Sheet 提供 `data-cw-overlay-scope`，子 Popup 挂入 scope 而非 body
 * - **Dismiss**：document 单监听；栈顶 = 文档序最后一个 `[data-cw-overlay-layer][data-cw-overlay-active]`
 * - **边界**：panel DOM 子树 + traps（`setOverlayLayerTraps`）
 */

/** Dialog / Sheet / Popup / 全屏预览等 modal 档 z-index */
export const CW_OVERLAY_MODAL_Z_CLASS = 'z-[var(--z-index-modal)]'

/** Toast / Hud 等全局反馈层 z-index（高于 modal 档） */
export const CW_OVERLAY_TOAST_Z_CLASS = 'z-[var(--z-index-toast)]'

/** 与 CwDynamicDialogInner 离场动画一致，用于 ephemeral mount 延迟 unmount */
export const CW_OVERLAY_LEAVE_MS = 300

/**
 * 入场前先绘制 hidden 态，再在下一帧触发展示（双 rAF）。
 * 单 rAF 时浏览器常把初始态与 visible 合并到同一帧，transition 不会播放。
 */
export function scheduleOverlayEnterVisible(run: () => void): () => void {
  let outerId = 0
  let innerId = 0
  outerId = requestAnimationFrame(() => {
    innerId = requestAnimationFrame(run)
  })
  return () => {
    cancelAnimationFrame(outerId)
    cancelAnimationFrame(innerId)
  }
}

/** 全屏图库/附件预览关闭动画（略短，点击关闭更跟手） */
export const CW_FULLSCREEN_PREVIEW_LEAVE_MS = 200

export const CW_OVERLAY_LAYER_ATTR = 'data-cw-overlay-layer'
export const CW_OVERLAY_LAYER_ID_ATTR = 'data-cw-overlay-layer-id'
export const CW_OVERLAY_ACTIVE_ATTR = 'data-cw-overlay-active'

interface OverlayLayerConfig {
  id: string
  rootEl: HTMLElement
  panelEl: HTMLElement
  isActive: () => boolean
  dismissOnClickOutside?: () => boolean
  dismissOnEscape?: () => boolean
  onDismiss: () => void
}

export interface OverlayLayerCommitInput {
  layerId: string
  rootEl: HTMLElement | null
  panelEl: HTMLElement | null
  trapEls?: Iterable<HTMLElement | null | undefined>
  isActive: () => boolean
  dismissOnClickOutside?: () => boolean
  dismissOnEscape?: () => boolean
  onDismiss: () => void
}

const layersById = new Map<string, OverlayLayerConfig>()
const trapsByLayerId = new Map<string, Set<HTMLElement>>()

let documentListenerAttached = false

/** appendChild 重排（内部用；兼容 lib.dom / dynamicMount 等不同 DOM 类型声明） */
function reparentOverlayHostToFront(host: unknown): void {
  if (host == null) return
  const parent = (host as { parentNode?: unknown }).parentNode as
    | { appendChild(node: unknown): unknown }
    | null
    | undefined
  if (!parent?.appendChild) return
  parent.appendChild(host)
}

export function bringOverlayHostToFront(host: unknown): void {
  reparentOverlayHostToFront(host)
}

/** DOM 挂载/append 后再置顶（next microtask + rAF，避免 ref 尚未就绪） */
export function scheduleBringOverlayHostToFront(
  hostOrGetter: unknown | (() => unknown),
): void {
  const resolve =
    typeof hostOrGetter === 'function' ? hostOrGetter : () => hostOrGetter
  queueMicrotask(() => {
    reparentOverlayHostToFront(resolve())
    requestAnimationFrame(() => reparentOverlayHostToFront(resolve()))
  })
}

export function syncOverlayLayerActive(rootEl: HTMLElement | null, active: boolean): void {
  if (!rootEl) return
  if (active) rootEl.setAttribute(CW_OVERLAY_ACTIVE_ATTR, '')
  else rootEl.removeAttribute(CW_OVERLAY_ACTIVE_ATTR)
}

/** 事件 target 是否落在任一 DOM 子树内（Dialog press-down / traps 判定复用） */
export function isEventTargetInsideNodes(
  target: EventTarget | null | undefined,
  ...nodes: (HTMLElement | null | undefined)[]
): boolean {
  if (!(target instanceof Node)) return false
  return nodes.some((node) => node?.contains(target))
}

/** 注册或更新一层（panel + traps）；DOM 未就绪时返回 false */
export function commitOverlayLayer(input: OverlayLayerCommitInput): boolean {
  const {
    layerId,
    rootEl,
    panelEl,
    trapEls = [],
    isActive,
    dismissOnClickOutside,
    dismissOnEscape,
    onDismiss,
  } = input

  if (!rootEl || !panelEl) return false

  setOverlayLayerTraps(layerId, trapEls)
  registerOverlayLayer({
    id: layerId,
    rootEl,
    panelEl,
    isActive,
    dismissOnClickOutside,
    dismissOnEscape,
    onDismiss,
  })
  return true
}

export function revokeOverlayLayer(layerId: string): void {
  layersById.delete(layerId)
  trapsByLayerId.delete(layerId)
  releaseDocumentListeners()
}

function markOverlayLayerRoot(el: HTMLElement, layerId: string): void {
  el.setAttribute(CW_OVERLAY_LAYER_ATTR, '')
  el.setAttribute(CW_OVERLAY_LAYER_ID_ATTR, layerId)
}

function registerOverlayLayer(config: OverlayLayerConfig): void {
  layersById.delete(config.id)
  markOverlayLayerRoot(config.rootEl, config.id)
  syncOverlayLayerActive(config.rootEl, config.isActive())
  layersById.set(config.id, config)
  ensureDocumentListeners()
}

function setOverlayLayerTraps(
  layerId: string,
  elements: Iterable<HTMLElement | null | undefined>,
): void {
  const set = new Set<HTMLElement>()
  for (const el of elements) {
    if (el) set.add(el)
  }
  if (set.size > 0) trapsByLayerId.set(layerId, set)
  else trapsByLayerId.delete(layerId)
}

function isTargetInsideOverlayLayer(config: OverlayLayerConfig, target: Node): boolean {
  if (config.panelEl.contains(target)) return true
  const traps = trapsByLayerId.get(config.id)
  if (!traps) return false
  for (const trap of traps) {
    if (trap.contains(target)) return true
  }
  return false
}

function findTopActiveOverlayLayer(): OverlayLayerConfig | undefined {
  if (typeof document === 'undefined') return undefined
  const layers = getNonDominatedActiveLayers()
  return layers[layers.length - 1]
}

/**
 * 收集所有活跃层，按 DOM 序返回「非被支配层」（从底层到顶层）。
 * "被支配" = 父层根节点包含子层根节点（Dialog 全屏根 + 内部 Popup 同时 active 时跳过父层）
 */
function getNonDominatedActiveLayers(): OverlayLayerConfig[] {
  const nodes = document.querySelectorAll(
    `[${CW_OVERLAY_LAYER_ATTR}][${CW_OVERLAY_ACTIVE_ATTR}]`,
  )
  const active: { node: HTMLElement; config: OverlayLayerConfig }[] = []
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i] as HTMLElement
    const id = node.getAttribute(CW_OVERLAY_LAYER_ID_ATTR)
    if (!id) continue
    const config = layersById.get(id)
    if (config?.isActive()) active.push({ node, config })
  }
  const result: OverlayLayerConfig[] = []
  for (let i = active.length - 1; i >= 0; i--) {
    const { node, config } = active[i]
    const dominated = active.slice(i + 1).some((other) => node.contains(other.node))
    if (!dominated) result.unshift(config)
  }
  return result
}

function handleDocumentClick(event: MouseEvent): void {
  if (typeof document === 'undefined') return
  const target = event.target
  if (!(target instanceof Node)) return

  const layers = getNonDominatedActiveLayers()
  if (layers.length === 0) return

  // 从顶到底找「命中 panel/trap」的最内层（数组末尾为 DOM 顶层）
  let innermostContainingIndex = -1
  for (let i = layers.length - 1; i >= 0; i--) {
    if (isTargetInsideOverlayLayer(layers[i], target)) {
      innermostContainingIndex = i
      break
    }
  }

  if (innermostContainingIndex >= 0) {
    // 点击落在某层内：关闭其上方、且允许 click-outside 的浮层（如 Dialog 内的 Tooltip）
    for (let j = layers.length - 1; j > innermostContainingIndex; j--) {
      const config = layers[j]
      if (config.dismissOnClickOutside?.() === false) continue
      config.onDismiss()
    }
    return
  }

  // 点击不在任何层面板内：从顶层关闭第一个允许 click-outside 的层
  for (let i = layers.length - 1; i >= 0; i--) {
    const config = layers[i]
    if (config.dismissOnClickOutside?.() === false) continue
    config.onDismiss()
    return
  }
}

function handleDocumentKeyDown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return
  const top = findTopActiveOverlayLayer()
  if (!top) return
  if (top.dismissOnEscape?.() === false) return
  event.preventDefault()
  top.onDismiss()
}

function ensureDocumentListeners(): void {
  if (documentListenerAttached || typeof document === 'undefined') return
  // capture：Dialog/Sheet 内容区有 @click.stop，bubble 到不了 document；须在捕获阶段 dismiss 上层 Popup/Tooltip
  document.addEventListener('click', handleDocumentClick, { capture: true, passive: true })
  document.addEventListener('keydown', handleDocumentKeyDown, { capture: true })
  documentListenerAttached = true
}

function releaseDocumentListeners(): void {
  if (!documentListenerAttached || layersById.size > 0) return
  document.removeEventListener('click', handleDocumentClick, { capture: true })
  document.removeEventListener('keydown', handleDocumentKeyDown, { capture: true })
  documentListenerAttached = false
}
