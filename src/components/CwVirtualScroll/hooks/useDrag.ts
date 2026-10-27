import { useCallback, useEffect, useRef } from 'react'
import { calculateVelocity, updateVelocityHistory } from '../functions'
import { isEventFromZoomedImagePreview } from './imagePreviewGesture'
import { createSyntheticClickSuppressor } from '@zengchaowu/ui-shared/components/CwVirtualScroll/hooks/suppressSyntheticClickAfterDrag'
import type { UpdateScrollPositionDirect } from './useMomentum'

export type DragScrollNormalize = (
  top: number,
  left: number,
) => { top: number; left: number }

export type DragScrollMeta = {
  top: number
  left: number
  commit?: boolean
  commitTop?: number
  commitLeft?: number
}

type GestureScrollState = {
  startY: number
  startX: number
  startScrollTop: number
  startScrollLeft: number
  velocityHistory: Array<{ time: number; deltaY: number; deltaX: number }>
}

interface UseDragOptions {
  getScroll: () => { scrollTop: number; scrollLeft: number }
  direction: 'vertical' | 'horizontal' | 'both'
  disabled: boolean
  readonly: boolean
  enableMomentum: boolean
  updateScrollPositionDirect: UpdateScrollPositionDirect
  stopMomentum: () => void
  startMomentum: (velocityY: number, velocityX: number) => void
  snapToPage?: boolean
  snapToNearestPage?: (
    startTop: number,
    startLeft: number,
    currentTop: number,
    currentLeft: number,
  ) => { top: number; left: number }
  smoothSnapToPage?: (top: number, left: number) => void
  onScroll?: (top: number, left: number, dragMeta?: DragScrollMeta) => void
  normalizeScroll?: DragScrollNormalize
  onGestureStart?: () => void
}

/**
 * 拖拽 Hook（React 版，触摸和鼠标）
 * 支持可选的分页对齐功能
 */
