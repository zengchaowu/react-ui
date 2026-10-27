import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type ReactElement,
  type Ref,
} from 'react'
import CwDiv, { type CwDivHandle } from '../CwDiv/CwDiv'
import { resolveCwDivViewport } from '../CwDiv/resolveCwDivViewport'
import type {
  CwVirtualScrollComponentProps,
  CwVirtualScrollHandle,
  CwVirtualScrollItem,
  CwVirtualScrollItemRenderArgs,
} from './types'
import { virtualScrollBase } from '@zengchaowu/ui-shared/components/CwVirtualScroll/styles'
import { defaultTexts } from './texts'
import { useContainerSize, useItemPositions, useScrollPosition, usePadding, useTotalSize, useVisibleRange, useVirtualScrollWatchers } from './hooks'
import { calculateItemStyle, normalizePadding } from './functions'
import { EMPTY_VIRTUAL_WINDOW, getVirtualContentSize, getVirtualWindow, scrollOffsetForIndex } from './virtual-scroll'

function itemMatchesFixedSize(
  item: { height?: number; width?: number },
  dir: string,
  h: number,
  w: number,
): boolean {
  if (dir === 'horizontal') return item.width == null || item.width === w
  if (dir === 'vertical') return item.height == null || item.height === h
  return (
    (item.height == null || item.height === h) &&
    (item.width == null || item.width === w)
  )
}

