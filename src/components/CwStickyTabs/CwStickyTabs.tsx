import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  CwStickyTabItem,
  CwStickyTabsHandle,
  CwStickyTabsProps,
} from './types'
import { stickyTabsBase } from './styles'
import { defaultTexts } from './texts'

const NAV_HEIGHT_DEFAULT = 45
const SCROLL_SYNC_THRESHOLD_OFFSET = 10

/** 根据滚动距离计算动画时长（距离近则时间短） */
const SCROLL_DURATION_MIN = 150
const SCROLL_DURATION_MAX = 500
const SCROLL_MS_PER_PX = 0.4

function getTabKey(tab: CwStickyTabItem, index: number) {
  return tab.refName ?? tab.value ?? tab.label ?? String(index)
}

function getRefName(tab: CwStickyTabItem): string {
  return tab.refName ?? tab.value ?? ''
}

function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null
  let parent = el.parentElement
  while (parent) {
    const { overflowY, overflow } = getComputedStyle(parent)
    if (
      /(auto|scroll|overlay)/.test(overflowY) ||
      /(auto|scroll|overlay)/.test(overflow)
    ) {
      return parent
    }
    parent = parent.parentElement
  }
  return null
}

function resolveScrollContainer(
  source: CwStickyTabsProps['scrollContainerRef'],
): HTMLElement | null {
  if (!source) return null
  if ('current' in source) return source.current
  return source
}

function getContainerRect(container: HTMLElement | Window): { top: number } {
  return container === window
    ? { top: 0 }
    : (container as HTMLElement).getBoundingClientRect()
}

