import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { CSSProperties, HTMLAttributes } from 'react'
import type {
  CwInfiniteLoopScrollExpose,
  CwInfiniteLoopScrollItem,
  CwInfiniteLoopScrollProps,
} from './types'
import { infiniteLoopScrollBase } from './styles'
import { defaultTexts } from './texts'
import { CwDiv } from '../CwDiv'
import type { CwDivHandle } from '../CwDiv'
import { resolveCwDivViewport } from '../CwDiv/resolveCwDivViewport'
import {
  calculateItemPositions,
  calculateItemStyle,
  calculateContentTransform,
  checkAndJumpToMiddle as checkAndJumpToMiddleFn,
  calculateCenterIndex,
  calculateVisibleRangeFromLoopItems,
} from './functions'
import { loopScrollbarSpan } from './functions/loopScrollbarSpan'
import { useInfiniteLoop } from './hooks/useInfiniteLoop'
import { useScrollPosition } from './hooks/useScrollPosition'
import { useContainerSize } from './hooks/useContainerSize'
import { useVisibleRange } from './hooks/useVisibleRange'
import type { LoopItem } from './hooks/useVisibleRange'
import { usePadding } from './hooks/usePadding'
import { useInfiniteLoopScrollMethods } from './hooks/useInfiniteLoopScrollMethods'
import { useMomentum } from './hooks/useMomentum'
import { usePageSnap } from './hooks/usePageSnap'
import { usePagedHorizontalInteraction } from './hooks/usePagedHorizontalInteraction'
import { useWheel } from './hooks/useWheel'
import { useDrag } from './hooks/useDrag'
import type { DragScrollMeta } from './hooks/useDrag'

export interface CwInfiniteLoopScrollHandle extends CwInfiniteLoopScrollExpose {}

export interface CwInfiniteLoopScrollComponentProps
  extends CwInfiniteLoopScrollProps,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      'children' | 'className' | 'style' | 'onScroll'
    > {}

export const CwInfiniteLoopScroll = forwardRef<
  CwInfiniteLoopScrollHandle,
  CwInfiniteLoopScrollComponentProps
