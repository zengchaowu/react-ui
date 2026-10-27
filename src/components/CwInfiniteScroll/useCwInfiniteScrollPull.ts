import { useCallback, useEffect, useLayoutEffect, useRef, type MutableRefObject } from 'react'
import {
  CW_INFINITE_SCROLL_DEFAULT_CLIENT_HEIGHT_TRIGGER,
  CW_INFINITE_SCROLL_DEFAULT_SCROLL_TOP_TRIGGER,
} from '@zengchaowu/ui-shared/components/CwInfiniteScroll/constants'

export interface UseCwInfiniteScrollPullOptions {
  getContainer: () => HTMLElement | null
  getContent: () => HTMLElement | null
  scrollTopTrigger?: number
  clientHeightTrigger?: number
  pullDownEnabled?: boolean
  pullUpEnabled?: boolean
  triggerPullDown?: () => void | Promise<void>
  triggerPullUp?: () => void | Promise<void>
  onScroll?: (scrollTop: number, topOffset: number) => void
  onPullDownError?: (error: unknown) => void
  onPullUpError?: (error: unknown) => void
  /** @default true */
  attachOnMount?: boolean
}

/** 等列表 DOM 更新后再校正滚动位置（React 版 nextTick：微任务 + 一帧） */
function waitForDomUpdate(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'undefined') {
      resolve()
      return
    }
    queueMicrotask(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

async function runPull(
  loading: MutableRefObject<boolean>,
  task: () => void | Promise<void>,
  opts?: { afterSuccess?: () => void; onError?: (error: unknown) => void },
) {
  loading.current = true
  try {
    await task()
    await waitForDomUpdate()
    opts?.afterSuccess?.()
  } catch (error) {
    opts?.onError?.(error)
  } finally {
    loading.current = false
  }
}

/** 下拉/上拉加载与 prepend 后保持滚动位置（React 版） */
export function useCwInfiniteScrollPull(options: UseCwInfiniteScrollPullOptions) {
  const optionsRef = useRef(options)
  const latestScrollTop = useRef(0)
  const latestTopOffset = useRef(0)
  const previousScrollHeight = useRef(0)
  const pullDownLoading = useRef(false)
  const pullUpLoading = useRef(false)

  useLayoutEffect(() => {
    optionsRef.current = options
  })

  const maintainScrollPosition = useCallback(() => {
    const current = optionsRef.current
    const container = current.getContainer()
    const content = current.getContent()
    if (!container || !content) return
    let newScrollTop = latestScrollTop.current
    const heightDifference = content.scrollHeight - previousScrollHeight.current
    if (heightDifference <= 0) return
    newScrollTop = latestScrollTop.current + heightDifference
    if (Math.abs(container.scrollTop - newScrollTop) <= 0.5) {
      latestScrollTop.current = container.scrollTop
      return
    }
    container.scrollTop = newScrollTop
    latestScrollTop.current = newScrollTop
  }, [])

  const syncScrollMetrics = useCallback(() => {
    const current = optionsRef.current
    const container = current.getContainer()
    const content = current.getContent()
    if (!container || !content) return
    latestScrollTop.current = container.scrollTop
    latestTopOffset.current = content.scrollHeight - container.scrollTop
  }, [])

  const tryPullDown = useCallback(
    (
      currentScrollTop: number,
      scrollHeight: number,
      opts?: { forceUpIntent?: boolean },
    ) => {
      const current = optionsRef.current
      const scrollTopTrigger =
        current.scrollTopTrigger ?? CW_INFINITE_SCROLL_DEFAULT_SCROLL_TOP_TRIGGER
      const scrollingUp =
        opts?.forceUpIntent === true || latestScrollTop.current > currentScrollTop
      if (
        pullDownLoading.current ||
        current.pullDownEnabled === false ||
        !current.triggerPullDown ||
        currentScrollTop >= scrollTopTrigger ||
        !scrollingUp
      ) {
        return
      }
      previousScrollHeight.current = scrollHeight
      void runPull(pullDownLoading, current.triggerPullDown, {
        afterSuccess: maintainScrollPosition,
        onError: current.onPullDownError,
      })
    },
    [maintainScrollPosition],
  )

  const tryPullUp = useCallback(
    (
      currentScrollTop: number,
      scrollHeight: number,
      clientHeight: number,
      opts?: { forceDownIntent?: boolean },
    ) => {
      const current = optionsRef.current
      const clientHeightTrigger =
        current.clientHeightTrigger ?? CW_INFINITE_SCROLL_DEFAULT_CLIENT_HEIGHT_TRIGGER
      const nearBottom =
        scrollHeight - currentScrollTop - clientHeight < clientHeightTrigger
      const scrollingDown =
        opts?.forceDownIntent === true || latestScrollTop.current < currentScrollTop
      if (
        pullUpLoading.current ||
        current.pullUpEnabled === false ||
        !current.triggerPullUp ||
        !nearBottom ||
        !scrollingDown
      ) {
        return
      }
      void runPull(pullUpLoading, current.triggerPullUp, {
        onError: current.onPullUpError,
      })
    },
    [],
  )

  const handleScroll = useCallback(() => {
    const current = optionsRef.current
    const container = current.getContainer()
    const content = current.getContent()
    if (!container || !content) return

    const currentScrollTop = container.scrollTop
    const scrollHeight = content.scrollHeight
    const clientHeight = container.clientHeight

    tryPullDown(currentScrollTop, scrollHeight)
    tryPullUp(currentScrollTop, scrollHeight, clientHeight)

    latestScrollTop.current = currentScrollTop
    latestTopOffset.current = scrollHeight - currentScrollTop
    current.onScroll?.(latestScrollTop.current, latestTopOffset.current)
  }, [tryPullDown, tryPullUp])

  /**
   * 已在顶/底时，滚动位置不再变化，scroll 事件不会带方向。
   * 用 wheel 意图补一次：顶部继续上滑 → 下拉；底部继续下滑 → 上拉。
   */
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      const current = optionsRef.current
      const container = current.getContainer()
      const content = current.getContent()
      if (!container || !content) return

      const currentScrollTop = container.scrollTop
      const scrollHeight = content.scrollHeight
      const clientHeight = container.clientHeight

      if (event.deltaY < 0) {
        tryPullDown(currentScrollTop, scrollHeight, { forceUpIntent: true })
      } else if (event.deltaY > 0) {
        tryPullUp(currentScrollTop, scrollHeight, clientHeight, { forceDownIntent: true })
      }
    },
    [tryPullDown, tryPullUp],
  )

  const touchStartY = useRef(0)
  const touchStartScrollTop = useRef(0)

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0]
    if (!touch) return
    touchStartY.current = touch.clientY
    touchStartScrollTop.current = optionsRef.current.getContainer()?.scrollTop ?? 0
  }, [])

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      const touch = event.touches[0]
      const current = optionsRef.current
      const container = current.getContainer()
      const content = current.getContent()
      if (!touch || !container || !content) return

      const deltaY = touch.clientY - touchStartY.current
      const currentScrollTop = container.scrollTop
      const scrollHeight = content.scrollHeight
      const clientHeight = container.clientHeight

      // 顶边下拉（手指下移）
      if (deltaY > 12 && touchStartScrollTop.current < 1 && currentScrollTop < 1) {
        tryPullDown(currentScrollTop, scrollHeight, { forceUpIntent: true })
        return
      }
      // 底边上拉（手指上移）
      const atBottom = scrollHeight - currentScrollTop - clientHeight < 1
      if (deltaY < -12 && atBottom) {
        tryPullUp(currentScrollTop, scrollHeight, clientHeight, { forceDownIntent: true })
      }
    },
    [tryPullDown, tryPullUp],
  )

  const attach = useCallback(() => {
    const container = optionsRef.current.getContainer()
    if (!container) return
    container.addEventListener('scroll', handleScroll, { passive: true })
    container.addEventListener('wheel', handleWheel, { passive: true })
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
  }, [handleScroll, handleWheel, handleTouchStart, handleTouchMove])

  const detach = useCallback(() => {
    const container = optionsRef.current.getContainer()
    if (!container) return
    container.removeEventListener('scroll', handleScroll)
    container.removeEventListener('wheel', handleWheel)
    container.removeEventListener('touchstart', handleTouchStart)
    container.removeEventListener('touchmove', handleTouchMove)
  }, [handleScroll, handleWheel, handleTouchStart, handleTouchMove])

  const attachOnMount = options.attachOnMount !== false

  useEffect(() => {
    if (!attachOnMount) {
      queueMicrotask(syncScrollMetrics)
      return
    }
    queueMicrotask(() => {
      attach()
      syncScrollMetrics()
    })
    return detach
  }, [attachOnMount, attach, detach, syncScrollMetrics])

  return {
    latestScrollTop,
    latestTopOffset,
    pullDownLoading,
    pullUpLoading,
    maintainScrollPosition,
    handleScroll,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    attach,
    detach,
    syncScrollMetrics,
  }
}