function getScrollDuration(distancePx: number): number {
  const duration = Math.abs(distancePx) * SCROLL_MS_PER_PX
  return Math.round(
    Math.min(SCROLL_DURATION_MAX, Math.max(SCROLL_DURATION_MIN, duration)),
  )
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function smoothScrollTo(
  container: HTMLElement | Window,
  targetScrollTop: number,
) {
  const isWindow = container === window
  const getScrollTop = () =>
    isWindow
      ? window.pageYOffset
      : (container as HTMLElement).scrollTop
  const setScrollTop = (v: number) => {
    if (isWindow) window.scrollTo(0, v)
    else (container as HTMLElement).scrollTop = v
  }

  const startTop = getScrollTop()
  const distance = targetScrollTop - startTop
  if (distance === 0) return

  const duration = getScrollDuration(distance)
  const startTime = performance.now()

  function tick(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(1, elapsed / duration)
    const eased = easeInOutCubic(progress)
    setScrollTop(startTop + distance * eased)
    if (progress < 1) requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}

export const CwStickyTabs = forwardRef<CwStickyTabsHandle, CwStickyTabsProps>(
  function CwStickyTabs(
    {
      tabs,
      scrollContainerRef,
      getSectionEl,
      activeIndex,
      navHeight = NAV_HEIGHT_DEFAULT,
      texts: textsProp,
      onActiveIndexChange,
      onTabClick,
      className,
      ...rest
    },
    ref,
  ) {
    const styles = stickyTabsBase
    const texts = useMemo(
      () => ({ ...defaultTexts, ...(textsProp ?? {}) }),
      [textsProp],
    )
    const displayTabs = useMemo(() => tabs ?? [], [tabs])

    const stickyRef = useRef<HTMLDivElement | null>(null)
    const [internalActiveIndex, setInternalActiveIndex] = useState(0)

    const isControlled = activeIndex !== undefined
    const resolvedActiveIndex = isControlled ? activeIndex : internalActiveIndex

    const resolvedActiveIndexRef = useRef(resolvedActiveIndex)
    resolvedActiveIndexRef.current = resolvedActiveIndex

    const isControlledRef = useRef(isControlled)
    isControlledRef.current = isControlled
    const activeIndexRef = useRef(activeIndex)
    activeIndexRef.current = activeIndex
    const navHeightRef = useRef(navHeight)
    navHeightRef.current = navHeight
    const displayTabsRef = useRef(displayTabs)
    displayTabsRef.current = displayTabs
    const getSectionElRef = useRef(getSectionEl)
    getSectionElRef.current = getSectionEl
    const scrollContainerRefRef = useRef(scrollContainerRef)
    scrollContainerRefRef.current = scrollContainerRef
    const onActiveIndexChangeRef = useRef(onActiveIndexChange)
    onActiveIndexChangeRef.current = onActiveIndexChange
    const onTabClickRef = useRef(onTabClick)
    onTabClickRef.current = onTabClick

    const getScrollContainer = useCallback(():
      | HTMLElement
      | Window
      | null => {
      const fromRef = resolveScrollContainer(scrollContainerRefRef.current)
      if (fromRef) return fromRef
      if (getSectionElRef.current && stickyRef.current) {
        const fromDom = getScrollParent(stickyRef.current)
        if (fromDom) return fromDom
      }
      return typeof window !== 'undefined' ? window : null
    }, [])

    const updateActiveIndexFromScroll = useCallback(() => {
      const container = getScrollContainer()
      const sectionGetter = getSectionElRef.current
      const list = displayTabsRef.current
      if (!container || !sectionGetter || !list.length) return

      const containerRect = getContainerRect(container)
      const threshold = navHeightRef.current + SCROLL_SYNC_THRESHOLD_OFFSET
      let currentIndex = 0

      for (let i = 0; i < list.length; i += 1) {
        const refName = getRefName(list[i])
        if (!refName) continue
        const el = sectionGetter(refName)
        if (!el) continue
        const offsetTop = el.getBoundingClientRect().top - containerRect.top
        if (offsetTop <= threshold) currentIndex = i
      }

      if (isControlledRef.current) {
        if (currentIndex !== activeIndexRef.current) {
          onActiveIndexChangeRef.current?.(currentIndex)
        }
      } else {
        setInternalActiveIndex(currentIndex)
      }
    }, [getScrollContainer])

    const scrollToSection = useCallback(
      (el: HTMLElement | null) => {
        if (!el) return
        const container = getScrollContainer()
        if (!container) return
        const h = navHeightRef.current
        if (container === window) {
          const targetTop = Math.max(
            0,
            el.getBoundingClientRect().top + window.pageYOffset - h,
          )
          smoothScrollTo(window, targetTop)
        } else {
          const c = container as HTMLElement
          const rect = c.getBoundingClientRect()
          const targetScrollTop =
            c.scrollTop + (el.getBoundingClientRect().top - rect.top) - h
          smoothScrollTo(c, Math.max(0, targetScrollTop))
        }
      },
      [getScrollContainer],
    )

    const handleTabClick = useCallback(
      (index: number) => {
        const tab = displayTabsRef.current[index]
        const refName = tab ? getRefName(tab) : ''
        const sectionGetter = getSectionElRef.current
        if (refName && sectionGetter && getScrollContainer()) {
          scrollToSection(sectionGetter(refName))
        } else if (!isControlledRef.current) {
          setInternalActiveIndex(index)
        }
        if (tab) onTabClickRef.current?.(index, tab)
      },
      [getScrollContainer, scrollToSection],
    )

    useEffect(() => {
      const container = getScrollContainer()
      const el =
        container && container !== window ? (container as HTMLElement) : null
      const handleContainerScroll = () => {
        updateActiveIndexFromScroll()
      }
      if (el && getSectionElRef.current) {
        el.addEventListener('scroll', handleContainerScroll)
        updateActiveIndexFromScroll()
      }
      return () => {
        if (el) el.removeEventListener('scroll', handleContainerScroll)
      }
    }, [
      getScrollContainer,
      scrollContainerRef,
      getSectionEl,
      updateActiveIndexFromScroll,
    ])

    useImperativeHandle(
      ref,
      () => ({
        get activeIndex() {
          return resolvedActiveIndexRef.current
        },
        updateActiveIndexFromScroll,
      }),
      [updateActiveIndexFromScroll],
    )

    return (
      <div
        {...rest}
        ref={stickyRef}
        className={[styles.root, className].filter(Boolean).join(' ')}
        role="tablist"
        aria-label={texts.tablistLabel}
      >
        <div className={styles.header}>
          <ul className={styles.list}>
            {displayTabs.map((tab, index) => {
              const active = resolvedActiveIndex === index
              return (
                <li
                  key={getTabKey(tab, index)}
                  className={[styles.item, active ? styles.itemActive : '']
                    .filter(Boolean)
                    .join(' ')}
                  role="tab"
                  aria-selected={active}
                  tabIndex={active ? 0 : -1}
                  onClick={() => handleTabClick(index)}
                >
                  <span
                    className={[
                      styles.itemText,
                      active ? styles.itemTextActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {tab.label}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    )
  },
)

export default CwStickyTabs
