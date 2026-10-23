import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { ChatMessage } from '@zengchaowu/shared/types/im-chat'
import {
  clientPointToContent,
  collectRowElByItemId,
  computeViewportEdgeScrollDelta,
  DEFAULT_DRAG_ENTER_MIN_PX,
  idsInClientLasso,
  isPrimaryPointer,
  lassoBoxInScrollContent,
  meetsDragEnterThreshold,
  pointerHitsInteractive,
  resolveLassoSeed,
  startContentPoint,
  strokeBounds,
  type LassoBoxRect,
} from '@zengchaowu/shared/functions/dom/lassoSelection'

export type { LassoBoxRect }

export type UseChatMessageListLassoOptions = {
  messages: readonly ChatMessage[]
  dragToEnterSelectionEnabled: boolean
  selectionEnabled: boolean
  messageSelectable?: (message: ChatMessage) => boolean
  getViewport: () => HTMLElement | null
  onDragEnterSelection: (message: ChatMessage) => void
  onSelectedIdsChange: (ids: string[]) => void
}

type RowElByItemId = ReturnType<typeof collectRowElByItemId>

type LassoSession = {
  startClientX: number
  startClientY: number
  startScrollLeft: number
  startScrollTop: number
  pointerId: number
  seedItem: ChatMessage
  dragActive: boolean
  captureEl: HTMLElement
  rowElByItemId: RowElByItemId
}

/**
 * 气泡正文 / 可导航引用条 / Agent 工具时间线详情：允许划选文字或正常 click，不启动拖选进入多选。
 */
function pointerHitsBubbleContent(target: EventTarget | null): boolean {
  const el = target instanceof HTMLElement ? target : null
  if (!el) return false
  if (el.closest('[data-cw-chat-message-bubble-body]')) return true
  if (el.closest('[data-cw-agent-tool-timeline]')) return true
  if (el.closest('.cw-chat-message-quote[role="button"]')) return true
  return false
}

function shouldSkipLassoPointerDown(
  message: ChatMessage | undefined,
  target: unknown,
  messageSelectable?: (message: ChatMessage) => boolean,
): boolean {
  const eventTarget = target as EventTarget | null
  if (pointerHitsBubbleContent(eventTarget)) return true
  if (message && messageSelectable && !messageSelectable(message)) return true
  const el = eventTarget instanceof HTMLElement ? eventTarget : null
  if (el?.closest('[data-cw-peer-avatar]')) return true
  return false
}

/**
 * 消息列表拖选进入多选（React 版 `useChatMessageListLasso`）。
 * 纯计算来自 `@zengchaowu/shared/functions/dom/lassoSelection`，这里只负责 DOM 事件与状态。
 */
