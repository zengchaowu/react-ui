import { createElement, useSyncExternalStore } from 'react'
import type { ReactElement } from 'react'
import { createPortal } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import { CW_OVERLAY_LEAVE_MS } from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'
import { scheduleBringOverlayHostToFront } from '../../constants/cwOverlayStack'
import {
  acquireOverlayBodyScrollLock,
  releaseOverlayBodyScrollLock,
} from '../../constants/overlayBodyScrollLock'
import CwHud from './CwHud'
import type { CwHudProps, CwHudTexts } from './types'

export interface ShowHudOptions {
  /**
   * 延迟多久才真正显示 HUD（毫秒）。在此时间内 `close` 使计数归零则不会出现闪屏。
   * 适合创建会话等可能很快完成的请求。默认 `500`；传 `0` 表示立即显示。
   */
  showDelayMs?: number
  /** 提示文案 */
  text?: string
  /** 是否显示遮罩（为 false 时不锁 body 滚动） */
  mask?: boolean
  /** 点击遮罩关闭（默认 false）；为 true 时点击会 `hideHud()` 并清空引用计数 */
  maskClosable?: boolean
  loadingType?: CwHudProps['loadingType']
  loadingSize?: CwHudProps['loadingSize']
  texts?: Partial<CwHudTexts>
}

export interface ShowHudReturn {
  /** 结束本次展示（全部 session 结束后才真正关闭；关闭内层会恢复外层文案） */
  close: () => void
}

interface HudState {
  visible: boolean
  text: string
  mask: boolean
  maskClosable: boolean
  loadingType: NonNullable<CwHudProps['loadingType']>
  loadingSize: NonNullable<CwHudProps['loadingSize']>
  texts: Partial<CwHudTexts>
}

/** 单次 showHud 的展示快照（全局仍是单例 HUD，不是叠多层 DOM） */
interface HudSession {
  id: symbol
  text: string
  mask: boolean
  maskClosable: boolean
  loadingType: NonNullable<CwHudProps['loadingType']>
  loadingSize: NonNullable<CwHudProps['loadingSize']>
  texts: Partial<CwHudTexts>
}

let root: Root | null = null
let hostContainer: HTMLDivElement | null = null
let destroyTimer: ReturnType<typeof setTimeout> | null = null
let bodyScrollHeldByHud = false
let pendingShowTimer: ReturnType<typeof setTimeout> | null = null
const sessions: HudSession[] = []

let state: HudState = {
  visible: false,
  text: '',
  mask: true,
  maskClosable: false,
  loadingType: 'spinner',
  loadingSize: 'medium',
  texts: {},
}

const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): HudState {
  return state
}

