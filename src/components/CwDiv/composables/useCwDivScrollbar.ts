import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'
import type { CwDivScrollbarMap } from '../types'

const MIN_THUMB_SIZE = 24
const SCROLLBAR_FADE_DELAY = 600

export type CwDivAxis = 'vertical' | 'horizontal'

export interface CwDivAxisMetrics {
  visible: boolean
  thumbSize: number
  thumbOffset: number
}

type DragState = {
  active: boolean
  axis: CwDivAxis | null
  trackLength: number
  thumbSize: number
  grabOffset: number
}

export interface UseCwDivScrollbarOptions {
  persistScrollbar?: boolean
  scrollbarMap?: CwDivScrollbarMap
  onSeek?: (axis: CwDivAxis, offset: number) => void
  scrollListener?: (event: Event) => void
}

export interface UseCwDivScrollbarResult {
  rootRef: RefObject<HTMLDivElement>
  viewportRef: RefObject<HTMLDivElement>
  contentRef: RefObject<HTMLDivElement>
  verticalTrackRef: RefObject<HTMLDivElement>
  horizontalTrackRef: RefObject<HTMLDivElement>
  verticalThumbRef: RefObject<HTMLDivElement>
  horizontalThumbRef: RefObject<HTMLDivElement>
  vertical: CwDivAxisMetrics
  horizontal: CwDivAxisMetrics
  shouldShowScrollbars: boolean
  verticalThumbStyle: CSSProperties | undefined
  horizontalThumbStyle: CSSProperties | undefined
  handleScroll: (event: Event) => void
  handleTrackPointerDown: (axis: CwDivAxis, event: PointerEvent) => void
  startThumbDrag: (axis: CwDivAxis, event: PointerEvent) => void
  onScrollbarPointerEnter: () => void
  onScrollbarPointerLeave: (event: PointerEvent) => void
  scheduleUpdate: () => void
  getViewport: () => HTMLDivElement | null
  scrollTo: (scrollOptions?: ScrollToOptions | number, y?: number) => void
  scrollBy: (scrollOptions?: ScrollToOptions | number, y?: number) => void
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const axisMetricsEqual = (a: CwDivAxisMetrics, b: CwDivAxisMetrics) =>
  a.visible === b.visible && a.thumbSize === b.thumbSize && a.thumbOffset === b.thumbOffset

/**
 * React 版 `useCwDivScrollbar`：自定义滚动条测量、虚拟化映射、拖拽与淡出。
 */
export function useCwDivScrollbar(
  options: UseCwDivScrollbarOptions,
): UseCwDivScrollbarResult {
  const rootRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const verticalTrackRef = useRef<HTMLDivElement>(null)
  const horizontalTrackRef = useRef<HTMLDivElement>(null)
  const verticalThumbRef = useRef<HTMLDivElement>(null)
  const horizontalThumbRef = useRef<HTMLDivElement>(null)

  const verticalMetricsRef = useRef<CwDivAxisMetrics>({
    visible: false,
    thumbSize: 0,
    thumbOffset: 0,
  })
  const horizontalMetricsRef = useRef<CwDivAxisMetrics>({
    visible: false,
    thumbSize: 0,
    thumbOffset: 0,
  })

  const [vertical, setVertical] = useState<CwDivAxisMetrics>({
    visible: false,
    thumbSize: 0,
    thumbOffset: 0,
  })
  const [horizontal, setHorizontal] = useState<CwDivAxisMetrics>({
    visible: false,
    thumbSize: 0,
    thumbOffset: 0,
  })

  const [isDragging, setIsDragging] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isPointerOverScrollbar, setIsPointerOverScrollbar] = useState(false)

  const dragStateRef = useRef<DragState>({
    active: false,
    axis: null,
    trackLength: 0,
    thumbSize: 0,
    grabOffset: 0,
  })

  const optionsRef = useRef(options)
  const savedUserSelectRef = useRef('')
  const rafIdRef = useRef(0)
  const scrollFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const viewportObserverRef = useRef<ResizeObserver | null>(null)
  const contentObserverRef = useRef<ResizeObserver | null>(null)
  const documentMoveRef = useRef<((event: PointerEvent) => void) | null>(null)
  const documentUpRef = useRef<(() => void) | null>(null)

  useLayoutEffect(() => {
    optionsRef.current = options
  })

  const getViewport = () => viewportRef.current

  const axisSpan = (axis: CwDivAxis) => {
    const span =
      axis === 'vertical'
        ? optionsRef.current.scrollbarMap?.vertical
        : optionsRef.current.scrollbarMap?.horizontal
    if (!span || span.extent <= 0) return null
    return span
  }

