import { createElement, useSyncExternalStore } from 'react'
import type { ReactElement } from 'react'
import { createPortal } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import { CW_OVERLAY_LEAVE_MS } from '@zengchaowu/ui-shared/constants/cwOverlayZIndex'
import { scheduleBringOverlayHostToFront } from '../../constants/cwOverlayStack'
import CwToast from './CwToast'
import type { CwRichTextNode } from '../CwRichText/types'
import type { CwToastPosition, CwToastType } from './types'

export type { CwRichTextNode } from '../CwRichText/types'

export interface ShowCwToastOptions {
  /** 纯文案；与 {@link dsl} 二选一，dsl 优先 */
  message?: string
  /** {@link CwRichText} DSL（多链接、加粗等） */
  dsl?: CwRichTextNode[]
  /** 类型 */
  type?: CwToastType
  /** 显示位置 */
  position?: CwToastPosition
  /** 显示时长（毫秒），0 表示不自动关闭（如 loading） */
  duration?: number
  /**
   * 鼠标悬停在 Toast 内容上时暂停自动关闭，移出后继续倒计时（默认开启）。
   * 仅对 `duration > 0` 生效。
   */
  pauseOnHover?: boolean
  /** {@link CwRichText} 链接点击；`href` 由 DSL 节点定义，可配置多个链接 */
  onLinkClick?: (href: string, event: MouseEvent) => void
  /** 关闭回调 */
  onClose?: () => void
  /** replace=覆盖当前 toast，queue=排队依次显示 */
  mode?: 'replace' | 'queue'
}

export interface ShowCwToastReturn {
  /** 手动关闭当前 Toast（会播关闭动画） */
  close: () => void
}

interface ToastState {
  visible: boolean
  message: string
  dsl: CwRichTextNode[]
  type: CwToastType
  position: CwToastPosition
  contentKey: number
  onClosed?: () => void
  onClose?: () => void
}

interface QueuedItem {
  message: string
  dsl?: CwRichTextNode[]
  type: CwToastType
  position: CwToastPosition
  duration: number
  pauseOnHover: boolean
  onLinkClick?: (href: string, event: MouseEvent) => void
  onClose?: () => void
}

let root: Root | null = null
let hostContainer: HTMLDivElement | null = null
let destroyTimer: ReturnType<typeof setTimeout> | null = null
let timer: ReturnType<typeof setTimeout> | null = null
const queue: QueuedItem[] = []

let currentDuration = 0
let pauseOnHoverEnabled = true
let dismissDeadline = 0
let remainingMs = 0
let currentLinkClick: ((href: string, event: MouseEvent) => void) | undefined

let state: ToastState = {
  visible: false,
  message: '',
  dsl: [],
  type: 'text',
  position: 'top',
  contentKey: 0,
}

const listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): ToastState {
  return state
}

