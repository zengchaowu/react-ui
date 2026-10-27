import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { CSSProperties, HTMLAttributes } from 'react'
import type { CwWaterfallItem, CwWaterfallProps } from './types'
import { waterfallBase } from '@zengchaowu/ui-shared/components/CwWaterfall/styles'
import { defaultTexts } from '@zengchaowu/ui-shared/components/CwWaterfall/texts'
import { CwDiv } from '../CwDiv'
import type { CwDivHandle } from '../CwDiv'
import { CwLoading } from '../CwLoading'
import { resolveCwDivViewport } from '../CwDiv/resolveCwDivViewport'
import { getCurrentBreakpoint, type Breakpoint } from '@zengchaowu/ui-shared/components/CwRow/utils/breakpoint'

export interface CwWaterfallComponentProps
  extends CwWaterfallProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style'> {}

export function CwWaterfall({
  items,
  columnCount,
  columnGap = 16,
  rowGap = 16,
  breakpoints,
  itemKey = 'id',
  lazyLoad: _lazyLoad = true,
  infiniteScroll = true,
  threshold = 200,
  loading = false,
  finished = false,
  showScrollbar = false,
  texts: textsProp,
  children,
  loadingSlot,
  emptySlot,
  finishedSlot,
  onLoadMore,
  onItemClick,
  className,
  ...rest
}: CwWaterfallComponentProps) {
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const cwDivRef = useRef<CwDivHandle>(null)
  const waterfallContainerRef = useRef<HTMLDivElement | null>(null)
  const observerTargetRef = useRef<HTMLDivElement | null>(null)

  const [containerWidth, setContainerWidth] = useState(0)
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>(() =>
    getCurrentBreakpoint(),
  )
  const [columns, setColumns] = useState<CwWaterfallItem[][]>([])

  const scrollPositionRef = useRef(0)
  const containerWidthRef = useRef(0)
  const breakpointRef = useRef<Breakpoint>(currentBreakpoint)
  const layoutRef = useRef<() => void>(() => {})
  const restoreScrollPositionRef = useRef<() => void>(() => {})

  const effectiveColumnCount = useMemo(() => {
    if (columnCount) return columnCount
    return breakpoints?.[currentBreakpoint] || 1
  }, [columnCount, breakpoints, currentBreakpoint])

  const containerStyle: CSSProperties = useMemo(
    () => ({ gap: `${columnGap}px` }),
    [columnGap],
  )
  const columnStyle: CSSProperties = useMemo(
    () => ({ flex: '1 1 0%', minWidth: 0 }),
    [],
  )

  const getScrollViewport = useCallback(
    () => resolveCwDivViewport(cwDivRef.current),
    [],
  )

  const getItemKey = useCallback(
    (item: CwWaterfallItem) => {
      const value = item[itemKey]
      return value ? String(value) : JSON.stringify(item)
    },
    [itemKey],
  )

  const getItemOriginalIndex = useCallback(
    (currentColumns: CwWaterfallItem[][], columnIndex: number, itemIndex: number) => {
      let index = 0
      for (let i = 0; i < columnIndex; i++) {
        index += currentColumns[i]?.length ?? 0
      }
      return index + itemIndex
    },
    [],
  )

  const initWaterfallLayout = useCallback(() => {
    if (!items.length) {
      setColumns([])
      return
    }

    const count = effectiveColumnCount
    const newColumns: CwWaterfallItem[][] = Array.from({ length: count }, () => [])
    const columnHeights = Array<number>(count).fill(0)

    items.forEach((item) => {
      let shortestColumnIndex = 0
      let shortestColumnHeight = columnHeights[0]

      for (let i = 1; i < count; i++) {
        if (columnHeights[i] < shortestColumnHeight) {
          shortestColumnIndex = i
          shortestColumnHeight = columnHeights[i]
        }
      }

      newColumns[shortestColumnIndex].push(item)

      let estimatedHeight = 100
      if (typeof item === 'object' && item !== null) {
        if (item.height) {
          estimatedHeight = Number(item.height) || 0
        } else if (item.content) {
          estimatedHeight = String(item.content).length * 0.5
        }
      }

      columnHeights[shortestColumnIndex] += estimatedHeight + rowGap
    })

    setColumns(newColumns)
  }, [items, effectiveColumnCount, rowGap])

  const restoreScrollPosition = useCallback(() => {
    const viewport = getScrollViewport()
    if (!viewport) return
    viewport.scrollTop = scrollPositionRef.current
  }, [getScrollViewport])

  /** 钉住当前滚动位置，避免 Safari 在底部插入节点后把视口跟着下沉 */
  const pinScrollThroughLayout = useCallback(
    (run: () => void) => {
      const viewport = getScrollViewport()
      const top = viewport?.scrollTop ?? 0
      run()
      requestAnimationFrame(() => {
        if (!viewport) return
        if (Math.abs(viewport.scrollTop - top) > 0.5) {
          viewport.scrollTop = top
        }
      })
    },
    [getScrollViewport],
  )

  // 初始化布局 + ResizeObserver + 首次无限滚动监听
  useEffect(() => {
    initWaterfallLayout()

    const container = waterfallContainerRef.current
    if (!container) return

    let disposed = false
    let observer: ResizeObserver | null = null

    setContainerWidth(container.getBoundingClientRect().width)

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target !== container || disposed) continue

          const nextWidth = entry.contentRect.width
          const previousWidth = containerWidthRef.current
          const widthChanged = Math.abs(nextWidth - previousWidth) >= 1
          const oldBreakpoint = breakpointRef.current
          const nextBreakpoint = getCurrentBreakpoint()
          const breakpointChanged = oldBreakpoint !== nextBreakpoint

          // 仅宽/断点变化才重排
          if (!widthChanged && !breakpointChanged) return

          containerWidthRef.current = nextWidth
          setContainerWidth(nextWidth)

          if (breakpointChanged) {
            breakpointRef.current = nextBreakpoint
            setCurrentBreakpoint(nextBreakpoint)
            const viewport = getScrollViewport()
            scrollPositionRef.current = viewport?.scrollTop ?? 0
          }

          if (breakpointChanged) {
            setColumns([])
            requestAnimationFrame(() => {
              layoutRef.current()
              requestAnimationFrame(() => restoreScrollPositionRef.current())
            })
          } else {
            layoutRef.current()
          }
        }
      })
      observer.observe(container)
    }

    return () => {
      disposed = true
      observer?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  containerWidthRef.current = containerWidth
  breakpointRef.current = currentBreakpoint
  layoutRef.current = initWaterfallLayout
  restoreScrollPositionRef.current = restoreScrollPosition

  // items 变化重新排布
  useEffect(() => {
    initWaterfallLayout()
  }, [initWaterfallLayout])

  // 加载条挂上瞬间：钉住 scrollTop，抵消 Safari 对底部插入的锚定下沉
  const previousLoadingRef = useRef(loading)
  useEffect(() => {
    const wasLoading = previousLoadingRef.current
    previousLoadingRef.current = loading
    if (!loading || wasLoading) return
    pinScrollThroughLayout(() => {})
  }, [loading, pinScrollThroughLayout])

  // 列数变化：先清空，再重排并恢复滚动位置
  const previousColumnCountRef = useRef(effectiveColumnCount)
  useEffect(() => {
    if (previousColumnCountRef.current === effectiveColumnCount) return
    previousColumnCountRef.current = effectiveColumnCount

    const viewport = getScrollViewport()
    scrollPositionRef.current = viewport?.scrollTop ?? 0
    setColumns([])
    requestAnimationFrame(() => {
      initWaterfallLayout()
      requestAnimationFrame(restoreScrollPosition)
    })
  }, [effectiveColumnCount, getScrollViewport, initWaterfallLayout, restoreScrollPosition])

  // 无限滚动监听
  useEffect(() => {
    if (!infiniteScroll || !observerTargetRef.current) return

    const root = getScrollViewport()
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !loading && !finished) {
          onLoadMore?.()
        }
      },
      {
        root,
        rootMargin: `0px 0px ${threshold}px 0px`,
      },
    )

    observer.observe(observerTargetRef.current)
    return () => observer.disconnect()
  }, [infiniteScroll, finished, loading, threshold, onLoadMore, getScrollViewport])

  const rootClass = [waterfallBase.root, loading ? waterfallBase.rootLoading : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <CwDiv
      ref={cwDivRef}
      className={rootClass}
      hideScrollbar={!showScrollbar}
      persistScrollbar={showScrollbar}
      {...rest}
    >
      <div ref={waterfallContainerRef} className={waterfallBase.inner}>
        <div className={waterfallBase.container} style={containerStyle}>
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className={waterfallBase.column} style={columnStyle}>
              {column.map((item, itemIndex) => (
                <div
                  key={getItemKey(item)}
                  className={waterfallBase.item}
                  style={{ marginBottom: `${rowGap}px` }}
                  onClick={() =>
                    onItemClick?.(
                      item,
                      getItemOriginalIndex(columns, columnIndex, itemIndex),
                    )
                  }
                >
                  {children?.({
                    item,
                    index: getItemOriginalIndex(columns, columnIndex, itemIndex),
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* overflow-anchor:none：Safari 在底部插入加载条时勿把视口跟着「沉」下去 */}
        {loading ? (
          <div className={waterfallBase.loading}>
            {loadingSlot ?? (
              <div className={waterfallBase.loadingContent}>
                <CwLoading type="spinner" size="small" />
                <span className={waterfallBase.loadingText}>{texts.loading}</span>
              </div>
            )}
          </div>
        ) : null}

        {items.length === 0 && !loading ? (
          <div className={waterfallBase.empty}>
            {emptySlot ?? (
              <div className={waterfallBase.emptyContent}>
                <span className={waterfallBase.emptyIcon}>📭</span>
                <span className={waterfallBase.emptyText}>{texts.empty}</span>
              </div>
            )}
          </div>
        ) : null}

        {finished && !loading && items.length > 0 ? (
          <div className={waterfallBase.finished}>
            {finishedSlot ?? (
              <div className={waterfallBase.finishedContent}>
                <span className={waterfallBase.finishedText}>{texts.finished}</span>
              </div>
            )}
          </div>
        ) : null}

        {infiniteScroll && !finished ? (
          <div
            ref={observerTargetRef}
            className="h-1 [overflow-anchor:none]"
            aria-hidden="true"
          />
        ) : null}
      </div>
    </CwDiv>
  )
}

export default CwWaterfall
