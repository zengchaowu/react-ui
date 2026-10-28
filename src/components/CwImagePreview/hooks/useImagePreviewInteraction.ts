import { useEffect, useRef, useState } from 'react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
} from 'react'
import type {
  CwImagePreviewEmitHandlers,
  CwImagePreviewProps,
  ImagePreviewTransform,
} from '../types'
import {
  clampScaleByProps,
  computeAnchorZoomOffset,
  GESTURE_CLICK_SUPPRESS_MS,
  getAngle,
  getDistance,
  getWheelZoomDelta,
  isDragThresholdExceeded,
  isImagePreviewScaledForPan,
  isTransformDeviatedFromInitial,
  normalizeRotation,
} from '@zengchaowu/ui-shared/components/CwImagePreview/functions'
import type { TouchPoint } from '@zengchaowu/ui-shared/components/CwImagePreview/functions'
import { useBrowserFocusVisible } from '../../../hooks/useBrowserFocusVisible'

export function useImagePreviewInteraction(
  props: CwImagePreviewProps,
  emit: CwImagePreviewEmitHandlers,
) {
  // Focus 状态 - 使用 useBrowserFocusVisible 来区分键盘导航和鼠标点击
  const {
    isFocusVisible,
    handleFocus: handleFocusVisibleFocus,
    handleBlur: handleFocusVisibleBlur,
  } = useBrowserFocusVisible()

  const tabindex = props.disabled ? undefined : 0

  const [transform, setTransformState] = useState<ImagePreviewTransform>(
    () => ({
      scale: props.initialScale ?? 1,
      rotation: props.initialRotation ?? 0,
      offsetX: 0,
      offsetY: 0,
    }),
  )
  const transformRef = useRef(transform)
  const setTransform = (next: ImagePreviewTransform) => {
    transformRef.current = next
    setTransformState(next)
  }

  const imageTransform = {
    scale: transform.scale,
    x: transform.offsetX,
    y: transform.offsetY,
    rotation: transform.rotation,
  }

  const resetTransform = () => {
    if (props.disabled) return
    applyInitialTransform(true)
  }

  function applyInitialTransform(emitUpdates: boolean) {
    const next: ImagePreviewTransform = {
      scale: props.initialScale ?? 1,
      rotation: props.initialRotation ?? 0,
      offsetX: 0,
      offsetY: 0,
    }
    setTransform(next)
    if (!emitUpdates || props.disabled) return
    emit.onUpdateScale?.(next.scale)
    emit.onUpdateRotation?.(normalizeRotation(next.rotation))
    emit.onUpdateOffset?.({ x: next.offsetX, y: next.offsetY })
  }

  const prevActiveRef = useRef(props.active)
  useEffect(() => {
    const prev = prevActiveRef.current
    prevActiveRef.current = props.active
    if (props.active === undefined) return
    if (prev === undefined && props.active === true) return
    if (prev === props.active) return
    applyInitialTransform(true)
  }, [props.active])

  const prevSrcRef = useRef(props.src)
  useEffect(() => {
    if (prevSrcRef.current === props.src) return
    prevSrcRef.current = props.src
    applyInitialTransform(true)
  }, [props.src])

  const setScale = (next: number) => {
    if (props.disabled) return
    const clamped = clampScaleByProps(next, props)
    if (clamped !== transformRef.current.scale) {
      setTransform({ ...transformRef.current, scale: clamped })
      emit.onUpdateScale?.(clamped)
    }
  }

  const zoomBy = (delta: number) => {
    if (props.disabled) return
    setScale(transformRef.current.scale + delta)
  }

  const rotateBy = (delta: number) => {
    if (props.disabled) return
    const rotation = normalizeRotation(transformRef.current.rotation + delta)
    setTransform({ ...transformRef.current, rotation })
    emit.onUpdateRotation?.(rotation)
  }

  const setOffset = (x: number, y: number) => {
    if (props.disabled) return
    setTransform({ ...transformRef.current, offsetX: x, offsetY: y })
    emit.onUpdateOffset?.({ x, y })
  }

  // Focus 处理 - 只在键盘导航时显示 focus 样式
  const handleFocus = () => {
    if (props.disabled) return
    handleFocusVisibleFocus()
  }

  const handleBlur = () => {
    handleFocusVisibleBlur()
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (props.disabled) return

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        resetTransform()
        break
      case 'ArrowUp':
        event.preventDefault()
        zoomBy(0.1)
        break
      case 'ArrowDown':
        event.preventDefault()
        zoomBy(-0.1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        rotateBy(-15)
        break
      case 'ArrowRight':
        event.preventDefault()
        rotateBy(15)
        break
      case 'Home':
      case 'Escape':
        event.preventDefault()
        resetTransform()
        break
    }
  }

  const handleLoad = (event: Event) => {
    emit.onLoad?.(event)
  }

  const handleError = (event: Event) => {
    emit.onError?.(event)
  }

  const isDraggingRef = useRef(false)
  /** 本次按下是否产生过有效位移（纯点击/双击不应触发手势 click 抑制） */
  const pointerDragMovedRef = useRef(false)
  const lastPointerXRef = useRef(0)
  const lastPointerYRef = useRef(0)
  const suppressSyntheticClickUntilRef = useRef(0)
  const touchModeRef = useRef<'none' | 'drag' | 'pinch'>('none')
  const touchDragMovedRef = useRef(false)
  const initialPinchDistanceRef = useRef(0)
  const initialScaleRef = useRef(transform.scale)
  const initialRotationRef = useRef(transform.rotation)
  const initialAngleRef = useRef(0)

  function shouldSuppressSyntheticClick(): boolean {
    return Date.now() < suppressSyntheticClickUntilRef.current
  }

  function markGestureEnded() {
    suppressSyntheticClickUntilRef.current = Date.now() + GESTURE_CLICK_SUPPRESS_MS
  }

  function beginPinchGesture(touches: ArrayLike<TouchPoint>) {
    if (touches.length < 2) return
    touchModeRef.current = 'pinch'
    initialPinchDistanceRef.current = getDistance(touches[0], touches[1])
    initialScaleRef.current = transformRef.current.scale
    initialRotationRef.current = transformRef.current.rotation
    initialAngleRef.current = getAngle(touches[0], touches[1])
  }

  const handlePointerDown = (event: ReactMouseEvent<HTMLElement>) => {
    if (!props.enableDrag || props.disabled) return
    if (
      !isImagePreviewScaledForPan(transformRef.current.scale, props) &&
      !props.allowDragWhenNotScaled
    )
      return
    if (event.button !== 0) return
    event.stopPropagation()
    pointerDragMovedRef.current = false
    isDraggingRef.current = true
    lastPointerXRef.current = event.clientX
    lastPointerYRef.current = event.clientY
  }

  const handlePointerMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (!isDraggingRef.current || props.disabled) return
    event.stopPropagation()
    event.preventDefault()
    const dx = event.clientX - lastPointerXRef.current
    const dy = event.clientY - lastPointerYRef.current
    if (isDragThresholdExceeded(dx, dy)) {
      pointerDragMovedRef.current = true
    }
    lastPointerXRef.current = event.clientX
    lastPointerYRef.current = event.clientY
    setOffset(
      transformRef.current.offsetX + dx,
      transformRef.current.offsetY + dy,
    )
  }

  const handlePointerUp = () => {
    if (isDraggingRef.current && pointerDragMovedRef.current) {
      markGestureEnded()
    }
    isDraggingRef.current = false
    pointerDragMovedRef.current = false
  }

  const handleWheel = (event: WheelEvent) => {
    if (!props.enableWheelZoom || props.disabled) return

    // 滚轮缩放一律拦截，避免冒泡到外层滚动容器
    event.stopPropagation()
    event.preventDefault()

    const delta = getWheelZoomDelta(event.deltaY)
    const prevScale = transformRef.current.scale || 1
    const nextScale = clampScaleByProps(prevScale + delta, props)

    if (nextScale === prevScale) return

    const rect = (event.currentTarget as HTMLElement | null)?.getBoundingClientRect() ?? null

    const next = computeAnchorZoomOffset({
      rect,
      anchorX: event.clientX,
      anchorY: event.clientY,
      offsetX: transformRef.current.offsetX,
      offsetY: transformRef.current.offsetY,
      prevScale,
      nextScale,
    })

    setTransform({ ...transformRef.current, scale: nextScale })
    emit.onUpdateScale?.(nextScale)
    setOffset(next.x, next.y)
  }

  const handleDoubleClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (props.disabled) return
    if (shouldSuppressSyntheticClick()) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    event.preventDefault()
    event.stopPropagation()

    const enableReset = props.enableDoubleClickReset !== false
    if (
      enableReset &&
      isTransformDeviatedFromInitial(
        {
          scale: transformRef.current.scale,
          offsetX: transformRef.current.offsetX,
          offsetY: transformRef.current.offsetY,
          rotation: transformRef.current.rotation,
        },
        props,
      )
    ) {
      resetTransform()
      return
    }

    if (!props.enableDoubleClickZoom || props.readonly) return
    zoomBy(0.5)
  }

  const handleClick = (event: ReactMouseEvent<HTMLElement>) => {
    if (!shouldSuppressSyntheticClick()) return
    event.preventDefault()
    event.stopPropagation()
  }

  const handleTouchStart = (event: ReactTouchEvent<HTMLElement>) => {
    if (props.disabled) return
    const touches = event.touches
    if (
      touches.length === 2 &&
      (props.enablePinchZoom || props.enablePinchRotate)
    ) {
      event.stopPropagation()
      event.preventDefault()
      beginPinchGesture(touches)
      return
    }
    if (
      touches.length === 1 &&
      props.enableDrag &&
      (isImagePreviewScaledForPan(transformRef.current.scale, props) ||
        props.allowDragWhenNotScaled)
    ) {
      event.stopPropagation()
      event.preventDefault()
      touchModeRef.current = 'drag'
      touchDragMovedRef.current = false
      lastPointerXRef.current = touches[0].clientX
      lastPointerYRef.current = touches[0].clientY
    }
  }

  const handleTouchMove = (event: ReactTouchEvent<HTMLElement>) => {
    if (props.disabled) return
    const touches = event.touches
    // 未放大时不处理拖拽，让事件冒泡给父容器（例如外层滚动），除非 allowDragWhenNotScaled 为 true
    if (
      !isImagePreviewScaledForPan(transformRef.current.scale, props) &&
      touchModeRef.current === 'drag' &&
      !props.allowDragWhenNotScaled
    ) {
      touchModeRef.current = 'none'
      return
    }
    if (
      touchModeRef.current === 'drag' &&
      touches.length === 1 &&
      props.enableDrag
    ) {
      event.stopPropagation()
      event.preventDefault()
      const touch = touches[0]
      const dx = touch.clientX - lastPointerXRef.current
      const dy = touch.clientY - lastPointerYRef.current
      if (isDragThresholdExceeded(dx, dy)) {
        touchDragMovedRef.current = true
      }
      lastPointerXRef.current = touch.clientX
      lastPointerYRef.current = touch.clientY
      setOffset(
        transformRef.current.offsetX + dx,
        transformRef.current.offsetY + dy,
      )
    } else if (touchModeRef.current === 'pinch' && touches.length === 1) {
      event.stopPropagation()
      event.preventDefault()
      // 双指变单指：切换为拖拽，保持当前缩放不变
      touchModeRef.current = 'drag'
      lastPointerXRef.current = touches[0].clientX
      lastPointerYRef.current = touches[0].clientY
    } else if (touchModeRef.current === 'pinch' && touches.length === 2) {
      event.stopPropagation()
      event.preventDefault()
      const distance = getDistance(touches[0], touches[1])
      if (props.enablePinchZoom) {
        const ratio = distance / (initialPinchDistanceRef.current || 1)
        const baseScale = initialScaleRef.current || 1
        const prevScale = transformRef.current.scale || 1
        const unclampedNext = baseScale * ratio
        const nextScale = clampScaleByProps(unclampedNext, props)

        if (nextScale !== prevScale) {
          // 以双指中心点为缩放中心，调整偏移量
          const rect = (event.currentTarget as HTMLElement | null)?.getBoundingClientRect() ?? null

          const next = computeAnchorZoomOffset({
            rect,
            anchorX: (touches[0].clientX + touches[1].clientX) / 2,
            anchorY: (touches[0].clientY + touches[1].clientY) / 2,
            offsetX: transformRef.current.offsetX,
            offsetY: transformRef.current.offsetY,
            prevScale,
            nextScale,
          })

          setTransform({ ...transformRef.current, scale: nextScale })
          emit.onUpdateScale?.(nextScale)
          setOffset(next.x, next.y)
        }
      }
      if (props.enablePinchRotate) {
        const angle = getAngle(touches[0], touches[1])
        const deltaAngle = angle - initialAngleRef.current
        const rotation = normalizeRotation(
          (initialRotationRef.current || 0) + deltaAngle,
        )
        setTransform({ ...transformRef.current, rotation })
        emit.onUpdateRotation?.(rotation)
      }
    }
  }

  const handleTouchEnd = (event?: ReactTouchEvent<HTMLElement>) => {
    const previousMode = touchModeRef.current
    const remaining = event?.touches.length ?? 0

    if (previousMode === 'pinch') {
      if (remaining >= 2) return
      if (remaining === 1) {
        if (
          props.enableDrag &&
          (isImagePreviewScaledForPan(transformRef.current.scale, props) ||
            props.allowDragWhenNotScaled)
        ) {
          touchModeRef.current = 'drag'
          lastPointerXRef.current = event!.touches[0].clientX
          lastPointerYRef.current = event!.touches[0].clientY
        } else {
          touchModeRef.current = 'none'
          markGestureEnded()
        }
        return
      }
      touchModeRef.current = 'none'
      markGestureEnded()
      return
    }

    if (previousMode === 'drag') {
      if (remaining >= 1) return
      touchModeRef.current = 'none'
      if (touchDragMovedRef.current) {
        markGestureEnded()
      }
      touchDragMovedRef.current = false
    }
  }

  return {
    focused: isFocusVisible,
    tabindex,
    scale: transform.scale,
    rotation: transform.rotation,
    offsetX: transform.offsetX,
    offsetY: transform.offsetY,
    imageTransform,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleLoad,
    handleError,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    handleDoubleClick,
    handleClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