export function useDrag(options: UseDragOptions) {
  const optionsRef = useRef(options)
  const clickSuppressorRef = useRef(createSyntheticClickSuppressor())

  const touchStateRef = useRef({
    startY: 0,
    startX: 0,
    startScrollTop: 0,
    startScrollLeft: 0,
    isMoving: false,
    velocityHistory: [] as Array<{ time: number; deltaY: number; deltaX: number }>,
  })

  const mouseStateRef = useRef({
    startY: 0,
    startX: 0,
    startScrollTop: 0,
    startScrollLeft: 0,
    isDragging: false,
    velocityHistory: [] as Array<{ time: number; deltaY: number; deltaX: number }>,
  })

  useEffect(() => {
    optionsRef.current = options
  })

  const applyNormalizedScroll = useCallback(
    (state: { startScrollTop: number; startScrollLeft: number }, top: number, left: number) => {
      const normalizeScroll = optionsRef.current.normalizeScroll
      if (!normalizeScroll) return { top, left }
      const next = normalizeScroll(top, left)
      const jumpTop = next.top - top
      const jumpLeft = next.left - left
      if (jumpTop !== 0) state.startScrollTop += jumpTop
      if (jumpLeft !== 0) state.startScrollLeft += jumpLeft
      return next
    },
    [],
  )

  const applyPointerDelta = useCallback(
    (state: GestureScrollState, deltaX: number, deltaY: number) => {
      const current = optionsRef.current
      clickSuppressorRef.current.noteDelta(deltaX, deltaY)

      if (current.enableMomentum) {
        updateVelocityHistory(
          state.velocityHistory,
          Date.now(),
          state.startScrollTop + deltaY,
          state.startScrollLeft + deltaX,
        )
      }

      const { scrollTop, scrollLeft } = current.getScroll()
      let newScrollTop = current.direction === 'horizontal' ? scrollTop : state.startScrollTop + deltaY
      let newScrollLeft = current.direction === 'vertical' ? scrollLeft : state.startScrollLeft + deltaX

      ;({ top: newScrollTop, left: newScrollLeft } = applyNormalizedScroll(
        state,
        newScrollTop,
        newScrollLeft,
      ))

      current.updateScrollPositionDirect(newScrollTop, newScrollLeft, () => {
        const latest = current.getScroll()
        current.onScroll?.(latest.scrollTop, latest.scrollLeft, {
          top: state.startScrollTop,
          left: state.startScrollLeft,
          commit: false,
        })
      })
    },
    [applyNormalizedScroll],
  )

  const finishSnapOrMomentum = useCallback(
    (
      startTop: number,
      startLeft: number,
      velocityHistory: Array<{ time: number; deltaY: number; deltaX: number }>,
      allowMomentum: boolean,
    ) => {
      const current = optionsRef.current
      const { scrollTop, scrollLeft } = current.getScroll()
      if (current.snapToPage && current.snapToNearestPage && current.smoothSnapToPage) {
        const snapped = current.snapToNearestPage(startTop, startLeft, scrollTop, scrollLeft)
        current.onScroll?.(scrollTop, scrollLeft, {
          top: startTop,
          left: startLeft,
          commit: true,
          commitTop: snapped.top,
          commitLeft: snapped.left,
        })
        current.smoothSnapToPage(snapped.top, snapped.left)
        return
      }

      if (allowMomentum && current.enableMomentum && velocityHistory.length >= 2) {
        const { velocityY, velocityX } = calculateVelocity(velocityHistory)
        if (Math.abs(velocityY) > 0.5 || Math.abs(velocityX) > 0.5) {
          current.startMomentum(velocityY, velocityX)
        }
      }
    },
    [],
  )

  const beginGesture = useCallback(() => {
    const current = optionsRef.current
    current.stopMomentum()
    current.onGestureStart?.()
    clickSuppressorRef.current.reset()
  }, [])

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      const current = optionsRef.current
      if (current.disabled || current.readonly) return
      if (isEventFromZoomedImagePreview(event)) return
      if (event.touches.length >= 2) return
      if (!event.touches[0]) return
      beginGesture()
      const touch = event.touches[0]
      const { scrollTop, scrollLeft } = current.getScroll()
      touchStateRef.current = {
        startY: touch.clientY,
        startX: touch.clientX,
        startScrollTop: scrollTop,
        startScrollLeft: scrollLeft,
        isMoving: false,
        velocityHistory: [],
      }
    },
    [beginGesture],
  )

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      const current = optionsRef.current
      if (current.disabled || current.readonly) return
      if (isEventFromZoomedImagePreview(event)) return
      if (event.touches.length >= 2) return
      if (!event.touches[0]) return
      const touchState = touchStateRef.current
      if (!touchState.isMoving && touchState.startY === 0 && touchState.startX === 0) {
        const touch = event.touches[0]
        const { scrollTop, scrollLeft } = current.getScroll()
        touchStateRef.current = {
          startY: touch.clientY,
          startX: touch.clientX,
          startScrollTop: scrollTop,
          startScrollLeft: scrollLeft,
          isMoving: false,
          velocityHistory: [],
        }
      }
      event.preventDefault()

      if (!touchStateRef.current.isMoving) {
        touchStateRef.current.isMoving = true
        current.stopMomentum()
      }

      const touch = event.touches[0]
      applyPointerDelta(
        touchStateRef.current,
        touchStateRef.current.startX - touch.clientX,
        touchStateRef.current.startY - touch.clientY,
      )
    },
    [applyPointerDelta],
  )

  const handleTouchEnd = useCallback(() => {
    finishSnapOrMomentum(
      touchStateRef.current.startScrollTop,
      touchStateRef.current.startScrollLeft,
      touchStateRef.current.velocityHistory,
      touchStateRef.current.isMoving,
    )
    clickSuppressorRef.current.suppressAfterDrag()
    touchStateRef.current = {
      startY: 0,
      startX: 0,
      startScrollTop: 0,
      startScrollLeft: 0,
      isMoving: false,
      velocityHistory: [],
    }
  }, [finishSnapOrMomentum])

  const handleGlobalMouseMoveRef = useRef<((event: MouseEvent) => void) | null>(null)
  const handleGlobalMouseUpRef = useRef<(() => void) | null>(null)

  const handleGlobalMouseMove = useCallback(
    (event: MouseEvent) => {
      const mouseState = mouseStateRef.current
      if (!mouseState.isDragging) return
      event.preventDefault()
      applyPointerDelta(
        mouseState,
        mouseState.startX - event.clientX,
        mouseState.startY - event.clientY,
      )
    },
    [applyPointerDelta],
  )

  const handleGlobalMouseUp = useCallback(() => {
    const mouseState = mouseStateRef.current
    if (!mouseState.isDragging) return

    finishSnapOrMomentum(
      mouseState.startScrollTop,
      mouseState.startScrollLeft,
      mouseState.velocityHistory,
      true,
    )
    clickSuppressorRef.current.suppressAfterDrag()

    mouseStateRef.current = {
      startY: 0,
      startX: 0,
      startScrollTop: 0,
      startScrollLeft: 0,
      isDragging: false,
      velocityHistory: [],
    }
    if (handleGlobalMouseMoveRef.current) {
      document.removeEventListener('mousemove', handleGlobalMouseMoveRef.current)
    }
    if (handleGlobalMouseUpRef.current) {
      document.removeEventListener('mouseup', handleGlobalMouseUpRef.current)
    }
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [finishSnapOrMomentum])

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      const current = optionsRef.current
      if (current.disabled || current.readonly) return
      if (isEventFromZoomedImagePreview(event)) return
      event.preventDefault()
      beginGesture()
      const { scrollTop, scrollLeft } = current.getScroll()
      mouseStateRef.current = {
        startY: event.clientY,
        startX: event.clientX,
        startScrollTop: scrollTop,
        startScrollLeft: scrollLeft,
        isDragging: true,
        velocityHistory: [],
      }

      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'grabbing'
      handleGlobalMouseMoveRef.current = handleGlobalMouseMove
      handleGlobalMouseUpRef.current = handleGlobalMouseUp
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    },
    [beginGesture, handleGlobalMouseMove, handleGlobalMouseUp],
  )

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (mouseStateRef.current.isDragging) event.preventDefault()
  }, [])

  const handleMouseUp = useCallback(() => {
    handleGlobalMouseUp()
  }, [handleGlobalMouseUp])

  const handleMouseLeave = useCallback(() => {
    // 全局监听继续工作
  }, [])

  useEffect(() => {
    const suppressor = clickSuppressorRef.current
    return () => {
      if (handleGlobalMouseMoveRef.current) {
        document.removeEventListener('mousemove', handleGlobalMouseMoveRef.current)
      }
      if (handleGlobalMouseUpRef.current) {
        document.removeEventListener('mouseup', handleGlobalMouseUpRef.current)
      }
      suppressor.dispose()
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [])

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  }
}
