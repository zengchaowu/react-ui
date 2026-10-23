import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import CwBadge from '../CwBadge/CwBadge'
import { shouldShowFocus } from '../../hooks/useBrowserFocusVisible'
import type {
  CwTabsStripItem,
  CwTabsStripProps,
  CwTabsStripTabScope,
  CwTabsStripValue,
} from './types'
import { resolveTabsStripItemValue, tabsStripItemToBadge } from './types'
import { resolveTabsStripStyles } from './styles'
import { defaultTexts } from './texts'

const INDICATOR_MOTION_MS = 220

type IndicatorInline = Partial<
  Record<'left' | 'width' | 'height' | 'transform', string>
>

export function CwTabsStrip({
  items: itemsProp,
  activeIndex,
  value,
  equalWidth = false,
  tabFlushStart = false,
  tabFlushEnd = false,
  orientation = 'horizontal',
  indicatorPlacement = 'end',
  disabled = false,
  readonly = false,
  size = 'medium',
  appearance = 'default',
  texts: textsProp,
  tabSlot,
  children,
  onActiveIndexChange,
  onChange,
  className,
  ...rest
}: CwTabsStripProps) {
  const styles = useMemo(() => resolveTabsStripStyles(appearance), [appearance])
  const texts = useMemo(
    () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
    [textsProp],
  )
  const items = useMemo(() => itemsProp ?? [], [itemsProp])

  const isVertical = orientation === 'vertical'
  const placementEnd = indicatorPlacement === 'end'

  const [internalActiveIndex, setInternalActiveIndex] = useState(0)
  const activeIndexModel =
    activeIndex !== undefined ? activeIndex : internalActiveIndex

  const [indicatorInline, setIndicatorInline] = useState<IndicatorInline>({})
  const [indicatorReady, setIndicatorReady] = useState(false)
  const [allowIndicatorMotion, setAllowIndicatorMotion] = useState(false)
  const [focusedIndexForKeyboard, setFocusedIndexForKeyboard] = useState(-1)

  const tabsWrapRef = useRef<HTMLDivElement | null>(null)
  const tabRefs = useRef<Array<HTMLElement | null>>([])
  const indicatorReadyRef = useRef(false)
  const pendingPointerIndicatorTransitionRef = useRef(false)

  const activeIndexRef = useRef(activeIndexModel)
  activeIndexRef.current = activeIndexModel
  const isVerticalRef = useRef(isVertical)
  isVerticalRef.current = isVertical
  const onActiveIndexChangeRef = useRef(onActiveIndexChange)
  onActiveIndexChangeRef.current = onActiveIndexChange
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const indicatorMotionEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  const indicatorLayoutFollowUpRaf1Ref = useRef(0)
  const indicatorLayoutFollowUpRaf2Ref = useRef(0)
  const indicatorLayoutRafRef = useRef(0)

  function clearIndicatorMotionEndTimer() {
    if (indicatorMotionEndTimerRef.current != null) {
      clearTimeout(indicatorMotionEndTimerRef.current)
      indicatorMotionEndTimerRef.current = null
    }
  }

  function cancelDeferredIndicatorLayoutMeasure() {
    if (indicatorLayoutFollowUpRaf1Ref.current) {
      cancelAnimationFrame(indicatorLayoutFollowUpRaf1Ref.current)
      indicatorLayoutFollowUpRaf1Ref.current = 0
    }
    if (indicatorLayoutFollowUpRaf2Ref.current) {
      cancelAnimationFrame(indicatorLayoutFollowUpRaf2Ref.current)
      indicatorLayoutFollowUpRaf2Ref.current = 0
    }
  }

  function getActiveTab(): HTMLElement | null {
    const wrap = tabsWrapRef.current
    if (!wrap) return null
    const idx = activeIndexRef.current
    return (
      tabRefs.current[idx] ??
      wrap.querySelectorAll<HTMLElement>('[role="tab"]')[idx] ??
      null
    )
  }

  function measureIndicatorHorizontal() {
    const wrap = tabsWrapRef.current
    if (!wrap) return
    const activeTab = getActiveTab()
    if (!activeTab) return
    const textEl = activeTab.querySelector<HTMLElement>(
      '[data-cw-tabs-strip-tab-text]',
    )
    const wrapRect = wrap.getBoundingClientRect()
    const targetEl = textEl ?? activeTab
    const targetRect = targetEl.getBoundingClientRect()
    const centerX =
      targetRect.left - wrapRect.left + wrap.scrollLeft + targetRect.width / 2
    const width = targetRect.width
    setIndicatorInline({
      left: `${centerX - width / 2}px`,
      width: `${width}px`,
    })
  }

  function measureIndicatorVertical() {
    const activeTab = getActiveTab()
    if (!activeTab) return
    const tabHeight = activeTab.offsetHeight
    const halfHeight = tabHeight / 2
    const offsetY = activeTab.offsetTop + (tabHeight - halfHeight) / 2
    setIndicatorInline({
      height: `${halfHeight}px`,
      transform: `translateY(${offsetY}px)`,
    })
  }

  function measureIndicator() {
    if (isVerticalRef.current) measureIndicatorVertical()
    else measureIndicatorHorizontal()
  }

  function scheduleDeferredIndicatorLayoutMeasure() {
    cancelDeferredIndicatorLayoutMeasure()
    indicatorLayoutFollowUpRaf1Ref.current = requestAnimationFrame(() => {
      indicatorLayoutFollowUpRaf1Ref.current = 0
      measureIndicator()
      indicatorLayoutFollowUpRaf2Ref.current = requestAnimationFrame(() => {
        indicatorLayoutFollowUpRaf2Ref.current = 0
        measureIndicator()
      })
    })
  }

  function scheduleIndicatorLayoutReflow() {
    setAllowIndicatorMotion(false)
    clearIndicatorMotionEndTimer()
    cancelDeferredIndicatorLayoutMeasure()
    measureIndicator()
    if (indicatorLayoutRafRef.current) {
      cancelAnimationFrame(indicatorLayoutRafRef.current)
    }
    indicatorLayoutRafRef.current = requestAnimationFrame(() => {
      indicatorLayoutRafRef.current = 0
      scheduleDeferredIndicatorLayoutMeasure()
    })
  }

  function updateIndicator(
    usePointerTransition = false,
    instantLayout = false,
  ) {
    const run = () => {
      const wrap = tabsWrapRef.current
      if (!wrap) return
      const activeTab = getActiveTab()
      if (!activeTab) return

      clearIndicatorMotionEndTimer()
      if (instantLayout || !usePointerTransition) {
        setAllowIndicatorMotion(false)
      }

      measureIndicator()

      const finishInstantLayout = () => {
        if (instantLayout) scheduleDeferredIndicatorLayoutMeasure()
      }

      if (!indicatorReadyRef.current) {
        requestAnimationFrame(() => {
          indicatorReadyRef.current = true
          setIndicatorReady(true)
          if (usePointerTransition) {
            updateIndicator(true, false)
          }
        })
        finishInstantLayout()
        return
      }

      if (usePointerTransition) {
        setAllowIndicatorMotion(true)
        activeTab.scrollIntoView({
          behavior: 'auto',
          inline: isVerticalRef.current ? 'nearest' : 'center',
          block: 'nearest',
        })
        measureIndicator()
        clearIndicatorMotionEndTimer()
        indicatorMotionEndTimerRef.current = setTimeout(() => {
          indicatorMotionEndTimerRef.current = null
          setAllowIndicatorMotion(false)
        }, INDICATOR_MOTION_MS)
        return
      }

      finishInstantLayout()
    }

    if (!tabsWrapRef.current) {
      requestAnimationFrame(run)
    } else {
      run()
    }
  }

  function getItemKey(item: CwTabsStripItem, index: number) {
    const v = resolveTabsStripItemValue(item)
    if (v !== undefined) return v
    return item.label ?? index
  }

  function tabFlushPaddingClass(index: number): string {
    if (isVertical) return ''
    const n = items.length
    if (n === 0) return ''
    const parts: string[] = []
    if (tabFlushStart && index === 0) parts.push('!pl-0')
    if (tabFlushEnd && index === n - 1) parts.push('!pr-0')
    return parts.join(' ')
  }

  function tabFlushContentClass(index: number): string {
    if (isVertical) return ''
    const n = items.length
    if (n === 0) return ''
    const parts: string[] = []
    if (tabFlushStart && index === 0) parts.push('!pl-0')
    if (tabFlushEnd && index === n - 1) parts.push('!pr-0')
    return parts.join(' ')
  }

  function handleTabClick(index: number) {
    if (disabled || readonly) return
    const item = items[index]
    if (!item || item.disabled) return
    if (index === activeIndexRef.current) return
    pendingPointerIndicatorTransitionRef.current = true
    if (activeIndex === undefined) setInternalActiveIndex(index)
    onActiveIndexChange?.(index)
    const v = resolveTabsStripItemValue(item)
    onChange?.(index, v, item)
  }

  function isFocusVisibleForIndex(index: number): boolean {
    return focusedIndexForKeyboard === index
  }

  function handleTabFocus(
    index: number,
    item: CwTabsStripItem,
    _event: ReactFocusEvent<HTMLDivElement>,
  ) {
    if (item.disabled || disabled) return
    if (shouldShowFocus()) {
      setFocusedIndexForKeyboard(index)
    }
  }

  function handleTabBlur(index: number) {
    if (focusedIndexForKeyboard === index) {
      setFocusedIndexForKeyboard(-1)
    }
  }

  const currentFocusableIndex = useMemo(() => {
    if (disabled) return -1
    if (focusedIndexForKeyboard !== -1) return focusedIndexForKeyboard
    if (activeIndexModel >= 0 && activeIndexModel < items.length) {
      return activeIndexModel
    }
    const first = items.findIndex((item) => !item.disabled)
    return first >= 0 ? first : 0
  }, [disabled, focusedIndexForKeyboard, activeIndexModel, items])

  function resolveTabindex(
    index: number,
    itemDisabled: boolean,
  ): number | undefined {
    if (itemDisabled || disabled) return undefined
    return index === currentFocusableIndex ? 0 : -1
  }

  function focusTab(index: number) {
    const item = items[index]
    if (!item || item.disabled || disabled) return
    requestAnimationFrame(() => {
      tabRefs.current[index]?.focus()
    })
  }

  function moveFocus(direction: 1 | -1) {
    const total = items.length
    if (!total || disabled) return
    let start = currentFocusableIndex
    for (let i = 0; i < total; i += 1) {
      start = (start + direction + total) % total
      const candidate = items[start]
      if (candidate && !candidate.disabled) {
        focusTab(start)
        break
      }
    }
  }

  function handleTabKeyDown(
    event: ReactKeyboardEvent<HTMLDivElement>,
    index: number,
    item: CwTabsStripItem,
  ) {
    if (item.disabled || disabled) return
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        handleTabClick(index)
        break
      case 'ArrowRight':
        if (!isVertical) {
          event.preventDefault()
          moveFocus(1)
        }
        break
      case 'ArrowLeft':
        if (!isVertical) {
          event.preventDefault()
          moveFocus(-1)
        }
        break
      case 'ArrowDown':
        event.preventDefault()
        moveFocus(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveFocus(-1)
        break
      case 'Home':
        event.preventDefault()
        focusTab(items.findIndex((i) => !i.disabled))
        break
      case 'End': {
        event.preventDefault()
        const revIdx = [...items].reverse().findIndex((i) => !i.disabled)
        if (revIdx >= 0) focusTab(items.length - 1 - revIdx)
        break
      }
      default:
        break
    }
  }

  // 初始及列表/等分变化后重新测量指示条
  useLayoutEffect(() => {
    tabRefs.current.length = items.length
    const wrap = tabsWrapRef.current
    let resizeObserver: ResizeObserver | null = null
    if (wrap && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        scheduleIndicatorLayoutReflow()
      })
      resizeObserver.observe(wrap)
      wrap.querySelectorAll<HTMLElement>('[role="tab"]').forEach((tab) => {
        resizeObserver?.observe(tab)
      })
    }
    updateIndicator(false, true)
    return () => {
      resizeObserver?.disconnect()
      if (indicatorLayoutRafRef.current) {
        cancelAnimationFrame(indicatorLayoutRafRef.current)
        indicatorLayoutRafRef.current = 0
      }
      cancelDeferredIndicatorLayoutMeasure()
      clearIndicatorMotionEndTimer()
    }
  }, [items, equalWidth])

  // 方向 / 指示条位置变化时重置首次布局状态
  useLayoutEffect(() => {
    indicatorReadyRef.current = false
    setIndicatorReady(false)
    setIndicatorInline({})
    cancelDeferredIndicatorLayoutMeasure()
    updateIndicator(false, true)
  }, [orientation, indicatorPlacement])

  // 激活项变化：指针点击时播放位置过渡并滚动到可见
  useLayoutEffect(() => {
    const usePointerTransition = pendingPointerIndicatorTransitionRef.current
    pendingPointerIndicatorTransitionRef.current = false
    updateIndicator(usePointerTransition, false)
  }, [activeIndexModel])

  // value -> activeIndex 同步
  useEffect(() => {
    if (value === undefined || value === null) return
    const idx = items.findIndex(
      (item) => resolveTabsStripItemValue(item) === value,
    )
    if (idx >= 0 && idx !== activeIndexRef.current) {
      if (activeIndex === undefined) setInternalActiveIndex(idx)
      onActiveIndexChangeRef.current?.(idx)
    }
  }, [value, items, activeIndex])

  // 列表变化：越界收敛 / value 失效时选中首个可用项
  useEffect(() => {
    const list = items
    if (!list.length) return
    let current = activeIndexRef.current
    if (current >= list.length) {
      const next = Math.max(0, list.length - 1)
      if (activeIndex === undefined) setInternalActiveIndex(next)
      onActiveIndexChangeRef.current?.(next)
      current = next
    }
    if (value !== undefined && value !== null) {
      const exists = list.some(
        (item) => resolveTabsStripItemValue(item) === value,
      )
      if (!exists) {
        const firstIndex = list.findIndex(
          (item) => !item.disabled && !disabled,
        )
        if (firstIndex >= 0) {
          if (activeIndex === undefined) setInternalActiveIndex(firstIndex)
          onActiveIndexChangeRef.current?.(firstIndex)
          onChangeRef.current?.(
            firstIndex,
            resolveTabsStripItemValue(list[firstIndex]),
            list[firstIndex],
          )
        }
      }
    }
  }, [items, value, activeIndex, disabled])

  // 滚动容器监听（指示条位置重排）+ 窗口尺寸变化
  useEffect(() => {
    const wrap = tabsWrapRef.current
    const handleWrapScroll = () => {
      scheduleIndicatorLayoutReflow()
    }
    const handleWindowResize = () => {
      updateIndicator(false, true)
    }
    wrap?.addEventListener('scroll', handleWrapScroll, { passive: true })
    window.addEventListener('resize', handleWindowResize)
    return () => {
      wrap?.removeEventListener('scroll', handleWrapScroll)
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  useEffect(() => {
    return () => {
      teardownIndicatorResources()
    }
  }, [])

  function teardownIndicatorResources() {
    clearIndicatorMotionEndTimer()
    cancelDeferredIndicatorLayoutMeasure()
    if (indicatorLayoutRafRef.current) {
      cancelAnimationFrame(indicatorLayoutRafRef.current)
      indicatorLayoutRafRef.current = 0
    }
  }

  const sizeClass =
    size === 'small'
      ? styles.sizeSmall
      : size === 'large'
        ? styles.sizeLarge
        : styles.sizeMedium

  const rootClassName = [
    styles.root,
    isVertical ? styles.rootVertical : styles.rootHorizontal,
    isVertical
      ? styles.rootScrollVertical
      : equalWidth
        ? styles.rootEqualWidth
        : styles.rootScroll,
    !isVertical && placementEnd
      ? 'items-end'
      : !isVertical
        ? 'items-start'
        : '',
    disabled ? styles.rootDisabled : '',
    readonly ? styles.rootReadonly : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const indicatorStyle: CSSProperties = { ...indicatorInline }
  if (!indicatorReady) {
    indicatorStyle.transition = 'none'
  }

  const renderTabContent = (
    item: CwTabsStripItem,
    index: number,
    active: boolean,
  ) => {
    const scope: CwTabsStripTabScope = { item, index, active }
    const renderer = tabSlot ?? children
    if (renderer) return renderer(scope)
    return (
      <span
        className={[
          styles.tabText,
          active ? styles.tabTextActive : styles.tabTextInactive,
        ]
          .filter(Boolean)
          .join(' ')}
        data-cw-tabs-strip-tab-text
      >
        {item.label}
      </span>
    )
  }

  return (
    <div
      {...rest}
      ref={tabsWrapRef}
      className={rootClassName}
      role="tablist"
      aria-label={texts.tablistLabel}
      aria-orientation={isVertical ? 'vertical' : 'horizontal'}
      aria-disabled={disabled ? 'true' : 'false'}
      aria-readonly={readonly ? 'true' : 'false'}
    >
      {items.map((item, index) => {
        const active = activeIndexModel === index
        const itemDisabled = Boolean(item.disabled || disabled)
        const badgeOptions = tabsStripItemToBadge(item)
        return (
          <div
            key={getItemKey(item, index)}
            ref={(el) => {
              tabRefs.current[index] = el
            }}
            className={[
              styles.tab,
              isVertical ? styles.tabVertical : styles.tabHorizontal,
              equalWidth ? styles.tabEqualWidth : styles.tabAdaptive,
              active ? styles.tabActive : '',
              item.disabled || disabled ? styles.tabDisabled : '',
              readonly ? styles.tabReadonly : '',
              isFocusVisibleForIndex(index) && !item.disabled && !disabled
                ? styles.tabFocused
                : '',
              sizeClass,
              tabFlushPaddingClass(index),
            ]
              .filter(Boolean)
              .join(' ')}
            role="tab"
            aria-selected={active}
            aria-disabled={itemDisabled ? 'true' : 'false'}
            aria-label={item.ariaLabel || item.label}
            tabIndex={resolveTabindex(index, itemDisabled)}
            onClick={() => handleTabClick(index)}
            onFocus={(event) => handleTabFocus(index, item, event)}
            onBlur={() => handleTabBlur(index)}
            onKeyDown={(event) => handleTabKeyDown(event, index, item)}
          >
            <CwBadge
              className={[styles.tabContent, tabFlushContentClass(index)]
                .filter(Boolean)
                .join(' ')}
              {...(badgeOptions ?? {})}
            >
              {renderTabContent(item, index, active)}
            </CwBadge>
          </div>
        )
      })}
      {items.length > 0 ? (
        <div
          className={[
            styles.indicator,
            isVertical
              ? placementEnd
                ? styles.indicatorVerticalEnd
                : styles.indicatorVerticalStart
              : placementEnd
                ? styles.indicatorHorizontalEnd
                : styles.indicatorHorizontalStart,
            disabled ? styles.indicatorDisabled : '',
            readonly ? styles.indicatorReadonly : '',
            indicatorReady ? styles.indicatorReady : '',
            indicatorReady
              ? allowIndicatorMotion
                ? styles.indicatorMotion
                : styles.indicatorNoMotion
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={indicatorStyle}
          aria-hidden="true"
        />
      ) : null}
    </div>
  )
}

export default CwTabsStrip
