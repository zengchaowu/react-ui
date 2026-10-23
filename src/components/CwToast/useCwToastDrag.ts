import { useEffect, useRef, useState } from 'react'
import type {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react'

/** 判定为「上滑隐藏」的最小上移距离（px） */
const DISMISS_MIN_PX = 20
/** 拖动多远后完全淡出（px） */
const FADE_DISTANCE_PX = 30
/** 回弹 / 甩出动画时长（ms） */
const ANIMATION_MS = 240
/** 判定手势方向前的最小位移，避免误触（px） */
const DIRECTION_THRESHOLD_PX = 6

export interface UseCwToastDragOptions {
  /** Toast 内容盒子：手势监听绑在此元素上 */
  elRef: RefObject<HTMLElement | null>
  /** 是否可见；不可见时不响应手势 */
  isVisible: boolean
  /** 上滑超过阈值后触发，调用方据此关闭 Toast */
  onDismiss: () => void
}

export interface UseCwToastDragReturn {
  /** 拖动中的位移 / 透明度 / 过渡样式 */
  dragStyle: CSSProperties | undefined
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void
}

/**
 * Toast「上滑隐藏」手势：仅纵向向上拖动生效，松手时超过阈值即关闭，否则回弹。
 * 基于 Pointer Events，触摸与指针设备均可用。
 */
export function useCwToastDrag(
  options: UseCwToastDragOptions,
): UseCwToastDragReturn {
  const [dragOffset, setDragOffset] = useState(0)
  const [transitionEnabled, setTransitionEnabled] = useState(false)

  const dragOffsetRef = useRef(0)
  const pointerIdRef = useRef<number | null>(null)
  const startYRef = useRef(0)
  const decidedRef = useRef(false)
  const dragActiveRef = useRef(false)
  const animatingDismissRef = useRef(false)
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())

  const onDismissRef = useRef(options.onDismiss)
  onDismissRef.current = options.onDismiss
  const elRef = options.elRef
  const isVisible = options.isVisible

  function updateOffset(value: number) {
    dragOffsetRef.current = value
    setDragOffset(value)
  }

  function addTimer(run: () => void, delay: number) {
    const id = setTimeout(() => {
      timersRef.current.delete(id)
      run()
    }, delay)
    timersRef.current.add(id)
  }

  function resetGesture() {
    pointerIdRef.current = null
    decidedRef.current = false
    dragActiveRef.current = false
    updateOffset(0)
  }

  function snapBack() {
    setTransitionEnabled(true)
    updateOffset(0)
    addTimer(() => {
      setTransitionEnabled(false)
    }, ANIMATION_MS)
  }

  function dismiss() {
    if (animatingDismissRef.current) return
    animatingDismissRef.current = true
    setTransitionEnabled(true)
    // 甩出到视口顶部之外，任意 position 均能划出画面
    const rect = elRef.current?.getBoundingClientRect()
    updateOffset(rect ? rect.top + rect.height + 24 : window.innerHeight)
    addTimer(() => {
      onDismissRef.current()
      animatingDismissRef.current = false
      setTransitionEnabled(false)
    }, ANIMATION_MS)
  }

  // 重新显示时复位拖动状态
  useEffect(() => {
    if (!isVisible) return
    dragOffsetRef.current = 0
    setDragOffset(0)
    animatingDismissRef.current = false
    setTransitionEnabled(false)
  }, [isVisible])

  // 卸载时清理定时器
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((id) => clearTimeout(id))
      timers.clear()
    }
  }, [])

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (!isVisible || animatingDismissRef.current || event.button !== 0) return

    pointerIdRef.current = event.pointerId
    startYRef.current = event.clientY
    decidedRef.current = false
    dragActiveRef.current = false
    setTransitionEnabled(false)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (pointerIdRef.current !== event.pointerId) return

    const dy = event.clientY - startYRef.current
    const upDistance = dy < 0 ? -dy : 0

    if (!decidedRef.current) {
      if (Math.abs(dy) < DIRECTION_THRESHOLD_PX) return
      decidedRef.current = true
      if (upDistance <= 0) {
        // 仅向上拖动生效；向下拖动不拦截
        resetGesture()
        return
      }
      dragActiveRef.current = true
      try {
        elRef.current?.setPointerCapture(event.pointerId)
      } catch {
        // 指针已释放等场景下 capture 会抛错；忽略即可，元素自身监听仍在
      }
    }

    if (!dragActiveRef.current) return
    event.preventDefault()
    updateOffset(upDistance)
  }

  function onPointerUp(event: ReactPointerEvent<HTMLElement>) {
    if (pointerIdRef.current !== event.pointerId) return

    const el = elRef.current
    if (el?.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId)
    }

    // 用 dragOffset > 0 判定（而不是 dragActive）：某些时序下 pointercancel 会先于 up 到达，
    // resetGesture 可能被意外触发把 dragActive 清掉，但 offset 还在；只看 dragActive 会
    // 漏掉回弹/隐藏路径，Toast 就停在半透明中间态。
    const off = dragOffsetRef.current
    if (off > 0) {
      if (off >= DISMISS_MIN_PX) dismiss()
      else snapBack()
    }
    resetGesture()
  }

  const dragStyle: CSSProperties | undefined =
    dragOffset <= 0
      ? undefined
      : {
          transform: `translate3d(0, -${dragOffset}px, 0)`,
          opacity: String(Math.max(0, 1 - dragOffset / FADE_DISTANCE_PX)),
          transition: transitionEnabled
            ? `transform ${ANIMATION_MS}ms cubic-bezier(0.33, 1, 0.68, 1), opacity ${ANIMATION_MS}ms ease-out`
            : 'none',
        }

  return {
    dragStyle,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  }
}
