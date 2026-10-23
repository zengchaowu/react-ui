import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import type { CwDynamicSheetDirection } from './types'

const DISMISS_RATIO = 0.28
const DISMISS_MIN_PX = 72
const SNAP_BACK_MS = 280

function getDismissDelta(
  direction: CwDynamicSheetDirection,
  startX: number,
  startY: number,
  clientX: number,
  clientY: number,
): number {
  const dx = clientX - startX
  const dy = clientY - startY
  switch (direction) {
    case 'bottom':
      return dy > 0 ? dy : 0
    case 'top':
      return dy < 0 ? -dy : 0
    case 'left':
      return dx < 0 ? -dx : 0
    case 'right':
      return dx > 0 ? dx : 0
    default:
      return 0
  }
}

function isVerticalDirection(direction: CwDynamicSheetDirection): boolean {
  return direction === 'bottom' || direction === 'top'
}

function buildTransform(direction: CwDynamicSheetDirection, offset: number): string {
  if (offset <= 0) return ''
  switch (direction) {
    case 'bottom':
      return `translate3d(0, ${offset}px, 0)`
    case 'top':
      return `translate3d(0, -${offset}px, 0)`
    case 'left':
      return `translate3d(-${offset}px, 0, 0)`
    case 'right':
      return `translate3d(${offset}px, 0, 0)`
    default:
      return ''
  }
}

export interface UseCwDynamicSheetDragOptions {
  sheetRef: RefObject<HTMLElement | null>
  bodyRef: RefObject<HTMLElement | null>
  dragHandleRef: RefObject<HTMLElement | null>
  headerRef: RefObject<HTMLElement | null>
  direction: CwDynamicSheetDirection
  enabled: boolean
  isVisible: boolean
  onClose: () => void
}

export interface UseCwDynamicSheetDragResult {
  dragOffset: number
  isDragging: boolean
  sheetTransformStyle: CSSProperties | undefined
  backdropDragStyle: CSSProperties | undefined
}