export function useChatMessageListLasso(options: UseChatMessageListLassoOptions) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const rowIdAttribute = 'data-cw-message-row-id'
  const dragEnterMinPx = DEFAULT_DRAG_ENTER_MIN_PX

  const [lassoBox, setLassoBox] = useState<LassoBoxRect | null>(null)

  const sessionRef = useRef<LassoSession | null>(null)
  const suppressRowToggleRef = useRef(false)
  const suppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastXRef = useRef(0)
  const lastYRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const selectBlockInstalledRef = useRef(false)
  const savedBodyUserSelectRef = useRef('')
  const disposeRef = useRef<() => void>(() => {})

  function blockNativeSelection() {
    if (typeof document === 'undefined') return
    try {
      document.addEventListener('selectstart', onSelectStartBlock, true)
      selectBlockInstalledRef.current = true
      savedBodyUserSelectRef.current = document.body.style.userSelect
      document.body.style.userSelect = 'none'
    } catch {
      selectBlockInstalledRef.current = false
    }
  }

  function onSelectStartBlock(ev: Event) {
    ev.preventDefault()
  }

  function restoreNativeSelection() {
    if (typeof document === 'undefined') return
    if (selectBlockInstalledRef.current) {
      try {
        document.removeEventListener('selectstart', onSelectStartBlock, true)
      } catch {
        /* ignore */
      }
      selectBlockInstalledRef.current = false
    }
    try {
      document.body.style.userSelect = savedBodyUserSelectRef.current
    } catch {
      /* ignore */
    }
  }

  function detachWindowListeners() {
    if (typeof window === 'undefined') return
    window.removeEventListener('pointermove', onWindowPointerMove, true)
    window.removeEventListener('pointerup', onWindowPointerEnd, true)
    window.removeEventListener('pointercancel', onWindowPointerEnd, true)
  }

  function stopEdgeScrollLoop() {
    if (rafRef.current != null) {
      if (typeof window !== 'undefined') {
        window.cancelAnimationFrame(rafRef.current)
      }
      rafRef.current = null
    }
  }

  function refreshLassoBoxFromLastPointer() {
    const s = sessionRef.current
    if (!s?.dragActive) {
      setLassoBox(null)
      return
    }
    const viewport = optionsRef.current.getViewport()
    if (!viewport) {
      setLassoBox(null)
      return
    }
    const start = startContentPoint(
      s.startClientX,
      s.startClientY,
      s.startScrollLeft,
      s.startScrollTop,
      viewport,
    )
    const end = clientPointToContent(lastXRef.current, lastYRef.current, viewport)
    setLassoBox(lassoBoxInScrollContent(strokeBounds(start.x, start.y, end.x, end.y), viewport))
  }

  function edgeScrollFrame() {
    rafRef.current = null
    const s = sessionRef.current
    if (!s) return
    if (typeof window === 'undefined') return

    const viewport = optionsRef.current.getViewport()
    if (!viewport) return

    const delta = computeViewportEdgeScrollDelta(lastYRef.current, viewport)
    if (delta !== 0) {
      const maxTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight)
      viewport.scrollTop = Math.min(maxTop, Math.max(0, viewport.scrollTop + delta))
      refreshLassoBoxFromLastPointer()
    }

    if (sessionRef.current && computeViewportEdgeScrollDelta(lastYRef.current, viewport) !== 0) {
      rafRef.current = window.requestAnimationFrame(edgeScrollFrame)
    }
  }

  function ensureEdgeScrollLoop() {
    if (rafRef.current == null && typeof window !== 'undefined') {
      rafRef.current = window.requestAnimationFrame(edgeScrollFrame)
    }
  }

  function commitDragSelection(s: LassoSession) {
    const opts = optionsRef.current
    const viewport = opts.getViewport()
    opts.onDragEnterSelection(s.seedItem)
    if (!viewport) {
      opts.onSelectedIdsChange([])
      return
    }
    s.rowElByItemId = collectRowElByItemId(viewport, rowIdAttribute)
    opts.onSelectedIdsChange(
      idsInClientLasso(
        opts.messages,
        s.rowElByItemId,
        s.startClientX,
        s.startClientY,
        lastXRef.current,
        lastYRef.current,
        opts.messageSelectable,
      ),
    )
  }

  function endSession() {
    const s = sessionRef.current
    if (!s) return
    const opts = optionsRef.current
    const shouldCommit = s.dragActive && opts.dragToEnterSelectionEnabled

    if (shouldCommit) {
      commitDragSelection(s)
    }

    try {
      if (s.captureEl.hasPointerCapture(s.pointerId)) {
        s.captureEl.releasePointerCapture(s.pointerId)
      }
    } catch {
      /* ignore */
    }
    detachWindowListeners()
    stopEdgeScrollLoop()
    restoreNativeSelection()
    sessionRef.current = null
    setLassoBox(null)

    if (shouldCommit) {
      // click 在 pointerup 之后的同一轮任务里触发，晚于 microtask；
      // 用 macrotask 保持抑制，避免空白区 click 把刚框选的结果清掉。
      if (suppressTimerRef.current != null) {
        clearTimeout(suppressTimerRef.current)
        suppressTimerRef.current = null
      }
      suppressRowToggleRef.current = true
      suppressTimerRef.current = setTimeout(() => {
        suppressTimerRef.current = null
        suppressRowToggleRef.current = false
      }, 0)
    }
  }

  function onWindowPointerEnd(e: PointerEvent) {
    const s = sessionRef.current
    if (!s || e.pointerId !== s.pointerId) return
    endSession()
  }

  function onWindowPointerMove(e: PointerEvent) {
    const s = sessionRef.current
    if (!s || e.pointerId !== s.pointerId) return
    if (!optionsRef.current.dragToEnterSelectionEnabled) {
      endSession()
      return
    }

    lastXRef.current = e.clientX
    lastYRef.current = e.clientY

    const dx = e.clientX - s.startClientX
    const dy = e.clientY - s.startClientY
    if (typeof document !== 'undefined') {
      document.getSelection()?.removeAllRanges()
    }

    if (!s.dragActive) {
      if (!meetsDragEnterThreshold(dx, dy, dragEnterMinPx)) {
        setLassoBox(null)
        ensureEdgeScrollLoop()
        return
      }
      s.dragActive = true
      try {
        if (!s.captureEl.hasPointerCapture(s.pointerId)) {
          s.captureEl.setPointerCapture(s.pointerId)
        }
      } catch {
        /* ignore */
      }
    }

    refreshLassoBoxFromLastPointer()
    ensureEdgeScrollLoop()
  }

  function attachWindowListeners() {
    if (typeof window === 'undefined') return
    window.addEventListener('pointermove', onWindowPointerMove, true)
    window.addEventListener('pointerup', onWindowPointerEnd, true)
    window.addEventListener('pointercancel', onWindowPointerEnd, true)
  }

  function shouldSkipDefaultPointerDown(item: ChatMessage | undefined, target: unknown): boolean {
    const opts = optionsRef.current
    if (shouldSkipLassoPointerDown(item, target, opts.messageSelectable)) return true
    if (item && opts.messageSelectable && !opts.messageSelectable(item)) return true
    if (pointerHitsInteractive(target)) return true
    return false
  }

  function onColumnPointerDownCapture(e: ReactPointerEvent<HTMLDivElement>) {
    const opts = optionsRef.current
    if (opts.selectionEnabled || !opts.dragToEnterSelectionEnabled) return

    const native = e.nativeEvent
    if (!isPrimaryPointer(native)) return
    const col = e.currentTarget
    if (!col) return

    const viewportEl = opts.getViewport()
    if (!viewportEl) return
    const rowElByItemId = collectRowElByItemId(viewportEl, rowIdAttribute)
    if (rowElByItemId.size === 0) return

    const resolved = resolveLassoSeed(
      opts.messages,
      rowElByItemId,
      rowIdAttribute,
      e.target,
      native.clientX,
      native.clientY,
    )
    const seedItem: ChatMessage | null = resolved?.item ?? null
    if (!seedItem) return
    if (shouldSkipDefaultPointerDown(resolved?.item, e.target)) return

    if (sessionRef.current) endSession()

    lastXRef.current = native.clientX
    lastYRef.current = native.clientY
    setLassoBox(null)
    sessionRef.current = {
      startClientX: native.clientX,
      startClientY: native.clientY,
      startScrollLeft: viewportEl.scrollLeft,
      startScrollTop: viewportEl.scrollTop,
      pointerId: native.pointerId,
      seedItem,
      dragActive: false,
      captureEl: col,
      rowElByItemId,
    }
    blockNativeSelection()
    attachWindowListeners()
  }

  function consumeSuppressRowToggle(): boolean {
    if (!suppressRowToggleRef.current) return false
    suppressRowToggleRef.current = false
    if (suppressTimerRef.current != null) {
      clearTimeout(suppressTimerRef.current)
      suppressTimerRef.current = null
    }
    return true
  }

  function dispose() {
    stopEdgeScrollLoop()
    if (suppressTimerRef.current != null) {
      clearTimeout(suppressTimerRef.current)
      suppressTimerRef.current = null
    }
    suppressRowToggleRef.current = false
    endSession()
  }

  disposeRef.current = dispose

  useEffect(() => {
    return () => {
      disposeRef.current()
    }
  }, [])

  return {
    lassoBox,
    onColumnPointerDownCapture,
    consumeSuppressRowToggle,
    dispose,
  }
}
