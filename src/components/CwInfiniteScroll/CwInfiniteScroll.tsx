import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import CwDiv, { type CwDivHandle } from '../CwDiv/CwDiv'
import {
  resolveCwDivContent,
  resolveCwDivViewport,
} from '../CwDiv/resolveCwDivViewport'
import type {
  CwInfiniteScrollComponentProps,
  CwInfiniteScrollHandle,
} from './types'
import { infiniteScrollBase } from './styles'
import {
  CW_INFINITE_SCROLL_DEFAULT_CLIENT_HEIGHT_TRIGGER,
  CW_INFINITE_SCROLL_DEFAULT_SCROLL_TOP_TRIGGER,
} from '@zengchaowu/ui-shared/components/CwInfiniteScroll/constants'
import { useCwInfiniteScrollPull } from './useCwInfiniteScrollPull'
import { scrollViewportToBottom } from './scrollViewport'

export const CwInfiniteScroll = forwardRef<CwInfiniteScrollHandle, CwInfiniteScrollComponentProps>(
  function CwInfiniteScroll(
    {
      pullDownEnabled = true,
      pullUpEnabled = true,
      triggerPullDown,
      triggerPullUp,
      scrollTopTrigger = CW_INFINITE_SCROLL_DEFAULT_SCROLL_TOP_TRIGGER,
      clientHeightTrigger = CW_INFINITE_SCROLL_DEFAULT_CLIENT_HEIGHT_TRIGGER,
      showScrollbar = false,
      texts: _texts,
      children,
      className,
      onPullDown,
      onPullUp,
      onScroll,
      onError,
      ...rest
    },
    ref,
  ) {
    const cwDivRef = useRef<CwDivHandle>(null)
    const [viewportEl, setViewportEl] = useState<HTMLElement | null>(null)

    useLayoutEffect(() => {
      setViewportEl(resolveCwDivViewport(cwDivRef.current))
    }, [])

    const getScrollViewport = () => resolveCwDivViewport(cwDivRef.current)
    const getScrollContent = () => resolveCwDivContent(getScrollViewport())

    const {
      latestScrollTop,
      latestTopOffset,
      maintainScrollPosition,
      attach,
      detach,
      syncScrollMetrics,
    } = useCwInfiniteScrollPull({
      getContainer: getScrollViewport,
      getContent: getScrollContent,
      scrollTopTrigger,
      clientHeightTrigger,
      pullDownEnabled,
      pullUpEnabled,
      // viewport 要等 CwDiv 挂载；自行 attach，避免只绑 @scroll 丢了顶/底 wheel 意图
      attachOnMount: false,
      triggerPullDown: async () => {
        if (triggerPullDown) {
          await triggerPullDown()
          return
        }
        onPullDown?.()
      },
      triggerPullUp: async () => {
        if (triggerPullUp) {
          await triggerPullUp()
          return
        }
        onPullUp?.()
      },
      onScroll,
      onPullDownError: (error) => onError?.({ type: 'pullDown', error }),
      onPullUpError: (error) => onError?.({ type: 'pullUp', error }),
    })

    useEffect(() => {
      attach()
      syncScrollMetrics()
      return detach
    }, [attach, detach, syncScrollMetrics, viewportEl])

    const scrollToBottom = () => {
      const el = getScrollViewport()
      if (el) {
        scrollViewportToBottom(el)
        return
      }
      if (typeof requestAnimationFrame === 'undefined') return
      requestAnimationFrame(() => {
        const deferred = getScrollViewport()
        if (deferred) scrollViewportToBottom(deferred)
      })
    }

    const getTopOffset = () => latestTopOffset.current

    const setTopOffset = (topOffset: number) => {
      if (typeof requestAnimationFrame === 'undefined') return
      requestAnimationFrame(() => {
        const el = getScrollViewport()
        if (el) el.scrollTop = el.scrollHeight - topOffset
      })
    }

    const getScrollTop = () => latestScrollTop.current

    const setScrollTop = (scrollTop: number) => {
      if (typeof requestAnimationFrame === 'undefined') return
      requestAnimationFrame(() => {
        const el = getScrollViewport()
        if (el) el.scrollTop = scrollTop
      })
    }

    const getContainer = () => getScrollViewport()
    const getContent = () => getScrollContent()

    useImperativeHandle(ref, () => ({
      getContainer,
      getContent,
      scrollToBottom,
      getTopOffset,
      setTopOffset,
      getScrollTop,
      setScrollTop,
      maintainScrollPosition,
    }))

    const rootClass = [infiniteScrollBase.root, className].filter(Boolean).join(' ')

    return (
      <CwDiv
        {...rest}
        ref={cwDivRef}
        className={rootClass}
        hideScrollbar={!showScrollbar}
        persistScrollbar={showScrollbar}
      >
        {children}
      </CwDiv>
    )
  },
)

export default CwInfiniteScroll