export function useCwDynamicSheetDrag(
  options: UseCwDynamicSheetDragOptions,
): UseCwDynamicSheetDragResult {
  const { sheetRef, bodyRef, dragHandleRef, headerRef, direction, enabled, isVisible } =
    options

  const optionsRef = useRef(options)
  optionsRef.current = options

  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [transitionEnabled, setTransitionEnabled] = useState(false)
  const [sheetSize, setSheetSize] = useState(0)

  const sheetTransformStyle = useMemo<CSSProperties | undefined>(() => {
    if (!enabled || dragOffset <= 0) return undefined
    return {
      transform: buildTransform(direction, dragOffset),
      transition: transitionEnabled
        ? `transform ${SNAP_BACK_MS}ms cubic-bezier(0.33, 1, 0.68, 1)`
        : 'none',
    }
  }, [enabled, direction, dragOffset, transitionEnabled])

  const backdropDragStyle = useMemo<CSSProperties | undefined>(() => {
    if (!enabled || dragOffset <= 0) return undefined
    if (sheetSize <= 0) return undefined
    const progress = Math.min(1, dragOffset / sheetSize)
    return {
      opacity: String(Math.max(0, 1 - progress * 0.65)),
    }
  }, [enabled, dragOffset, sheetSize])

  // 重新打开时重置拖拽状态
  useEffect(() => {
    if (!isVisible) return
    setDragOffset(0)
    setTransitionEnabled(false)
  }, [isVisible])

  useEffect(() => {
    const el = sheetRef.current
    if (!el || !enabled || !isVisible) return
    const sheetEl: HTMLElement = el

    let pointerId: number | null = null
    let startX = 0
    let startY = 0
    let decided = false
    let dragActive = false
    let gestureSheetSize = 0
    let startedOnHandleOrHeader = false
    let isAnimatingDismiss = false
    let offset = 0

    const timers = new Set<ReturnType<typeof setTimeout>>()

    const schedule = (run: () => void, delay: number): void => {
      const timer = setTimeout(() => {
        timers.delete(timer)
        run()
      }, delay)
      timers.add(timer)
    }

    const measureSheetSize = (): number => {
      const node = optionsRef.current.sheetRef.current
      if (!node) return 0
      return isVerticalDirection(optionsRef.current.direction)
        ? node.offsetHeight
        : node.offsetWidth
    }

    const isInDragZone = (target: EventTarget | null): boolean => {
      if (!(target instanceof Node)) return false
      const handle = optionsRef.current.dragHandleRef.current
      const header = optionsRef.current.headerRef.current
      return Boolean(
        (handle && handle.contains(target)) || (header && header.contains(target)),
      )
    }

    const canStartDragFromContent = (): boolean => {
      const body = optionsRef.current.bodyRef.current
      if (!body) return true
      return body.scrollTop <= 0
    }

    const cleanupPointerListeners = (): void => {
      const node = optionsRef.current.sheetRef.current
      if (!node) return
      node.removeEventListener('pointermove', onPointerMove)
      node.removeEventListener('pointerup', onPointerUp)
      node.removeEventListener('pointercancel', onPointerUp)
    }

    const resetGestureState = (): void => {
      pointerId = null
      decided = false
      dragActive = false
      setIsDragging(false)
      startedOnHandleOrHeader = false
      cleanupPointerListeners()
    }

    const snapBack = (): void => {
      setTransitionEnabled(true)
      offset = 0
      setDragOffset(0)
      schedule(() => {
        setTransitionEnabled(false)
      }, SNAP_BACK_MS)
    }

    const dismissWithAnimation = (): void => {
      if (isAnimatingDismiss) return
      isAnimatingDismiss = true
      setTransitionEnabled(true)
      gestureSheetSize = measureSheetSize() || gestureSheetSize
      offset = gestureSheetSize
      setSheetSize(gestureSheetSize)
      setDragOffset(gestureSheetSize)
      schedule(() => {
        optionsRef.current.onClose()
        isAnimatingDismiss = false
        setTransitionEnabled(false)
      }, SNAP_BACK_MS)
    }

    function onPointerMove(e: PointerEvent): void {
      if (pointerId !== e.pointerId || !optionsRef.current.enabled) return

      const delta = getDismissDelta(
        optionsRef.current.direction,
        startX,
        startY,
        e.clientX,
        e.clientY,
      )
      const dx = e.clientX - startX
      const dy = e.clientY - startY

      if (!decided) {
        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)
        if (absDx < 6 && absDy < 6) return

        decided = true
        if (delta <= 0) {
          resetGestureState()
          return
        }

        if (startedOnHandleOrHeader || canStartDragFromContent()) {
          dragActive = true
          setIsDragging(true)
          gestureSheetSize = measureSheetSize()
          setSheetSize(gestureSheetSize)
          optionsRef.current.sheetRef.current?.setPointerCapture(e.pointerId)
        } else {
          resetGestureState()
          return
        }
      }

      if (!dragActive) return

      e.preventDefault()
      offset = delta
      setDragOffset(delta)
    }

    function onPointerUp(e: PointerEvent): void {
      if (pointerId !== e.pointerId) return

      const node = optionsRef.current.sheetRef.current
      if (node?.hasPointerCapture(e.pointerId)) {
        node.releasePointerCapture(e.pointerId)
      }

      if (dragActive) {
        const threshold = Math.max(
          DISMISS_MIN_PX,
          (gestureSheetSize || measureSheetSize()) * DISMISS_RATIO,
        )
        if (offset >= threshold) {
          dismissWithAnimation()
        } else {
          snapBack()
        }
      }

      resetGestureState()
    }

    function onPointerDown(e: PointerEvent): void {
      if (
        !optionsRef.current.enabled ||
        !optionsRef.current.isVisible ||
        isAnimatingDismiss ||
        e.button !== 0
      ) {
        return
      }

      pointerId = e.pointerId
      startX = e.clientX
      startY = e.clientY
      decided = false
      dragActive = false
      setTransitionEnabled(false)
      startedOnHandleOrHeader = isInDragZone(e.target)
      gestureSheetSize = measureSheetSize()

      sheetEl.addEventListener('pointermove', onPointerMove)
      sheetEl.addEventListener('pointerup', onPointerUp)
      sheetEl.addEventListener('pointercancel', onPointerUp)
    }

    sheetEl.addEventListener('pointerdown', onPointerDown)

    return () => {
      sheetEl.removeEventListener('pointerdown', onPointerDown)
      cleanupPointerListeners()
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [bodyRef, dragHandleRef, enabled, headerRef, isVisible, sheetRef])

  return {
    dragOffset,
    isDragging,
    sheetTransformStyle,
    backdropDragStyle,
  }
}