function CwVirtualScrollInner<TData = unknown>(
  props: CwVirtualScrollComponentProps<TData>,
  ref: ForwardedRef<CwVirtualScrollHandle>,
) {
  const {
    items,
    itemHeight = 50,
    itemWidth = 200,
    bufferSize = 8,
    direction = 'vertical',
    disabled = false,
    readonly = false,
    showScrollbar = true,
    padding = 0,
    texts: textsProp,
    emptySlot,
    children,
    className,
    style,
    onScroll,
    onVisibleChange,
    ...rest
  } = props

  const resolvedTexts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )

  const cwDivRef = useRef<CwDivHandle>(null)
  const applyingProgrammaticScrollRef = useRef(false)
  const [viewportEl, setViewportEl] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    setViewportEl(resolveCwDivViewport(cwDivRef.current))
  }, [])

  const isHorizontal = direction === 'horizontal'
  const isVertical = direction === 'vertical'

  const isFixedSize = useMemo(() => {
    const list = items
    if (list.length === 0) return true
    const dir = direction
    const h = itemHeight
    const w = itemWidth
    if (list.length <= 10_000) {
      return list.every((item) => itemMatchesFixedSize(item, dir, h, w))
    }
    const mid = Math.floor(list.length / 2)
    return [0, 1, mid, list.length - 2, list.length - 1].every((i) => {
      const item = list[i]
      return item != null && itemMatchesFixedSize(item, dir, h, w)
    })
  }, [items, direction, itemHeight, itemWidth])

  const { containerHeight, containerWidth } = useContainerSize(viewportEl)

  const paddingValues = useMemo(() => normalizePadding(padding), [padding])
  const mainPadStart = isHorizontal ? paddingValues.left : paddingValues.top
  const mainPadEnd = isHorizontal ? paddingValues.right : paddingValues.bottom

  const primaryItemSize = isHorizontal ? itemWidth : itemHeight
  const primaryContainerSize = isHorizontal ? containerWidth : containerHeight
  const itemCount = items.length

  const emptyItems = useMemo<CwVirtualScrollItem<TData>[]>(() => [], [])
  /** 固定尺寸时不喂全量 items，避免再建百万 position / 每帧算变高窗口 */
  const itemsForVariable = isFixedSize ? emptyItems : items

  const { itemPositions: rawItemPositions } = useItemPositions(
    itemsForVariable,
    direction,
    itemHeight,
    itemWidth,
  )

  const { totalHeight: rawTotalHeight, totalWidth: rawTotalWidth } = useTotalSize(
    rawItemPositions,
    direction,
    containerHeight,
    containerWidth,
    itemHeight,
    itemWidth,
  )

  const {
    itemPositions: variableItemPositions,
    totalHeight: variableTotalHeight,
    totalWidth: variableTotalWidth,
  } = usePadding(padding, rawItemPositions, rawTotalHeight, rawTotalWidth)

  const fixedNaturalMain = useMemo(
    () => getVirtualContentSize(itemCount, primaryItemSize),
    [itemCount, primaryItemSize],
  )

  const fixedTotalHeight = useMemo(() => {
    if (isHorizontal) return Math.max(containerHeight, itemHeight)
    return paddingValues.top + fixedNaturalMain + paddingValues.bottom
  }, [isHorizontal, containerHeight, itemHeight, paddingValues, fixedNaturalMain])

  const fixedTotalWidth = useMemo(() => {
    if (isVertical) return Math.max(containerWidth, itemWidth)
    if (direction === 'both') return paddingValues.left + itemWidth + paddingValues.right
    return paddingValues.left + fixedNaturalMain + paddingValues.right
  }, [isVertical, direction, containerWidth, itemWidth, paddingValues, fixedNaturalMain])

  const totalHeight = isFixedSize ? fixedTotalHeight : variableTotalHeight
  const totalWidth = isFixedSize ? fixedTotalWidth : variableTotalWidth

  const {
    scrollTop,
    scrollLeft,
    setScrollTop,
    setScrollLeft,
    updateScrollPositionDirect,
  } = useScrollPosition({
    direction,
    totalHeight,
    totalWidth,
    containerHeight,
    containerWidth,
    onScroll,
  })

  const primaryScrollOffset = isHorizontal ? scrollLeft : scrollTop
  const scrollForFixedWindow = Math.max(0, primaryScrollOffset - mainPadStart)

  const fixedWindow = useMemo(
    () =>
      isFixedSize
        ? getVirtualWindow(
            itemCount,
            primaryItemSize,
            scrollForFixedWindow,
            primaryContainerSize,
            bufferSize,
          )
        : EMPTY_VIRTUAL_WINDOW,
    [isFixedSize, itemCount, primaryItemSize, scrollForFixedWindow, primaryContainerSize, bufferSize],
  )

  const primaryOffsetStart = fixedWindow.offsetStart + mainPadStart
  const primaryOffsetEnd = fixedWindow.offsetEnd + mainPadEnd

  const fixedVisibleItems = useMemo(() => {
    const { startIndex, endIndex } = fixedWindow
    const out: Array<{ key: string | number; index: number; data: TData }> = []
    if (startIndex < 0 || endIndex < startIndex) return out
    for (let i = startIndex; i <= endIndex; i += 1) {
      const item = items[i]
      if (!item) continue
      out.push({ key: item.key, index: i, data: item.data })
    }
    return out
  }, [fixedWindow, items])

  const fixedContentStyle = useMemo<CSSProperties>(() => {
    if (isHorizontal) {
      return {
        width: `${totalWidth}px`,
        height: '100%',
        minHeight: '100%',
      }
    }
    return {
      height: `${totalHeight}px`,
      width: direction === 'both' ? `${totalWidth}px` : '100%',
    }
  }, [isHorizontal, totalWidth, totalHeight, direction])

  const fixedItemStyle = useMemo<CSSProperties>(() => {
    if (isHorizontal) {
      return {
        flex: `0 0 ${itemWidth}px`,
        width: `${itemWidth}px`,
        height: '100%',
      }
    }
    return {
      height: `${itemHeight}px`,
      width: direction === 'both' ? `${itemWidth}px` : '100%',
    }
  }, [isHorizontal, itemWidth, itemHeight, direction])

  const primarySpacerStartStyle = useMemo<CSSProperties>(
    () =>
      isHorizontal
        ? { flex: `0 0 ${primaryOffsetStart}px`, width: `${primaryOffsetStart}px` }
        : { height: `${primaryOffsetStart}px`, width: '100%' },
    [isHorizontal, primaryOffsetStart],
  )

  const primarySpacerEndStyle = useMemo<CSSProperties>(
    () =>
      isHorizontal
        ? { flex: `0 0 ${primaryOffsetEnd}px`, width: `${primaryOffsetEnd}px` }
        : { height: `${primaryOffsetEnd}px`, width: '100%' },
    [isHorizontal, primaryOffsetEnd],
  )

  const variableContentStyle = useMemo<CSSProperties>(
    () => ({
      height: direction === 'horizontal' ? '100%' : `${totalHeight}px`,
      width: direction === 'vertical' ? '100%' : `${totalWidth}px`,
    }),
    [direction, totalHeight, totalWidth],
  )

  const { visibleRange: variableVisibleRange, visibleItems: variableVisibleItems } =
    useVisibleRange(
      itemsForVariable,
      variableItemPositions,
      scrollTop,
      scrollLeft,
      containerHeight,
      containerWidth,
      direction,
      bufferSize,
    )

  const visibleRange = isFixedSize
    ? { startIndex: fixedWindow.startIndex, endIndex: fixedWindow.endIndex }
    : variableVisibleRange

  const visibleItemsForWatch = useMemo(() => {
    if (isFixedSize) {
      const h = itemHeight
      const w = itemWidth
      return fixedVisibleItems.map((item) => ({
        key: item.key,
        data: item.data,
        height: h,
        width: w,
      }))
    }
    return variableVisibleItems
  }, [isFixedSize, itemHeight, itemWidth, fixedVisibleItems, variableVisibleItems])

  const handleNativeScroll = useCallback(() => {
    if (applyingProgrammaticScrollRef.current) return
    const viewport = resolveCwDivViewport(cwDivRef.current)
    if (!viewport) return
    updateScrollPositionDirect(viewport.scrollTop, viewport.scrollLeft)
  }, [updateScrollPositionDirect])

  const handleScroll = useCallback(
    (top: number, left: number) => {
      onScroll?.(top, left)
    },
    [onScroll],
  )

  const handleVisibleChange = useCallback(
    (startIndex: number, endIndex: number, visibleItemsList: CwVirtualScrollItem<TData>[]) => {
      onVisibleChange?.(startIndex, endIndex, visibleItemsList)
    },
    [onVisibleChange],
  )

  useVirtualScrollWatchers({
    items,
    direction,
    containerHeight,
    containerWidth,
    scrollTop,
    scrollLeft,
    visibleRange,
    visibleItems: visibleItemsForWatch,
    setScrollTop,
    setScrollLeft,
    onScroll: handleScroll,
    onVisibleChange: handleVisibleChange,
  })

  // 滚动位置回写视口（scrollTop/scrollLeft → DOM）
  useLayoutEffect(() => {
    const viewport = viewportEl
    if (!viewport) return
    const topDiff = Math.abs(viewport.scrollTop - scrollTop)
    const leftDiff = Math.abs(viewport.scrollLeft - scrollLeft)
    if (topDiff < 0.5 && leftDiff < 0.5) return
    applyingProgrammaticScrollRef.current = true
    if (topDiff >= 0.5) viewport.scrollTop = scrollTop
    if (leftDiff >= 0.5) viewport.scrollLeft = scrollLeft
    applyingProgrammaticScrollRef.current = false
  }, [scrollTop, scrollLeft, viewportEl])

  // disabled / readonly 锁定滚动
  useEffect(() => {
    const viewport = viewportEl
    if (!viewport) return
    const locked = disabled || readonly
    viewport.style.overflow = locked ? 'hidden' : ''
    viewport.style.pointerEvents = locked ? 'none' : ''
  }, [disabled, readonly, viewportEl])

  const scrollTo = (top: number, left?: number) => {
    setScrollTop(top)
    if (left !== undefined) setScrollLeft(left)
  }

  const setScrollOffset = (top: number, left?: number) => {
    updateScrollPositionDirect(top, left ?? scrollLeft)
  }

  const scrollToIndex = (index: number) => {
    if (index < 0 || index >= items.length) return
    if (isFixedSize) {
      if (isHorizontal) {
        setScrollLeft(
          paddingValues.left +
            scrollOffsetForIndex(index, items.length, itemWidth, containerWidth),
        )
        return
      }
      setScrollTop(
        paddingValues.top +
          scrollOffsetForIndex(index, items.length, itemHeight, containerHeight),
      )
      if (direction === 'both') setScrollLeft(paddingValues.left)
      return
    }
    const position = variableItemPositions[index]
    if (!position) return
    if (direction === 'horizontal') setScrollLeft(position.left)
    else if (direction === 'both') {
      setScrollTop(position.top)
      setScrollLeft(position.left)
    } else setScrollTop(position.top)
  }

  const getVariableItemStyle = useCallback(
    (item: { top: number; left: number; height: number; width: number }) =>
      calculateItemStyle(item, direction),
    [direction],
  )

  // 供 expose 同步读取最新值
  const scrollTopRef = useRef(0)
  scrollTopRef.current = scrollTop
  const scrollLeftRef = useRef(0)
  scrollLeftRef.current = scrollLeft
  const visibleRangeRef = useRef(visibleRange)
  visibleRangeRef.current = visibleRange

  useImperativeHandle(ref, () => ({
    get el() {
      return cwDivRef.current?.el ?? null
    },
    get viewport() {
      return resolveCwDivViewport(cwDivRef.current)
    },
    get content() {
      return cwDivRef.current?.content ?? null
    },
    scrollTo,
    setScrollOffset,
    scrollToIndex,
    getScrollTop: () => scrollTopRef.current,
    getScrollLeft: () => scrollLeftRef.current,
    getVisibleRange: () => visibleRangeRef.current,
  }))

  const renderItem = (data: TData, index: number) => {
    if (typeof children !== 'function') return null
    const renderArgs: CwVirtualScrollItemRenderArgs<TData> = {
      item: data,
      index,
      disabled,
      readonly,
    }
    return children(renderArgs)
  }

  const rootClass = [
    virtualScrollBase.root,
    disabled
      ? virtualScrollBase.rootDisabled
      : readonly
        ? virtualScrollBase.rootReadonly
        : virtualScrollBase.rootNormal,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div {...rest} className={rootClass} style={style}>
      <CwDiv
        ref={cwDivRef}
        className="h-full w-full"
        viewportClass="[overflow-anchor:none]"
        hideScrollbar={!showScrollbar}
        persistScrollbar={showScrollbar}
        onScroll={handleNativeScroll}
      >
        {/* 固定尺寸：与 DataTable 同一套 spacer 模型 */}
        {isFixedSize ? (
          <div
            className={[virtualScrollBase.content, isHorizontal ? virtualScrollBase.contentRow : '']
              .filter(Boolean)
              .join(' ')}
            style={fixedContentStyle}
          >
            {primaryOffsetStart > 0 ? (
              <div className={virtualScrollBase.spacer} style={primarySpacerStartStyle} />
            ) : null}
            {fixedVisibleItems.map((item) => (
              <div key={item.key} className={virtualScrollBase.itemFlow} style={fixedItemStyle}>
                {renderItem(item.data, item.index)}
              </div>
            ))}
            {primaryOffsetEnd > 0 ? (
              <div className={virtualScrollBase.spacer} style={primarySpacerEndStyle} />
            ) : null}
          </div>
        ) : (
          <div className={virtualScrollBase.content} style={variableContentStyle}>
            {variableVisibleItems.map((item) => (
              <div
                key={item.key}
                className={virtualScrollBase.item}
                style={getVariableItemStyle(item)}
              >
                {renderItem(item.data, item.originalIndex ?? item.index)}
              </div>
            ))}
          </div>
        )}
      </CwDiv>

      {items.length === 0 ? (
        <div className={virtualScrollBase.empty}>
          {emptySlot ?? (
            <div className={virtualScrollBase.emptyContent}>
              <span className={virtualScrollBase.emptyText}>{resolvedTexts.empty}</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export type CwVirtualScrollComponent = <TData = unknown>(
  props: CwVirtualScrollComponentProps<TData> & { ref?: Ref<CwVirtualScrollHandle> },
) => ReactElement

export const CwVirtualScroll = forwardRef(CwVirtualScrollInner) as unknown as CwVirtualScrollComponent

export default CwVirtualScroll