  const syncMetrics = () => {
    const nextVertical = { ...verticalMetricsRef.current }
    const nextHorizontal = { ...horizontalMetricsRef.current }
    setVertical((prev) => (axisMetricsEqual(prev, nextVertical) ? prev : nextVertical))
    setHorizontal((prev) => (axisMetricsEqual(prev, nextHorizontal) ? prev : nextHorizontal))
  }

  const updateMetrics = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const readAxis = (axis: CwDivAxis) => {
      const span = axis === 'vertical'
        ? optionsRef.current.scrollbarMap?.vertical
        : optionsRef.current.scrollbarMap?.horizontal
      const verticalAxis = axis === 'vertical'
      return {
        client: verticalAxis ? viewport.clientHeight : viewport.clientWidth,
        size: span ? span.extent : verticalAxis ? viewport.scrollHeight : viewport.scrollWidth,
        offset: span ? span.offset : verticalAxis ? viewport.scrollTop : viewport.scrollLeft,
      }
    }

    const sources = {
      vertical: readAxis('vertical'),
      horizontal: readAxis('horizontal'),
    }

    const verticalMetrics = verticalMetricsRef.current
    const horizontalMetrics = horizontalMetricsRef.current
    verticalMetrics.visible = sources.vertical.size > sources.vertical.client + 1
    horizontalMetrics.visible = sources.horizontal.size > sources.horizontal.client + 1

    const place = (axis: CwDivAxis) => {
      const metrics = axis === 'vertical' ? verticalMetricsRef.current : horizontalMetricsRef.current
      const source = sources[axis]
      if (!metrics.visible) {
        metrics.thumbSize = 0
        metrics.thumbOffset = 0
        return
      }
      const track = axis === 'vertical' ? verticalTrackRef.current : horizontalTrackRef.current
      const measured = axis === 'vertical' ? track?.clientHeight ?? 0 : track?.clientWidth ?? 0
      const otherVisible =
        axis === 'vertical' ? horizontalMetrics.visible : verticalMetrics.visible
      const trackLength =
        measured > 0 ? measured : Math.max(source.client - (otherVisible ? 8 : 2), 0)
      const scrollRange = source.size - source.client
      const thumbSize = clamp(
        (source.client / source.size) * trackLength,
        MIN_THUMB_SIZE,
        trackLength,
      )
      metrics.thumbSize = thumbSize
      const movableRange = Math.max(trackLength - thumbSize, 0)
      const offset = Math.min(Math.max(source.offset, 0), Math.max(scrollRange, 0))
      metrics.thumbOffset =
        scrollRange <= 0 ? 0 : clamp((offset / scrollRange) * movableRange, 0, movableRange)
    }

    place('vertical')
    place('horizontal')

