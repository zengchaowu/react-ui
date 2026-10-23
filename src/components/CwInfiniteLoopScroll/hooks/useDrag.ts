import { useCallback, useEffect, useRef } from 'react'
import { calculateVelocity, updateVelocityHistory } from '../functions'
import {
  createSyntheticClickSuppressor,
  isEventFromZoomedImagePreview,
} from './gestureUtils'

export type DragScrollNormalize = (top: number, left: number) => { top: number; left: number }

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

type TouchState = GestureScrollState & { isMoving: boolean }
type MouseState = GestureScrollState & { isDragging: boolean }

const emptyVelocityHistory = () => [] as Array<{ time: number; deltaY: number; deltaX: number }>

/**
 * 拖拽 Hook（触摸和鼠标）
 * 支持可选的分页对齐功能
 */
export function useDrag(options: {
  scrollTopRef: { current: number }
  scrollLeftRef: { current: number }
  direction: 'vertical' | 'horizontal' | 'both'
  disabled: boolean
  readonly: boolean
  enableMomentum: boolean
  updateScrollPositionDirect: (top: number, left: number, callback?: () => void) => void
  stopMomentum: () => void
  startMomentum: (velocityY: number, velocityX: number) => void
  snapToPage: boolean
  snapByDrag: (
    startTop: number,
    startLeft: number,
    currentTop: number,
    currentLeft: number,
  ) => { top: number; left: number }
  smoothSnapToPage: (top: number, left: number) => void
  onScroll: (top: number, left: number, dragMeta?: DragScrollMeta) => void
  normalizeScroll?: DragScrollNormalize
  stopSnapAnimation: () => void
}) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const clickSuppressorRef = useRef(createSyntheticClickSuppressor())

  const touchStateRef = useRef<TouchState>({
    startY: 0,
    startX: 0,
    startScrollTop: 0,
    startScrollLeft: 0,
    isMoving: false,
    velocityHistory: [],
  })

  const mouseStateRef = useRef<MouseState>({
    startY: 0,
    startX: 0,
    startScrollTop: 0,
    startScrollLeft: 0,
    isDragging: false,
    velocityHistory: [],
  })

  const applyNormalizedScroll = (
    state: { startScrollTop: number; startScrollLeft: number },
    top: number,
    left: number,
  ) => {
    const normalizeScroll = optionsRef.current.normalizeScroll
    if (!normalizeScroll) return { top, left }
    const next = normalizeScroll(top, left)
    const jumpTop = next.top - top
    const jumpLeft = next.left - left
    if (jumpTop !== 0) state.startScrollTop += jumpTop
    if (jumpLeft !== 0) state.startScrollLeft += jumpLeft
    return next
  }

  const applyPointerDelta = (
    state: GestureScrollState,
    deltaX: number,
    deltaY: number,
  ) => {
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

    let newScrollTop =
      current.direction === 'horizontal'
        ? current.scrollTopRef.current
        : state.startScrollTop + deltaY
    let newScrollLeft =
      current.direction === 'vertical'
        ? current.scrollLeftRef.current
        : state.startScrollLeft + deltaX

    const normalized = applyNormalizedScroll(state, newScrollTop, newScrollLeft)
    newScrollTop = normalized.top
    newScrollLeft = normalized.left

    current.updateScrollPositionDirect(newScrollTop, newScrollLeft, () => {
      optionsRef.current.onScroll(
        optionsRef.current.scrollTopRef.current,
        optionsRef.current.scrollLeftRef.current,
        {
          top: state.startScrollTop,
          left: state.startScrollLeft,
          commit: false,
        },
      )
    })
  }

  const finishSnapOrMomentum = (
    startTop: number,
    startLeft: number,
    velocityHistory: Array<{ time: number; deltaY: number; deltaX: number }>,
    allowMomentum: boolean,
  ) => {
    const current = optionsRef.current

    if (current.snapToPage) {
      const snapped = current.snapByDrag(
        startTop,
        startLeft,
        current.scrollTopRef.current,
        current.scrollLeftRef.current,
      )
      current.onScroll(current.scrollTopRef.current, current.scrollLeftRef.current, {
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
  }

  const beginGesture = () => {
    const current = optionsRef.current
    current.stopMomentum()
    current.stopSnapAnimation()
    clickSuppressorRef.current.reset()
  }

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const current = optionsRef.current
    if (current.disabled || current.readonly) return
    if (isEventFromZoomedImagePreview(event)) return
    if (event.touches.length >= 2) return
    if (!event.touches[0]) return
    beginGesture()
    const touch = event.touches[0]
    touchStateRef.current = {
      startY: touch.clientY,
      startX: touch.clientX,
      startScrollTop: current.scrollTopRef.current,
      startScrollLeft: current.scrollLeftRef.current,
      isMoving: false,
      velocityHistory: [],
    }
  }, [])

  const handleTouchMove = useCallback((event: TouchEvent) => {
    const current = optionsRef.current
    if (current.disabled || current.readonly) return
    if (isEventFromZoomedImagePreview(event)) return
    if (event.touches.length >= 2) return
    if (!event.touches[0]) return

    const touchState = touchStateRef.current
    if (!touchState.isMoving && touchState.startY === 0 && touchState.startX === 0) {
      const touch = event.touches[0]
      touchStateRef.current = {
        startY: touch.clientY,
        startX: touch.clientX,
        startScrollTop: current.scrollTopRef.current,
        startScrollLeft: current.scrollLeftRef.current,
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
  }, [])

  const handleTouchEnd = useCallback(() => {
    const state = touchStateRef.current
    finishSnapOrMomentum(state.startScrollTop, state.startScrollLeft, state.velocityHistory, state.isMoving)
    clickSuppressorRef.current.suppressAfterDrag()
    touchStateRef.current = {
      startY: 0,
      startX: 0,
      startScrollTop: 0,
      startScrollLeft: 0,
      isMoving: false,
      velocityHistory: [],
    }
  }, [])

  const handleGlobalMouseMove = useCallback((event: MouseEvent) => {
    const state = mouseStateRef.current
    if (!state.isDragging) return
    event.preventDefault()
    applyPointerDelta(state, state.startX - event.clientX, state.startY - event.clientY)
  }, [])

  const handleGlobalMouseUp = useCallback(() => {
    const state = mouseStateRef.current
    if (!state.isDragging) return

    finishSnapOrMomentum(
      state.startScrollTop,
      state.startScrollLeft,
      state.velocityHistory,
      true,
    )
    clickSuppressorRef.current.suppressAfterDrag()

    mouseStateRef.current = {
      startY: 0,
      startX: 0,
      startScrollTop: 0,
      startScrollLeft: 0,
      isDragging: false,
      velocityHistory: emptyVelocityHistory(),
    }
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [])

  const handleMouseDown = useCallback((event: MouseEvent) => {
    const current = optionsRef.current
    if (current.disabled || current.readonly) return
    if (isEventFromZoomedImagePreview(event)) return
    event.preventDefault()
    beginGesture()
    mouseStateRef.current = {
      startY: event.clientY,
      startX: event.clientX,
      startScrollTop: current.scrollTopRef.current,
      startScrollLeft: current.scrollLeftRef.current,
      isDragging: true,
      velocityHistory: [],
    }

    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
  }, [])

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
    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      clickSuppressorRef.current.dispose()
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [handleGlobalMouseMove, handleGlobalMouseUp])

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
