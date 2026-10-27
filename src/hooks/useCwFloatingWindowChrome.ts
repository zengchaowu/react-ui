import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import {
  applyFloatingWindowResize,
  clampFloatingWindowBounds,
  type FloatingWindowBounds,
  type FloatingWindowClampConstraints,
  type FloatingWindowResizeEdge,
} from '@zengchaowu/shared/functions/ui/floatingWindowGeometry'
import { isCwWindowTitleBarDragTarget } from '@zengchaowu/ui-shared/components/CwWindowTitleBar/dragTarget'

export type {
  FloatingWindowBounds,
  FloatingWindowClampConstraints,
  FloatingWindowResizeEdge,
}

export interface UseCwFloatingWindowChromeOptions {
  bounds: FloatingWindowBounds
  mode: 'normal' | 'minimized' | 'maximized'
  onFocus?: () => void
  onBoundsChange: (next: FloatingWindowBounds) => void
  getConstraints: () => FloatingWindowClampConstraints
  /** 拖拽 / 缩放时挂到 document.body 的 class */
  gestureBodyClass?: string
}

interface ActiveGesture {
  kind: 'drag' | 'resize'
  edge?: FloatingWindowResizeEdge
  pointerId: number
  startX: number
  startY: number
  startBounds: FloatingWindowBounds
}

export function useCwFloatingWindowChrome(options: UseCwFloatingWindowChromeOptions) {
  const gestureBodyClass = options.gestureBodyClass ?? 'cw-floating-window-gesture'
  const optionsRef = useRef(options)
  optionsRef.current = options

  const [gestureActive, setGestureActive] = useState(false)
  const gestureRef = useRef<ActiveGesture | null>(null)

  const releasePointerCapture = (pointerId: number) => {
    try {
      if (document.body.hasPointerCapture(pointerId)) {
        document.body.releasePointerCapture(pointerId)
      }
    } catch {
      /* ignore */
    }
  }

  const clearGesture = useCallback(() => {
    const pointerId = gestureRef.current?.pointerId
    if (pointerId != null) releasePointerCapture(pointerId)
    gestureRef.current = null
    setGestureActive(false)
    document.body.classList.remove(gestureBodyClass)
    document.removeEventListener('pointermove', handleDocumentPointerMove)
    document.removeEventListener('pointerup', handleDocumentPointerUp)
    document.removeEventListener('pointercancel', handleDocumentPointerUp)
  }, [gestureBodyClass])

  function handleDocumentPointerMove(event: PointerEvent) {
    const gesture = gestureRef.current
    if (!gesture || event.pointerId !== gesture.pointerId) return

    event.preventDefault()

    const dx = event.clientX - gesture.startX
    const dy = event.clientY - gesture.startY
    const constraints = optionsRef.current.getConstraints()

    if (gesture.kind === 'drag') {
      optionsRef.current.onBoundsChange(
        clampFloatingWindowBounds(
          {
            ...gesture.startBounds,
            x: gesture.startBounds.x + dx,
            y: gesture.startBounds.y + dy,
          },
          constraints,
        ),
      )
      return
    }

    optionsRef.current.onBoundsChange(
      applyFloatingWindowResize(gesture.startBounds, gesture.edge!, dx, dy, constraints),
    )
  }

  function handleDocumentPointerUp(event: PointerEvent) {
    const gesture = gestureRef.current
    if (!gesture || event.pointerId !== gesture.pointerId) return
    clearGesture()
  }

  function beginGesture(
    gesture: Omit<ActiveGesture, 'startBounds' | 'startX' | 'startY'>,
    event: PointerEvent,
  ) {
    const current = optionsRef.current
    if (current.mode !== 'normal' || event.button !== 0) return

    event.preventDefault()
    event.stopPropagation()
    current.onFocus?.()

    try {
      document.body.setPointerCapture(event.pointerId)
    } catch {
      /* ignore */
    }

    document.body.classList.add(gestureBodyClass)
    setGestureActive(true)
    gestureRef.current = {
      ...gesture,
      startX: event.clientX,
      startY: event.clientY,
      startBounds: { ...current.bounds },
    }

    document.addEventListener('pointermove', handleDocumentPointerMove, { passive: false })
    document.addEventListener('pointerup', handleDocumentPointerUp)
    document.addEventListener('pointercancel', handleDocumentPointerUp)
  }

  const onTitlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isCwWindowTitleBarDragTarget(event.target)) return
    beginGesture({ kind: 'drag', pointerId: event.nativeEvent.pointerId }, event.nativeEvent)
  }

  const onResizePointerDown = (edge: FloatingWindowResizeEdge, event: PointerEvent) => {
    beginGesture({ kind: 'resize', edge, pointerId: event.pointerId }, event)
  }

  const beginExternalDrag = (pointerId: number, clientX: number, clientY: number) => {
    const current = optionsRef.current
    if (current.mode !== 'normal') return

    current.onFocus?.()
    document.body.classList.add(gestureBodyClass)
    setGestureActive(true)
    gestureRef.current = {
      kind: 'drag',
      pointerId,
      startX: clientX,
      startY: clientY,
      startBounds: { ...current.bounds },
    }
  }

  const updateExternalDrag = (pointerId: number, clientX: number, clientY: number) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.kind !== 'drag' || gesture.pointerId !== pointerId) return

    const dx = clientX - gesture.startX
    const dy = clientY - gesture.startY
    optionsRef.current.onBoundsChange(
      clampFloatingWindowBounds(
        {
          ...gesture.startBounds,
          x: gesture.startBounds.x + dx,
          y: gesture.startBounds.y + dy,
        },
        optionsRef.current.getConstraints(),
      ),
    )
  }

  const endExternalDrag = (pointerId: number) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== pointerId) return
    clearGesture()
  }

  useEffect(() => {
    return () => {
      clearGesture()
    }
  }, [clearGesture])

  return {
    gestureActive,
    onTitlePointerDown,
    onResizePointerDown,
    beginExternalDrag,
    updateExternalDrag,
    endExternalDrag,
  }
}