    syncMetrics()
  }, [])

  const scheduleUpdate = useCallback(() => {
    cancelAnimationFrame(rafIdRef.current)
    rafIdRef.current = requestAnimationFrame(updateMetrics)
  }, [updateMetrics])

  const axisScrollRange = (axis: CwDivAxis, viewport: HTMLElement) => {
    const span = axisSpan(axis)
    const verticalAxis = axis === 'vertical'
    const client = verticalAxis ? viewport.clientHeight : viewport.clientWidth
    const size = span ? span.extent : verticalAxis ? viewport.scrollHeight : viewport.scrollWidth
    return Math.max(0, size - client)
  }

  const writeAxisScroll = (axis: CwDivAxis, viewport: HTMLElement, next: number) => {
    if (axisSpan(axis)) {
      optionsRef.current.onSeek?.(axis, next)
      return
    }
    if (axis === 'vertical') viewport.scrollTop = next
    else viewport.scrollLeft = next
  }

  const applyDraggingStyle = (dragging: boolean) => {
    if (typeof document === 'undefined') return
    const body = document.body
    if (dragging) {
      savedUserSelectRef.current = body.style.userSelect
      body.style.userSelect = 'none'
    } else {
      body.style.userSelect = savedUserSelectRef.current
    }
  }

  const handlePointerMove = (event: PointerEvent) => {
    const dragState = dragStateRef.current
    if (!dragState.active || !dragState.axis) return
    const viewport = getViewport()
    if (!viewport) return
    event.preventDefault()
    event.stopPropagation()
    const track =
      dragState.axis === 'vertical' ? verticalTrackRef.current : horizontalTrackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const pointer =
      dragState.axis === 'vertical' ? event.clientY - rect.top : event.clientX - rect.left
    const movableRange = dragState.trackLength - dragState.thumbSize
    if (movableRange <= 0) return
    const scrollRange = axisScrollRange(dragState.axis, viewport)
    const offset = clamp(pointer - dragState.grabOffset, 0, movableRange)
    const next = (offset / movableRange) * scrollRange
    writeAxisScroll(dragState.axis, viewport, next)
  }

  const removeDocumentDragListeners = () => {
    if (typeof document === 'undefined') return
    if (documentMoveRef.current) {
      document.removeEventListener('pointermove', documentMoveRef.current)
      documentMoveRef.current = null
    }
    if (documentUpRef.current) {
      document.removeEventListener('pointerup', documentUpRef.current, true)
      documentUpRef.current = null
    }
  }

  const handlePointerUp = () => {
    dragStateRef.current.active = false
    dragStateRef.current.axis = null
    setIsDragging(false)
    applyDraggingStyle(false)
    removeDocumentDragListeners()
  }

  const startThumbDrag = (axis: CwDivAxis, event: PointerEvent) => {
    const viewport = getViewport()
    const verticalTrack = verticalTrackRef.current
    const horizontalTrack = horizontalTrackRef.current
    if (!viewport) return

    const trackLength =
      axis === 'vertical'
        ? verticalTrack?.clientHeight ?? 0
        : horizontalTrack?.clientWidth ?? 0
    const thumbSize =
      axis === 'vertical' ? verticalMetricsRef.current.thumbSize : horizontalMetricsRef.current.thumbSize
    const scrollRange = axisScrollRange(axis, viewport)

    if (trackLength <= 0 || thumbSize <= 0 || scrollRange <= 0) return

    const dragState = dragStateRef.current
    dragState.active = true
    dragState.axis = axis
    const pointer = axis === 'vertical' ? event.clientY : event.clientX
    const trackRect = (axis === 'vertical' ? verticalTrack : horizontalTrack)?.getBoundingClientRect()
    const pointerInTrack = trackRect
      ? pointer - (axis === 'vertical' ? trackRect.top : trackRect.left)
      : 0
    const axisState = axis === 'vertical' ? verticalMetricsRef.current : horizontalMetricsRef.current
    dragState.grabOffset = pointerInTrack - axisState.thumbOffset
    dragState.trackLength = trackLength
    dragState.thumbSize = thumbSize
    setIsDragging(true)
    applyDraggingStyle(true)

    if (typeof document !== 'undefined') {
      const onMove = (moveEvent: PointerEvent) => handlePointerMove(moveEvent)
      const onUp = () => handlePointerUp()
      documentMoveRef.current = onMove
      documentUpRef.current = onUp
      document.addEventListener('pointermove', onMove, { passive: false })
      document.addEventListener('pointerup', onUp, { passive: false, capture: true })
    }

    event.preventDefault()
  }

  const handleTrackPointerDown = (axis: CwDivAxis, event: PointerEvent) => {
    const viewport = getViewport()
    const track = axis === 'vertical' ? verticalTrackRef.current : horizontalTrackRef.current
    const thumb = axis === 'vertical' ? verticalThumbRef.current : horizontalThumbRef.current
    if (!viewport || !track || !thumb) return

    const rect = track.getBoundingClientRect()
    const pointer = axis === 'vertical' ? event.clientY - rect.top : event.clientX - rect.left
    const metrics = axis === 'vertical' ? verticalMetricsRef.current : horizontalMetricsRef.current
    const thumbSize = metrics.thumbSize
    const trackLength = axis === 'vertical' ? track.clientHeight : track.clientWidth
    const movableRange = Math.max(trackLength - thumbSize, 0)
    const scrollRange = axisScrollRange(axis, viewport)

    if (movableRange > 0 && scrollRange > 0) {
      const targetOffset = clamp(pointer - thumbSize / 2, 0, movableRange)
      const ratio = targetOffset / movableRange
      const targetScroll = ratio * scrollRange
      if (axisSpan(axis)) {
        metrics.thumbOffset = targetOffset
        syncMetrics()
      }
      writeAxisScroll(axis, viewport, targetScroll)
    }

    startThumbDrag(axis, event)
  }

  const isInsideAnyScrollbarTrack = (node: Node | null) => {
    if (!node) return false
    const vertical = verticalTrackRef.current
    const tracker = horizontalTrackRef.current
    return !!(vertical?.contains(node) || tracker?.contains(node))
  }

  const onScrollbarPointerEnter = () => {
    setIsPointerOverScrollbar(true)
  }

  const onScrollbarPointerLeave = (event: PointerEvent) => {
    const next = event.relatedTarget as Node | null
    if (isInsideAnyScrollbarTrack(next)) return
    setIsPointerOverScrollbar(false)
  }

  const handleScroll = (event: Event) => {
    optionsRef.current.scrollListener?.(event)
    scheduleUpdate()
    setIsScrolling(true)
    if (scrollFadeTimerRef.current) clearTimeout(scrollFadeTimerRef.current)
    scrollFadeTimerRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, SCROLLBAR_FADE_DELAY)
  }

  const shouldShowScrollbars = useMemo(() => {
    if (!vertical.visible && !horizontal.visible) return false
    if (options.persistScrollbar) return true
    return isDragging || isScrolling || isPointerOverScrollbar
  }, [
    vertical.visible,
    horizontal.visible,
    options.persistScrollbar,
    isDragging,
    isScrolling,
    isPointerOverScrollbar,
  ])

  const verticalThumbStyle = useMemo<CSSProperties | undefined>(() => {
    if (!vertical.visible) return undefined
    return {
      height: `${vertical.thumbSize}px`,
      top: `${vertical.thumbOffset}px`,
    }
  }, [vertical])

  const horizontalThumbStyle = useMemo<CSSProperties | undefined>(() => {
    if (!horizontal.visible) return undefined
    return {
      width: `${horizontal.thumbSize}px`,
      left: `${horizontal.thumbOffset}px`,
    }
  }, [horizontal])

  useEffect(() => {
    scheduleUpdate()
  }, [options.scrollbarMap, scheduleUpdate])

  useLayoutEffect(() => {
    scheduleUpdate()
    const rafId = requestAnimationFrame(() => {
      scheduleUpdate()
      const viewport = viewportRef.current
      if (viewport) {
        const originalTop = viewport.scrollTop
        const originalLeft = viewport.scrollLeft
        viewport.scrollTop = originalTop > 0 ? originalTop : 1
        viewport.scrollLeft = originalLeft > 0 ? originalLeft : 1
        scheduleUpdate()
        viewport.scrollTop = originalTop
        viewport.scrollLeft = originalLeft
      }
    })

    if (typeof ResizeObserver !== 'undefined') {
      const viewport = viewportRef.current
      const content = contentRef.current
      if (viewport) {
        viewportObserverRef.current = new ResizeObserver(() => scheduleUpdate())
        viewportObserverRef.current.observe(viewport)
      }
      if (content) {
        contentObserverRef.current = new ResizeObserver(() => scheduleUpdate())
        contentObserverRef.current.observe(content)
      }
    }

    return () => {
      cancelAnimationFrame(rafId)
      cancelAnimationFrame(rafIdRef.current)
      if (scrollFadeTimerRef.current) {
        clearTimeout(scrollFadeTimerRef.current)
        scrollFadeTimerRef.current = null
      }
      viewportObserverRef.current?.disconnect()
      viewportObserverRef.current = null
      contentObserverRef.current?.disconnect()
      contentObserverRef.current = null
      if (dragStateRef.current.active) handlePointerUp()
    }
  }, [scheduleUpdate])

  // scrollTo / scrollBy 只读 ref，保持稳定引用：它们会进入 CwDiv 的
  // useImperativeHandle 依赖，若每次渲染新建会导致 handle 每帧重建，
  // 回调 ref 反复 setState → Maximum update depth exceeded。
  const scrollTo = useCallback((scrollOptions?: ScrollToOptions | number, y?: number) => {
    const viewport = viewportRef.current
    if (!viewport) return
    if (typeof scrollOptions === 'number') {
      viewport.scrollTo(scrollOptions, y ?? 0)
    } else {
      viewport.scrollTo(scrollOptions)
    }
  }, [])

  const scrollBy = useCallback((scrollOptions?: ScrollToOptions | number, y?: number) => {
    const viewport = viewportRef.current
    if (!viewport) return
    if (typeof scrollOptions === 'number') {
      viewport.scrollBy(scrollOptions, y ?? 0)
    } else {
      viewport.scrollBy(scrollOptions)
    }
  }, [])

  return {
    rootRef,
    viewportRef,
    contentRef,
    verticalTrackRef,
    horizontalTrackRef,
    verticalThumbRef,
    horizontalThumbRef,
    vertical,
    horizontal,
    shouldShowScrollbars,
    verticalThumbStyle,
    horizontalThumbStyle,
    handleScroll,
    handleTrackPointerDown,
    startThumbDrag,
    onScrollbarPointerEnter,
    onScrollbarPointerLeave,
    scheduleUpdate,
    getViewport,
    scrollTo,
    scrollBy,
  }
}