function updateState(patch: Partial<ToastState>): void {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function cancelDestroyHost() {
  if (destroyTimer) {
    clearTimeout(destroyTimer)
    destroyTimer = null
  }
}

function destroyHost() {
  cancelDestroyHost()
  clearTimer()
  const instance = root
  const container = hostContainer
  root = null
  hostContainer = null
  instance?.unmount()
  container?.remove()
}

function scheduleDestroyHostIfIdle() {
  cancelDestroyHost()
  destroyTimer = setTimeout(() => {
    destroyTimer = null
    if (!state.visible && queue.length === 0) {
      destroyHost()
    }
  }, CW_OVERLAY_LEAVE_MS + 50)
}

function ensureHostMounted() {
  cancelDestroyHost()
  if (root && hostContainer) return
  const container = document.createElement('div')
  container.id = 'cw-toast-host'
  document.body.appendChild(container)
  hostContainer = container
  root = createRoot(container)
  root.render(createPortal(createElement(ToastHost), document.body))
}

function bindAutoCloseForItem(duration: number, pauseOnHover: boolean) {
  clearTimer()
  currentDuration = duration
  pauseOnHoverEnabled = pauseOnHover
  if (duration <= 0) return
  dismissDeadline = Date.now() + duration
  remainingMs = duration
  timer = setTimeout(() => {
    updateState({ visible: false })
  }, duration)
}

function pauseAutoCloseTimer() {
  if (!pauseOnHoverEnabled || currentDuration <= 0 || !timer) return
  clearTimer()
  remainingMs = Math.max(0, dismissDeadline - Date.now())
}

function resumeAutoCloseTimer() {
  if (!pauseOnHoverEnabled || currentDuration <= 0 || timer) return
  if (remainingMs <= 0) {
    updateState({ visible: false })
    return
  }
  dismissDeadline = Date.now() + remainingMs
  timer = setTimeout(() => {
    updateState({ visible: false })
  }, remainingMs)
}

function applyContent(item: {
  message?: string
  dsl?: CwRichTextNode[]
  onLinkClick?: (href: string, event: MouseEvent) => void
}) {
  const nextDsl = item.dsl?.length ? [...item.dsl] : []
  updateState({
    dsl: nextDsl,
    message: nextDsl.length > 0 ? '' : (item.message?.trim() ?? ''),
  })
  currentLinkClick = item.onLinkClick
}

/** 单例 Toast 宿主：订阅模块级 state，始终只渲染一层 CwToast */
function ToastHost(): ReactElement {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return createElement(CwToast, {
    visible: snapshot.visible,
    message: snapshot.message,
    dsl: snapshot.dsl,
    type: snapshot.type,
    position: snapshot.position,
    contentKey: snapshot.contentKey,
    onAutoClosePause: pauseAutoCloseTimer,
    onAutoCloseResume: resumeAutoCloseTimer,
    onVisibleChange: (value: boolean) => {
      // 组件内上滑隐藏会置为 false；命令式宿主据此同步状态并停掉自动关闭
      if (!value) clearTimer()
      updateState({ visible: Boolean(value) })
    },
    onLinkClick: (href: string, event: MouseEvent) => {
      currentLinkClick?.(href, event)
    },
    onClose: () => {
      state.onClosed?.()
      state.onClose?.()
      if (!state.visible && queue.length === 0) {
        scheduleDestroyHostIfIdle()
      }
    },
  })
}

function processQueue() {
  if (state.visible || queue.length === 0) return
  const item = queue.shift()
  if (!item) return
  applyContent(item)
  updateState({
    type: item.type,
    position: item.position,
    onClose: item.onClose,
    visible: true,
    onClosed: processQueue,
    contentKey: state.contentKey + 1,
  })
  bindAutoCloseForItem(item.duration, item.pauseOnHover)
  if (hostContainer) {
    scheduleBringOverlayHostToFront(hostContainer)
  }
}

/**
 * 以命令式方式显示 Toast（按需 mount；队列空且关闭动画结束后 unmount）
 */
export function showCwToast(options: ShowCwToastOptions = {}): ShowCwToastReturn {
  const {
    message = '',
    dsl,
    type = 'text',
    position = 'top',
    duration = 2000,
    pauseOnHover = true,
    onLinkClick,
    onClose,
    mode = 'replace',
  } = options

  ensureHostMounted()
  if (hostContainer) {
    scheduleBringOverlayHostToFront(hostContainer)
  }

  const applyAndShow = () => {
    applyContent({ message, dsl, onLinkClick })
    updateState({
      type,
      position,
      onClose,
      contentKey: state.contentKey + 1,
      visible: true,
      onClosed: undefined,
    })
    bindAutoCloseForItem(duration, pauseOnHover)
  }

  if (mode === 'queue') {
    queue.push({
      message,
      dsl,
      type,
      position,
      duration,
      pauseOnHover,
      onLinkClick,
      onClose,
    })
    if (!state.visible) {
      processQueue()
    }
  } else if (state.visible) {
    clearTimer()
    applyContent({ message, dsl, onLinkClick })
    updateState({
      type,
      position,
      onClose,
      contentKey: state.contentKey + 1,
    })
    bindAutoCloseForItem(duration, pauseOnHover)
  } else {
    applyAndShow()
  }

  return {
    close: () => {
      clearTimer()
      currentDuration = 0
      currentLinkClick = undefined
      updateState({ dsl: [], message: '', visible: false })
    },
  }
}
