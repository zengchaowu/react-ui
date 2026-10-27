import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type UIEvent as ReactUIEvent,
} from 'react'
import CwDiv, { type CwDivHandle } from '../CwDiv/CwDiv'
import { resolveCwDivViewport } from '../CwDiv/resolveCwDivViewport'
import CwLoading from '../CwLoading/CwLoading'
import type { CwPullRefreshScrollComponentProps, CwPullRefreshScrollHandle } from './types'
import type { CwPullRefreshScrollTexts } from '@zengchaowu/ui-shared/components/CwPullRefreshScroll/types'
import { pullRefreshScrollBase } from '@zengchaowu/ui-shared/components/CwPullRefreshScroll/styles'
import { defaultCwPullRefreshScrollTexts } from '@zengchaowu/ui-shared/components/CwPullRefreshScroll/texts'
import {
  dampPullDistance,
  pullIndicatorHeight,
  resolvePullPhase,
  shouldTriggerLoadMore,
} from '@zengchaowu/ui-shared/components/CwPullRefreshScroll/functions'

export const CwPullRefreshScroll = forwardRef<
  CwPullRefreshScrollHandle,
  CwPullRefreshScrollComponentProps
>(function CwPullRefreshScroll(
  {
    refreshDisabled = false,
    loadMoreDisabled = false,
    refreshing: controlledRefreshing,
    loadingMore: controlledLoadingMore,
    hasMore = true,
    pullThreshold = 56,
    maxPullDistance = 120,
    loadMoreThreshold = 80,
    onRefresh,
    onLoadMore,
    showScrollbar = false,
    texts: textsProp,
    onRefreshingChange,
    onLoadingMoreChange,
    onScroll,
    children,
    footerSlot,
    className,
    ...rest
  },
  ref,
) {
  const texts: CwPullRefreshScrollTexts = {
    ...defaultCwPullRefreshScrollTexts,
    ...(textsProp ?? {}),
  }

  const divRef = useRef<CwDivHandle>(null)
  const [viewportEl, setViewportEl] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    setViewportEl(resolveCwDivViewport(divRef.current))
  }, [])

  const [internalRefreshing, setInternalRefreshing] = useState(false)
  const [internalLoadingMore, setInternalLoadingMore] = useState(false)

  const refreshingResolved = controlledRefreshing ?? internalRefreshing
  const loadingMoreResolved = controlledLoadingMore ?? internalLoadingMore

  const [pullDistance, setPullDistance] = useState(0)
  const pullDistanceRef = useRef(0)
  const gestureTracking = useRef(false)
  const gestureStartY = useRef(0)
  const activePointerId = useRef<number | null>(null)
  const loadMoreLocked = useRef(false)

  const updatePullDistance = useCallback((next: number) => {
    pullDistanceRef.current = next
    setPullDistance(next)
  }, [])

  const getViewport = useCallback(
    () =>
      divRef.current?.viewport ??
      resolveCwDivViewport(divRef.current),
    [],
  )

  // 事件监听挂原生 DOM，用 ref 拿最新 props，避免频繁重绑
  const latestRef = useRef({
    refreshDisabled,
    refreshingResolved,
    loadingMoreResolved,
    maxPullDistance,
    pullThreshold,
    hasMore,
    loadMoreDisabled,
    loadMoreThreshold,
    controlledRefreshing,
    controlledLoadingMore,
    onRefresh,
    onLoadMore,
    onScroll,
    onRefreshingChange,
    onLoadingMoreChange,
  })
  latestRef.current = {
    refreshDisabled,
    refreshingResolved,
    loadingMoreResolved,
    maxPullDistance,
    pullThreshold,
    hasMore,
    loadMoreDisabled,
    loadMoreThreshold,
    controlledRefreshing,
    controlledLoadingMore,
    onRefresh,
    onLoadMore,
    onScroll,
    onRefreshingChange,
    onLoadingMoreChange,
  }

  const setRefreshing = useCallback((next: boolean) => {
    const current = latestRef.current
    if (current.controlledRefreshing === undefined) setInternalRefreshing(next)
    current.onRefreshingChange?.(next)
  }, [])

  const setLoadingMore = useCallback((next: boolean) => {
    const current = latestRef.current
    if (current.controlledLoadingMore === undefined) setInternalLoadingMore(next)
    current.onLoadingMoreChange?.(next)
  }, [])

  const finishRefresh = useCallback(() => {
    setRefreshing(false)
    updatePullDistance(0)
  }, [setRefreshing, updatePullDistance])

  const finishLoadMore = useCallback(() => {
    setLoadingMore(false)
    loadMoreLocked.current = false
  }, [setLoadingMore])

  const runRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await latestRef.current.onRefresh?.()
    } catch {
      if (latestRef.current.controlledRefreshing === undefined) finishRefresh()
      return
    }
    if (latestRef.current.controlledRefreshing === undefined) finishRefresh()
  }, [finishRefresh, setRefreshing])

  const runLoadMore = useCallback(async () => {
    const current = latestRef.current
    if (!current.hasMore || loadMoreLocked.current) return
    loadMoreLocked.current = true
    setLoadingMore(true)
    try {
      await current.onLoadMore?.()
    } catch {
      if (latestRef.current.controlledLoadingMore === undefined) finishLoadMore()
      return
    }
    if (latestRef.current.controlledLoadingMore === undefined) finishLoadMore()
  }, [finishLoadMore, setLoadingMore])

  const pinScrollThroughLayout = useCallback(
    (run?: () => void) => {
      const viewport = getViewport()
      const top = viewport?.scrollTop ?? 0
      run?.()
      if (typeof requestAnimationFrame === 'undefined') return
      requestAnimationFrame(() => {
        if (!viewport) return
        if (Math.abs(viewport.scrollTop - top) > 0.5) {
          viewport.scrollTop = top
        }
      })
    },
    [getViewport],
  )

  const releaseGesturePointer = useCallback((viewport: HTMLElement | null) => {
    if (activePointerId.current == null || !viewport) {
      activePointerId.current = null
      return
    }
    try {
      if (viewport.hasPointerCapture(activePointerId.current)) {
        viewport.releasePointerCapture(activePointerId.current)
      }
    } catch {
      // ignore
    }
    activePointerId.current = null
  }, [])

  const onPointerDown = useCallback(
    (event: PointerEvent) => {
      const current = latestRef.current
      if (current.refreshDisabled || current.refreshingResolved) return
      if (event.pointerType === 'mouse' && event.button !== 0) return
      const viewport = getViewport()
      if (!viewport || viewport.scrollTop > 0) return
      gestureTracking.current = true
      gestureStartY.current = event.clientY
      activePointerId.current = event.pointerId
      viewport.setPointerCapture(event.pointerId)
    },
    [getViewport],
  )

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const current = latestRef.current
      if (
        !gestureTracking.current ||
        activePointerId.current !== event.pointerId ||
        current.refreshDisabled ||
        current.refreshingResolved
      ) {
        return
      }
      const viewport = getViewport()
      if (!viewport || viewport.scrollTop > 0) {
        updatePullDistance(0)
        return
      }
      const deltaY = event.clientY - gestureStartY.current
      const next = dampPullDistance(deltaY, current.maxPullDistance)
      if (next > 0) {
        event.preventDefault()
      }
      updatePullDistance(next)
    },
    [getViewport, updatePullDistance],
  )

  const onPointerUp = useCallback(
    (event: PointerEvent) => {
      if (!gestureTracking.current || activePointerId.current !== event.pointerId) return
      gestureTracking.current = false
      releaseGesturePointer(getViewport())
      const current = latestRef.current
      if (current.refreshDisabled || current.refreshingResolved) {
        updatePullDistance(0)
        return
      }
      if (pullDistanceRef.current >= current.pullThreshold) {
        void runRefresh()
        return
      }
      updatePullDistance(0)
    },
    [getViewport, releaseGesturePointer, runRefresh, updatePullDistance],
  )

  const onViewportScroll = useCallback(
    (event: ReactUIEvent<HTMLDivElement>) => {
      latestRef.current.onScroll?.(event)
      const viewport = getViewport()
      if (!viewport) return
      const current = latestRef.current
      if (
        current.loadMoreDisabled ||
        current.loadingMoreResolved ||
        !current.hasMore ||
        loadMoreLocked.current
      ) {
        return
      }
      if (
        shouldTriggerLoadMore(
          viewport.scrollTop,
          viewport.scrollHeight,
          viewport.clientHeight,
          current.loadMoreThreshold,
        )
      ) {
        void runLoadMore()
      }
    },
    [getViewport, runLoadMore],
  )

  useEffect(() => {
    if (!refreshingResolved) updatePullDistance(0)
  }, [refreshingResolved, updatePullDistance])

  useEffect(() => {
    if (!loadingMoreResolved) loadMoreLocked.current = false
    // loading 条显隐时钉住视口，避免 Safari 弱 scroll anchoring 下沉
    pinScrollThroughLayout()
  }, [loadingMoreResolved, pinScrollThroughLayout])

  useEffect(() => {
    pinScrollThroughLayout()
  }, [hasMore, pinScrollThroughLayout])

  useEffect(() => {
    if (!viewportEl) return
    const onMove = (event: Event) => onPointerMove(event as PointerEvent)
    const onUp = (event: Event) => onPointerUp(event as PointerEvent)
    viewportEl.addEventListener('pointerdown', onPointerDown)
    viewportEl.addEventListener('pointermove', onMove, { passive: false })
    viewportEl.addEventListener('pointerup', onUp)
    viewportEl.addEventListener('pointercancel', onUp)
    viewportEl.style.touchAction = 'pan-y'
    return () => {
      releaseGesturePointer(viewportEl)
      viewportEl.removeEventListener('pointerdown', onPointerDown)
      viewportEl.removeEventListener('pointermove', onMove)
      viewportEl.removeEventListener('pointerup', onUp)
      viewportEl.removeEventListener('pointercancel', onUp)
    }
  }, [viewportEl, onPointerDown, onPointerMove, onPointerUp, releaseGesturePointer])

  const scrollTo = (options: ScrollToOptions) => {
    divRef.current?.scrollTo(options)
  }

  const scrollBy = (options: ScrollToOptions) => {
    divRef.current?.scrollBy(options)
  }

  const scrollToBottom = () => {
    const viewport = getViewport()
    if (!viewport) return
    viewport.scrollTop = viewport.scrollHeight
  }

  useImperativeHandle(ref, () => ({
    get el() {
      return divRef.current?.el ?? undefined
    },
    get viewport() {
      return getViewport() ?? undefined
    },
    scrollTo,
    scrollBy,
    scrollToBottom,
    finishRefresh,
    finishLoadMore,
  }))

  const pullPhase = resolvePullPhase(pullDistance, pullThreshold, refreshingResolved)
  const pullIndicatorVisible = pullPhase !== 'idle' || refreshingResolved
  const pullIndicatorStyle = {
    height: `${pullIndicatorHeight(pullDistance, refreshingResolved, pullThreshold)}px`,
  }
  const pullStatusText =
    pullPhase === 'refreshing'
      ? texts.refreshing
      : pullPhase === 'ready'
        ? texts.release
        : texts.pull

  /** 开启触底加载时始终渲染 footer 占位，避免挂载/卸载造成底部高度跳变 */
  const showFooter = !loadMoreDisabled
  const footerContentVisible = loadingMoreResolved || !hasMore

  const rootClass = [pullRefreshScrollBase.root, className].filter(Boolean).join(' ')

  return (
    <div {...rest} className={rootClass}>
      <CwDiv
        ref={divRef}
        className={pullRefreshScrollBase.scroll}
        hideScrollbar={!showScrollbar}
        persistScrollbar={showScrollbar}
        onScroll={onViewportScroll}
      >
        <div
          className={[
            pullRefreshScrollBase.pullIndicator,
            pullIndicatorVisible
              ? pullRefreshScrollBase.pullIndicatorActive
              : pullRefreshScrollBase.pullIndicatorHidden,
          ]
            .filter(Boolean)
            .join(' ')}
          style={pullIndicatorStyle}
          aria-live="polite"
        >
          {refreshingResolved ? <CwLoading type="spinner" size="small" /> : null}
          <span className={pullRefreshScrollBase.pullText}>{pullStatusText}</span>
        </div>

        <div className={pullRefreshScrollBase.content}>{children}</div>

        {/* 触底加载开启时始终占位，避免 Safari 在底部插入加载条时视口下沉 */}
        {showFooter ? (
          <div
            className={[
              pullRefreshScrollBase.footer,
              !footerContentVisible ? pullRefreshScrollBase.footerHidden : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-live="polite"
          >
            {footerSlot ?? (
              <>
                {loadingMoreResolved ? (
                  <CwLoading type="spinner" size="small" />
                ) : !hasMore ? (
                  <span className={pullRefreshScrollBase.footerText}>{texts.noMore}</span>
                ) : (
                  <span className={pullRefreshScrollBase.footerText} aria-hidden="true">
                    {'\u00a0'}
                  </span>
                )}
              </>
            )}
          </div>
        ) : null}
      </CwDiv>
    </div>
  )
})

export default CwPullRefreshScroll