function updateState(patch: Partial<HudState>): void {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

function showDepth(): number {
  return sessions.length
}

function clearPendingShowTimer(): void {
  if (pendingShowTimer != null) {
    clearTimeout(pendingShowTimer)
    pendingShowTimer = null
  }
}

function cancelDestroyHost(): void {
  if (destroyTimer) {
    clearTimeout(destroyTimer)
    destroyTimer = null
  }
}

function destroyHost(): void {
  cancelDestroyHost()
  const instance = root
  const container = hostContainer
  root = null
  hostContainer = null
  instance?.unmount()
  container?.remove()
}

function scheduleDestroyHostIfIdle(wasVisible: boolean): void {
  cancelDestroyHost()
  const delay = wasVisible ? CW_OVERLAY_LEAVE_MS : 0
  destroyTimer = setTimeout(() => {
    destroyTimer = null
    if (showDepth() > 0 || state.visible || pendingShowTimer) return
    destroyHost()
  }, delay)
}

function applySessionToState(session: HudSession): void {
  updateState({
    text: session.text,
    mask: session.mask,
    maskClosable: session.maskClosable,
    loadingType: session.loadingType,
    loadingSize: session.loadingSize,
    texts: { ...session.texts },
  })
}

function buildSession(options: ShowHudOptions | undefined): HudSession {
  // 未传的字段继承当前顶层（或默认 state），便于内层只改 text
  const base = sessions[sessions.length - 1]
  return {
    id: Symbol('cw-hud-session'),
    text: options?.text !== undefined ? options.text : (base?.text ?? state.text),
    mask: options?.mask !== undefined ? options.mask : (base?.mask ?? state.mask),
    maskClosable:
      options?.maskClosable !== undefined
        ? options.maskClosable
        : (base?.maskClosable ?? state.maskClosable),
    loadingType:
      options?.loadingType !== undefined
        ? options.loadingType
        : (base?.loadingType ?? state.loadingType),
    loadingSize:
      options?.loadingSize !== undefined
        ? options.loadingSize
        : (base?.loadingSize ?? state.loadingSize),
    texts:
      options?.texts !== undefined
        ? { ...options.texts }
        : { ...(base?.texts ?? state.texts) },
  }
}

function lockBodyIfNeeded(): void {
  if (!state.visible || !state.mask || bodyScrollHeldByHud) return
  acquireOverlayBodyScrollLock()
  bodyScrollHeldByHud = true
}

function unlockBodyIfNeeded(): void {
  if (!bodyScrollHeldByHud) return
  releaseOverlayBodyScrollLock()
  bodyScrollHeldByHud = false
}

/** 单例 HUD 宿主：订阅模块级 state，始终只渲染一层 CwHud */
function HudHost(): ReactElement {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return createElement(CwHud, {
    visible: snapshot.visible,
    text: snapshot.text,
    mask: snapshot.mask,
    maskClosable: snapshot.maskClosable,
    loadingType: snapshot.loadingType,
    loadingSize: snapshot.loadingSize,
    texts: snapshot.texts,
    onVisibleChange: (visible: boolean) => {
      if (!visible && state.maskClosable && hostContainer) {
        hideHud()
      }
    },
  })
}

function ensureHostMounted(): void {
  cancelDestroyHost()
  if (hostContainer) return

  const container = document.createElement('div')
  container.id = `cw-hud-host-${Date.now()}`
  document.body.appendChild(container)
  hostContainer = container
  root = createRoot(container)
  // 单例宿主常驻 body：HUD 壳层由 CwHud 内的 CwDynamicDialogLayer 负责叠加/离场动画
  root.render(createPortal(createElement(HudHost), document.body))
}

function onHudShown(): void {
  lockBodyIfNeeded()
  if (hostContainer) {
    scheduleBringOverlayHostToFront(hostContainer)
  }
}

function finishHudSession(wasVisible: boolean): void {
  clearPendingShowTimer()
  updateState({ visible: false })
  unlockBodyIfNeeded()
  scheduleDestroyHostIfIdle(wasVisible)
}

/**
 * 全局 Loading HUD（按需 mount；全部 session 结束且关闭动画结束后 unmount）。
 * 可多次调用：每次返回 `close()`；**视觉上始终只有一层**（单例），内层 close 后恢复外层文案。
 * 默认 `showDelayMs: 500`：500ms 内结束的任务不会出现 HUD。
 */
export function showHud(options?: ShowHudOptions): ShowHudReturn {
  ensureHostMounted()
  const session = buildSession(options)
  sessions.push(session)
  applySessionToState(session)

  const delayMs = options?.showDelayMs ?? 500
  let closed = false

  if (delayMs <= 0) {
    clearPendingShowTimer()
    updateState({ visible: true })
    onHudShown()
  } else if (state.visible) {
    onHudShown()
  } else if (!pendingShowTimer) {
    pendingShowTimer = setTimeout(() => {
      pendingShowTimer = null
      if (showDepth() > 0) {
        updateState({ visible: true })
        onHudShown()
      }
    }, delayMs)
  }

  return {
    close: () => {
      if (closed) return
      closed = true
      const wasVisible = state.visible
      const idx = sessions.findIndex((item) => item.id === session.id)
      if (idx >= 0) sessions.splice(idx, 1)

      if (showDepth() === 0) {
        finishHudSession(wasVisible)
        return
      }

      // 仍有外层：恢复栈顶文案/配置（不是叠第二层 DOM）
      applySessionToState(sessions[sessions.length - 1]!)
      if (state.mask) lockBodyIfNeeded()
      else unlockBodyIfNeeded()
    },
  }
}

/** 强制关闭 HUD 并重置全部 session */
export function hideHud(): void {
  const wasVisible = state.visible
  sessions.length = 0
  finishHudSession(wasVisible)
}
