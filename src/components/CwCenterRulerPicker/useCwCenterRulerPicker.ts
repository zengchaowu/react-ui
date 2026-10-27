import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import type { CwCenterRulerPickerValue } from '@zengchaowu/ui-shared/components/CwCenterRulerPicker/types'
import {
  clampOptionIndex,
  clampTrackOffset,
  findOptionIndex,
  indexToTrackOffset,
  readRootFontSizePx,
  resolveOptionValue,
  resolveTickWidthPx,
  resolveTrackOffsetBounds,
  trackOffsetToIndex,
} from '@zengchaowu/ui-shared/components/CwCenterRulerPicker/functions'

export interface UseCwCenterRulerPickerOptions {
  modelValue: CwCenterRulerPickerValue
  pickerOptions: readonly CwCenterRulerPickerValue[]
  tickWidthRem: number
  disabled: boolean
  readonly: boolean
  onValueChange: (value: CwCenterRulerPickerValue) => void
}

export function useCwCenterRulerPicker(options: UseCwCenterRulerPickerOptions) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [trackOffsetPx, setTrackOffsetPx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [trackTransitionEnabled, setTrackTransitionEnabled] = useState(false)
  const [previewValue, setPreviewValue] = useState<CwCenterRulerPickerValue | null>(null)

  const optionsRef = useRef(options)
  optionsRef.current = options

  const draggingRef = useRef(false)
  const trackOffsetRef = useRef(0)
  trackOffsetRef.current = trackOffsetPx

  const layoutRef = useRef({
    viewportWidth: 0,
    tickWidthPx: resolveTickWidthPx(options.tickWidthRem),
  })
  const dragRef = useRef({
    activePointerId: null as number | null,
    dragStartX: 0,
    dragStartOffset: 0,
  })

  const tickWidthStyle: CSSProperties = {
    width: `${options.tickWidthRem}rem`,
  }

  const activeValue = dragging && previewValue != null
    ? previewValue
    : options.modelValue

  const minTrackOffset = (): number =>
    resolveTrackOffsetBounds(
      optionsRef.current.pickerOptions.length,
      layoutRef.current.viewportWidth,
      layoutRef.current.tickWidthPx,
    ).minOffset

  const maxTrackOffset = (): number =>
    resolveTrackOffsetBounds(
      optionsRef.current.pickerOptions.length,
      layoutRef.current.viewportWidth,
      layoutRef.current.tickWidthPx,
    ).maxOffset

  const syncTrackToValue = (value: CwCenterRulerPickerValue) => {
    const { viewportWidth, tickWidthPx } = layoutRef.current
    if (!viewportWidth || optionsRef.current.pickerOptions.length === 0) return
    const index = findOptionIndex(value, optionsRef.current.pickerOptions)
    const nextOffset = indexToTrackOffset(index, viewportWidth, tickWidthPx)
    trackOffsetRef.current = nextOffset
    setTrackOffsetPx(nextOffset)
  }

  const measureLayout = () => {
    const el = viewportRef.current
    if (!el) return
    layoutRef.current.viewportWidth = el.clientWidth
    layoutRef.current.tickWidthPx = resolveTickWidthPx(
      optionsRef.current.tickWidthRem,
      readRootFontSizePx(),
    )
    syncTrackToValue(optionsRef.current.modelValue)
    if (!trackTransitionEnabled) {
      requestAnimationFrame(() => {
        setTrackTransitionEnabled(true)
      })
    }
  }

  const valueFromOffset = (offset: number): CwCenterRulerPickerValue | undefined => {
    const { viewportWidth, tickWidthPx } = layoutRef.current
    const pickerOptions = optionsRef.current.pickerOptions
    if (!viewportWidth || pickerOptions.length === 0) return undefined
    const index = clampOptionIndex(
      trackOffsetToIndex(offset, viewportWidth, tickWidthPx),
      pickerOptions.length,
    )
    return resolveOptionValue(index, pickerOptions)
  }

  const commitByIndex = (index: number) => {
    const next = resolveOptionValue(index, optionsRef.current.pickerOptions)
    if (next == null) return
    optionsRef.current.onValueChange(next)
    syncTrackToValue(next)
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = optionsRef.current
    if (current.disabled || current.readonly || event.button !== 0) return
    draggingRef.current = true
    setDragging(true)
    dragRef.current = {
      activePointerId: event.pointerId,
      dragStartX: event.clientX,
      dragStartOffset: trackOffsetRef.current,
    }
    setPreviewValue(current.modelValue)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const { viewportWidth } = layoutRef.current
    if (
      !draggingRef.current
      || event.pointerId !== dragRef.current.activePointerId
      || !viewportWidth
    ) {
      return
    }
    const delta = event.clientX - dragRef.current.dragStartX
    const nextOffset = clampTrackOffset(
      dragRef.current.dragStartOffset + delta,
      minTrackOffset(),
      maxTrackOffset(),
    )
    trackOffsetRef.current = nextOffset
    setTrackOffsetPx(nextOffset)
    setPreviewValue(valueFromOffset(nextOffset) ?? null)
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>, commit: boolean) => {
    if (!draggingRef.current || event.pointerId !== dragRef.current.activePointerId) return
    draggingRef.current = false
    setDragging(false)
    dragRef.current.activePointerId = null

    if (commit) {
      const next = valueFromOffset(trackOffsetRef.current)
      if (next != null) optionsRef.current.onValueChange(next)
      else syncTrackToValue(optionsRef.current.modelValue)
    } else {
      syncTrackToValue(optionsRef.current.modelValue)
    }
    setPreviewValue(null)

    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      /* ignore */
    }
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    endDrag(event, true)
  }

  const onPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    endDrag(event, false)
  }

  const onWheel = (event: WheelEvent) => {
    const current = optionsRef.current
    if (current.disabled || current.readonly || !layoutRef.current.viewportWidth) return
    event.preventDefault()
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY
    const index = findOptionIndex(current.modelValue, current.pickerOptions)
    const nextIndex = clampOptionIndex(
      index + (delta > 0 ? 1 : -1),
      current.pickerOptions.length,
    )
    commitByIndex(nextIndex)
  }

  const stepBy = (delta: number) => {
    const current = optionsRef.current
    if (current.disabled || current.readonly) return
    const index = findOptionIndex(current.modelValue, current.pickerOptions)
    commitByIndex(clampOptionIndex(index + delta, current.pickerOptions.length))
  }

  const jumpToEdge = (edge: 'start' | 'end') => {
    const current = optionsRef.current
    if (current.disabled || current.readonly) return
    const count = current.pickerOptions.length
    if (count === 0) return
    commitByIndex(edge === 'start' ? 0 : count - 1)
  }

  // wheel 需要非 passive 监听才能 preventDefault（React onWheel 是 passive）
  const wheelHandlerRef = useRef(onWheel)
  wheelHandlerRef.current = onWheel
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const listener = (event: WheelEvent) => wheelHandlerRef.current(event)
    el.addEventListener('wheel', listener, { passive: false })
    return () => el.removeEventListener('wheel', listener)
  }, [])

  useEffect(() => {
    if (!draggingRef.current) syncTrackToValue(options.modelValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.modelValue])

  useEffect(() => {
    if (!draggingRef.current) syncTrackToValue(optionsRef.current.modelValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.pickerOptions])

  useEffect(() => {
    if (!draggingRef.current) measureLayout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.tickWidthRem])

  useLayoutEffect(() => {
    measureLayout()
    const el = viewportRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const resizeObserver = new ResizeObserver(() => measureLayout())
    resizeObserver.observe(el)
    return () => {
      resizeObserver.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    viewportRef,
    trackOffsetPx,
    dragging,
    trackTransitionEnabled,
    tickWidthStyle,
    activeValue,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onWheel,
    stepBy,
    jumpToEdge,
  }
}