>(function CwInfiniteLoopScroll(
  {
    items,
    itemHeight = 50,
    itemWidth = 200,
    bufferSize = 3,
    direction = 'vertical',
    disabled = false,
    readonly = false,
    enableMomentum = true,
    momentumDeceleration = 0.95,
    snapToPage = false,
    snapThreshold = 0.2,
    pageHeight,
    pageWidth,
    padding = 0,
    showScrollbar = true,
    texts: textsProp,
    children,
    emptySlot,
    className,
    onScroll,
    onVisibleChange,
    ...rest
  },
  ref,
) {
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const cwDivRef = useRef<CwDivHandle>(null)
  const gestureRootRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null)

  const useNativeScroll = !snapToPage
  const isPagedHorizontal = snapToPage && direction === 'horizontal' && items.length > 0

  const scroll = useScrollPosition()
  const {
    scrollTop,
    scrollLeft,
    scrollTopRef,
    scrollLeftRef,
    updateScrollPosition,
    setScrollTop,
    setScrollLeft,
    updateScrollPositionDirect,
    setPendingScrollTop,
    setPendingScrollLeft,
    addPendingDelta,
  } = scroll

  const { containerHeight, containerWidth } = useContainerSize(containerEl)

  const {
    singleCopyHeight,
    singleCopyWidth,
    loopItems,
    middleCopyInfo,
    totalHeight,
    totalWidth,
  } = useInfiniteLoop(
    items,
    direction,
    itemHeight,
    itemWidth,
    containerHeight,
    containerWidth,
  )

  const rawItemPositions = useMemo(
    () => calculateItemPositions(loopItems, direction, itemHeight, itemWidth),
    [loopItems, direction, itemHeight, itemWidth],
  )

  const { itemPositions, totalHeight: paddedHeight, totalWidth: paddedWidth } = usePadding(
    padding,
    rawItemPositions,
    totalHeight,
    totalWidth,
  )

  const { visibleRange, visibleItems } = useVisibleRange({
    items: loopItems,
    itemPositions,
    scrollTop,
    scrollLeft,
    containerHeight,
    containerWidth,
    direction,
    bufferSize,
  })

  const contentTransform = useMemo(
    () => calculateContentTransform(scrollTop, scrollLeft, direction),
    [scrollTop, scrollLeft, direction],
  )

  const contentSizeStyle: CSSProperties = useMemo(
    () => ({
      height: direction === 'horizontal' ? '100%' : `${paddedHeight}px`,
      width: direction === 'vertical' ? '100%' : `${paddedWidth}px`,
    }),
    [direction, paddedHeight, paddedWidth],
  )

  const scrollbarMap = useMemo(() => {
    const vertical =
      direction === 'horizontal'
        ? undefined
        : loopScrollbarSpan(scrollTop, singleCopyHeight, containerHeight)
    const horizontal =
      direction === 'vertical'
        ? undefined
        : loopScrollbarSpan(scrollLeft, singleCopyWidth, containerWidth)
    if (!vertical && !horizontal) return undefined
    return { vertical, horizontal }
  }, [
    direction,
    scrollTop,
    scrollLeft,
    singleCopyHeight,
    singleCopyWidth,
    containerHeight,
    containerWidth,
  ])

  const pageWidthPx = useMemo(() => {
    if (typeof pageWidth === 'number' && pageWidth > 0) return pageWidth
    return containerWidth
  }, [pageWidth, containerWidth])

  const applyingProgrammaticScrollRef = useRef(false)

  function emitScroll(
    top: number,
    left: number,
    centerIndex: number | null,
    isPreview?: boolean,
  ) {
    onScroll?.(top, left, centerIndex, isPreview)
  }

  function withProgrammaticScroll(run: () => void) {
    applyingProgrammaticScrollRef.current = true
    try {
      run()
    } finally {
      queueMicrotask(() => {
        applyingProgrammaticScrollRef.current = false
      })
    }
  }

  const pagedInteraction = usePagedHorizontalInteraction({
    enabled: isPagedHorizontal,
    itemCount: items.length,
    pageWidth: pageWidthPx,
    snapThreshold,
    scrollTopRef,
    scrollLeftRef,
    middleCopyInfo,
    emitScroll,
  })

  const { setPage: setPagedPage } = pagedInteraction

  function handleScroll(top: number, left: number, dragMeta?: DragScrollMeta) {
    if (pagedInteraction.handleDragScroll(top, left, dragMeta)) return

    emitScroll(
      top,
      left,
      calculateCenterIndex(
        top,
        left,
        containerHeight,
        containerWidth,
        direction,
        itemPositions,
        loopItems,
      ),
    )
  }

  function checkAndJumpToMiddle(options?: { emitScroll?: boolean }) {
    const result = checkAndJumpToMiddleFn(
      scrollTopRef.current,
      scrollLeftRef.current,
      direction,
      singleCopyHeight,
      singleCopyWidth,
      middleCopyInfo,
      containerHeight,
      containerWidth,
    )

    if (result.needsUpdate) {
      setPendingScrollTop(result.newTop)
      setPendingScrollLeft(result.newLeft)
      updateScrollPositionDirect(result.newTop, result.newLeft, () => {
        if (options?.emitScroll === false) return
        handleScroll(scrollTopRef.current, scrollLeftRef.current)
      })
    }
  }

  // 惯性滚动
  const momentum = useMomentum({
    scrollTopRef,
    scrollLeftRef,
    direction,
    momentumDeceleration,
    updateScrollPositionDirect,
    disabled,
    readonly,
    onFrame: () => {
      checkAndJumpToMiddle()
      handleScroll(scrollTopRef.current, scrollLeftRef.current)
    },
  })

  // 分页对齐（动画中间帧不 emit，结束帧再 emit 当前逻辑页）
  const pageSnap = usePageSnap({
    snapToPage,
    snapThreshold,
    pageHeight,
    pageWidth,
    direction,
    containerHeight,
    containerWidth,
    middleCopyInfo,
    scrollTopRef,
    scrollLeftRef,
    applyScroll: (top, left, applyOptions) => {
      updateScrollPositionDirect(top, left, () => {
        checkAndJumpToMiddle({ emitScroll: false })
        if (applyOptions?.emitScroll === false) return
        handleScroll(scrollTopRef.current, scrollLeftRef.current)
      })
    },
  })

  const snapByDrag = (
    startTop: number,
    startLeft: number,
    currentTop: number,
    currentLeft: number,
  ) =>
    isPagedHorizontal
      ? pagedInteraction.snapByDrag(startTop, startLeft, currentTop, currentLeft)
      : pageSnap.snapToNearestPageByDrag(startTop, startLeft, currentTop, currentLeft)

  function normalizeLoopScroll(top: number, left: number) {
    const result = checkAndJumpToMiddleFn(
      top,
      left,
      direction,
      singleCopyHeight,
      singleCopyWidth,
      middleCopyInfo,
      containerHeight,
      containerWidth,
    )
    return { top: result.newTop, left: result.newLeft }
  }

  // 拖拽：新手势只停吸附动画（勿瞬移页槽，避免连滑卡顿）；松手走绝对页吸附纠偏
  const drag = useDrag({
    scrollTopRef,
    scrollLeftRef,
    direction,
    disabled,
    readonly,
    enableMomentum,
    updateScrollPositionDirect,
    stopMomentum: momentum.stopMomentum,
    startMomentum: momentum.startMomentum,
    snapToPage,
    snapByDrag,
    smoothSnapToPage: pageSnap.smoothSnapToPage,
    onScroll: handleScroll,
    normalizeScroll: normalizeLoopScroll,
    stopSnapAnimation: pageSnap.stopSnapAnimation,
  })

  // 滚轮事件处理
  const wheel = useWheel({
    disabled,
    readonly,
    direction,
    snapToPage,
    scrollTopRef,
    scrollLeftRef,
    stopMomentum: momentum.stopMomentum,
    getPageTarget: pageSnap.getPageTarget,
    setPendingScrollTop,
    setPendingScrollLeft,
    addPendingDelta,
    updateScrollPosition,
    checkAndJumpToMiddle: () => checkAndJumpToMiddle({ emitScroll: false }),
    onScroll: handleScroll,
  })

  function handleWheelEvent(event: WheelEvent) {
    if (disabled || readonly) return

    if (isPagedHorizontal) {
      const delta = event.deltaX || event.deltaY
      const targetLeft = pagedInteraction.commitWheelDelta(delta)
      if (targetLeft == null) return
      event.preventDefault()
      momentum.stopMomentum()
      pageSnap.stopSnapAnimation()
      pageSnap.smoothSnapToPage(scrollTopRef.current, targetLeft)
      return
    }

    wheel.handleWheel(event)
  }

  // 滚动方法
  const methods = useInfiniteLoopScrollMethods({
    items,
    direction,
    itemHeight,
    itemWidth,
    middleCopyInfo,
    scrollTopRef,
    scrollLeftRef,
    loopItems,
    visibleRange,
    setScrollTop,
    setScrollLeft,
    updateScrollPositionDirect,
    checkAndJumpToMiddle: () => checkAndJumpToMiddle({ emitScroll: false }),
    onScroll: handleScroll,
  })

  const scrollToIndex = (index: number) => {
    if (isPagedHorizontal) setPagedPage(index)
    methods.scrollToIndex(index)
  }

  useImperativeHandle(
    ref,
    () => ({
      scrollTo: methods.scrollTo,
      setScrollOffset: methods.setScrollOffset,
      scrollToIndex,
      getScrollTop: methods.getScrollTop,
      getScrollLeft: methods.getScrollLeft,
      getVisibleRange: methods.getVisibleRange,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      methods.scrollTo,
      methods.setScrollOffset,
      methods.getScrollTop,
      methods.getScrollLeft,
      methods.getVisibleRange,
      isPagedHorizontal,
      setPagedPage,
    ],
  )

  // 容器元素：原生滚动取 CwDiv 视口，分页手势取手势根节点
  useLayoutEffect(() => {
    if (useNativeScroll) {
      setContainerEl(resolveCwDivViewport(cwDivRef.current))
    } else {
      setContainerEl(gestureRootRef.current)
    }
  }, [useNativeScroll, items.length, containerHeight, containerWidth])

  function onScrollbarSeek(axis: 'vertical' | 'horizontal', offset: number) {
    const info = middleCopyInfo
    if (!info) return
    if (axis === 'vertical') setScrollTop(info.top + offset)
    else setScrollLeft(info.left + offset)
  }

  function handleNativeScroll() {
    if (applyingProgrammaticScrollRef.current || !useNativeScroll) return
    const viewport = resolveCwDivViewport(cwDivRef.current)
    if (!viewport) return

    const top = viewport.scrollTop
    const left = viewport.scrollLeft
    const result = checkAndJumpToMiddleFn(
      top,
      left,
      direction,
      singleCopyHeight,
      singleCopyWidth,
      middleCopyInfo,
      containerHeight,
      containerWidth,
    )

    if (result.needsUpdate) {
      withProgrammaticScroll(() => {
        if (Math.abs(viewport.scrollTop - result.newTop) >= 0.5) {
          viewport.scrollTop = result.newTop
        }
        if (Math.abs(viewport.scrollLeft - result.newLeft) >= 0.5) {
          viewport.scrollLeft = result.newLeft
        }
        updateScrollPositionDirect(result.newTop, result.newLeft, () => {
          handleScroll(scrollTopRef.current, scrollLeftRef.current)
        })
      })
      return
    }

    updateScrollPositionDirect(top, left, () => {
      handleScroll(scrollTopRef.current, scrollLeftRef.current)
    })
  }

  // 原生滚动：状态变化写回视口
  useEffect(() => {
    if (!useNativeScroll || applyingProgrammaticScrollRef.current) return
    const viewport = resolveCwDivViewport(cwDivRef.current)
    if (!viewport) return
    const topDiff = Math.abs(viewport.scrollTop - scrollTopRef.current)
    const leftDiff = Math.abs(viewport.scrollLeft - scrollLeftRef.current)
    if (topDiff < 0.5 && leftDiff < 0.5) return
    withProgrammaticScroll(() => {
      if (topDiff >= 0.5) viewport.scrollTop = scrollTopRef.current
      if (leftDiff >= 0.5) viewport.scrollLeft = scrollLeftRef.current
    })
  }, [scrollTop, scrollLeft, useNativeScroll, containerEl])

  // 禁用/只读锁定视口
  useEffect(() => {
    const viewport = resolveCwDivViewport(cwDivRef.current)
    if (!viewport || !useNativeScroll) return
    const locked = disabled || readonly
    viewport.style.overflow = locked ? 'hidden' : ''
    viewport.style.pointerEvents = locked ? 'none' : ''
  }, [disabled, readonly, useNativeScroll, containerEl])

  // 初始化滚动位置到中间副本
  const didInitRef = useRef(false)
  useEffect(() => {
    if (didInitRef.current || !middleCopyInfo) return
    didInitRef.current = true

    const shouldEmit = !(snapToPage && direction === 'horizontal')
    if (direction === 'horizontal') {
      setScrollLeft(middleCopyInfo.left, () => {
        if (shouldEmit) handleScroll(scrollTopRef.current, scrollLeftRef.current)
      })
    } else {
      setScrollTop(middleCopyInfo.top, () => {
        if (shouldEmit) handleScroll(scrollTopRef.current, scrollLeftRef.current)
      })
    }
  }, [middleCopyInfo, direction, snapToPage, setScrollLeft, setScrollTop])

  // 监听可见范围变化
  const previousVisibleRangeRef = useRef<{ startIndex: number; endIndex: number } | null>(null)
  useEffect(() => {
    const { startIndex, endIndex } = visibleRange
    if (startIndex < 0 || endIndex < 0) return

    const previous = previousVisibleRangeRef.current
    if (
      previous &&
      previous.startIndex === startIndex &&
      previous.endIndex === endIndex
    ) {
      return
    }
    previousVisibleRangeRef.current = { startIndex, endIndex }

    const visibleItemsList: CwInfiniteLoopScrollItem[] = visibleItems.map((item) => ({
      key: items[item.originalIndex]?.key ?? item.key,
      data: item.data,
      height: item.height,
      width: item.width,
    }))

    const {
      startIndex: startOriginalIndex,
      endIndex: endOriginalIndex,
    } = calculateVisibleRangeFromLoopItems({ startIndex, endIndex }, loopItems)

    onVisibleChange?.(startOriginalIndex, endOriginalIndex, visibleItemsList)
  }, [visibleRange, visibleItems, items, loopItems, onVisibleChange])

  // 列表身份变化时回到中间副本
  const itemsSignature = useMemo(() => {
    if (items.length === 0) return '0'
    return `${items.length}\0${items.map((item) => String(item.key)).join('\0')}`
  }, [items])
  const previousSignatureRef = useRef<string | null>(null)
  useEffect(() => {
    if (previousSignatureRef.current === null) {
      previousSignatureRef.current = itemsSignature
      return
    }
    if (previousSignatureRef.current === itemsSignature) return
    previousSignatureRef.current = itemsSignature

    if (!middleCopyInfo) return

    if (direction === 'horizontal') {
      setScrollLeft(middleCopyInfo.left, () => {
        setPagedPage(0)
        handleScroll(scrollTopRef.current, scrollLeftRef.current)
      })
    } else {
      setScrollTop(middleCopyInfo.top, () => {
        setPagedPage(0)
        handleScroll(scrollTopRef.current, scrollLeftRef.current)
      })
    }
  }, [itemsSignature, middleCopyInfo, direction, setScrollLeft, setScrollTop, setPagedPage])

  // 容器尺寸变化：检查并跳回中间副本
  const previousSizeRef = useRef({ height: containerHeight, width: containerWidth })
  useEffect(() => {
    const previous = previousSizeRef.current
    previousSizeRef.current = { height: containerHeight, width: containerWidth }

    if (
      (containerHeight === 0 && containerWidth === 0) ||
      (containerHeight === previous.height && containerWidth === previous.width)
    ) {
      return
    }
    checkAndJumpToMiddle({ emitScroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerHeight, containerWidth])

  // 手势模式：非 passive 监听滚轮/触摸（需要 preventDefault）
  const handleWheelEventRef = useRef(handleWheelEvent)
  const dragRef = useRef(drag)
  handleWheelEventRef.current = handleWheelEvent
  dragRef.current = drag

  useEffect(() => {
    if (useNativeScroll) return
    const el = gestureRootRef.current
    if (!el) return

    const onWheel = (event: WheelEvent) => handleWheelEventRef.current(event)
    const onTouchStart = (event: TouchEvent) => dragRef.current.handleTouchStart(event)
    const onTouchMove = (event: TouchEvent) => dragRef.current.handleTouchMove(event)
    const onTouchEnd = () => dragRef.current.handleTouchEnd()
    const onMouseDown = (event: MouseEvent) => dragRef.current.handleMouseDown(event)
    const onMouseMove = (event: MouseEvent) => dragRef.current.handleMouseMove(event)
    const onMouseUp = () => dragRef.current.handleMouseUp()
    const onMouseLeave = () => dragRef.current.handleMouseLeave()

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { capture: true, passive: false })
    el.addEventListener('touchmove', onTouchMove, { capture: true, passive: false })
    el.addEventListener('touchend', onTouchEnd, { capture: true })
    el.addEventListener('touchcancel', onTouchEnd, { capture: true })
    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mouseleave', onMouseLeave)

    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart, true)
      el.removeEventListener('touchmove', onTouchMove, true)
      el.removeEventListener('touchend', onTouchEnd, true)
      el.removeEventListener('touchcancel', onTouchEnd, true)
      el.removeEventListener('mousedown', onMouseDown)
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseup', onMouseUp)
      el.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [useNativeScroll])

  const rootClass = [
    infiniteLoopScrollBase.root,
    disabled
      ? infiniteLoopScrollBase.rootDisabled
      : readonly
        ? infiniteLoopScrollBase.rootReadonly
        : infiniteLoopScrollBase.rootNormal,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const getItemStyle = (item: {
    top: number
    left: number
    height: number
    width: number
  }): CSSProperties =>
    calculateItemStyle(item, direction) as unknown as CSSProperties

  const renderItem = (item: LoopItem & {
    top: number
    left: number
    height: number
    width: number
  }) => (
    <div key={item.key} className={infiniteLoopScrollBase.item} style={getItemStyle(item)}>
      {children?.({
        item: item.data,
        index: item.originalIndex,
        disabled,
        readonly,
      })}
    </div>
  )

  return (
    <div className={rootClass} {...rest}>
      {useNativeScroll ? (
        <CwDiv
          ref={cwDivRef}
          className="h-full w-full"
          viewportClass="[overflow-anchor:none]"
          hideScrollbar={!showScrollbar}
          persistScrollbar={showScrollbar}
          scrollbarMap={scrollbarMap}
          onScrollbarSeek={onScrollbarSeek}
          onScroll={handleNativeScroll}
        >
          <div className="relative" style={contentSizeStyle}>
            {visibleItems.map((item) => renderItem(item))}
          </div>
        </CwDiv>
      ) : (
        <div
          ref={gestureRootRef}
          className={[infiniteLoopScrollBase.rootSnap, 'h-full w-full']
            .filter(Boolean)
            .join(' ')}
        >
          <div className={infiniteLoopScrollBase.container}>
            <div
              ref={contentRef}
              className={infiniteLoopScrollBase.content}
              style={{
                height: direction === 'horizontal' ? '100%' : `${paddedHeight}px`,
                width: direction === 'vertical' ? '100%' : `${paddedWidth}px`,
                transform: contentTransform,
              }}
            >
              {visibleItems.map((item) => renderItem(item))}
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className={infiniteLoopScrollBase.empty}>
          {emptySlot ?? (
            <div className={infiniteLoopScrollBase.emptyContent}>
              <span className={infiniteLoopScrollBase.emptyText}>{texts.empty}</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
})

export default CwInfiniteLoopScroll
