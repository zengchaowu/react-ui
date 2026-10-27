import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CwInfiniteLoopScrollHandle } from '../../CwInfiniteLoopScroll/CwInfiniteLoopScroll'
import type { CwInfiniteLoopScrollItem } from '@zengchaowu/ui-shared/components/CwInfiniteLoopScroll/types'
import { clampIndex } from '@zengchaowu/shared/functions/number/clampIndex'

const FALLBACK_WIDTH = 1000

function readElementWidth(el: HTMLElement | null): number {
  if (!el) {
    return (typeof window !== 'undefined' ? window.innerWidth : FALLBACK_WIDTH) || FALLBACK_WIDTH
  }
  const width = el.clientWidth || el.offsetWidth
  if (width > 0) return width
  return (typeof window !== 'undefined' ? window.innerWidth : FALLBACK_WIDTH) || FALLBACK_WIDTH
}

/**
 * 分页画廊布局（对应 Vue `usePagedGalleryLayout`）。
 */
export function usePagedGalleryLayout(options: {
  itemCount: number
  initialIndex: number
  buildScrollItem: (pageWidth: number) => CwInfiniteLoopScrollItem[]
  onIndexChange: (index: number) => void
}) {
  const scrollRef = useRef<CwInfiniteLoopScrollHandle | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [containerWidth, setContainerWidth] = useState(FALLBACK_WIDTH)
  const pageWidth = containerWidth > 0 ? containerWidth : readElementWidth(null)

  const scrollItems = useMemo(() => {
    const width = Math.max(1, pageWidth)
    return options.buildScrollItem(width)
  }, [pageWidth, options.buildScrollItem])

  const scrollItemsRef = useRef(scrollItems)
  scrollItemsRef.current = scrollItems

  const [currentIndex, setCurrentIndexState] = useState(0)
  const [activeIndex, setActiveIndexState] = useState(0)
  const currentIndexRef = useRef(0)
  const activeIndexRef = useRef(0)

  const setCurrentIndex = (value: number) => {
    currentIndexRef.current = value
    setCurrentIndexState(value)
  }

  const setActiveIndex = (value: number) => {
    activeIndexRef.current = value
    setActiveIndexState(value)
  }

  const optionsRef = useRef(options)
  optionsRef.current = options

  const goToIndex = useCallback((index: number) => {
    const target = scrollRef.current
    if (!target) return
    const scrollIndex = scrollItemsRef.current.findIndex((item) => {
      const data = item.data as { originalIndex?: number } | null | undefined
      return data?.originalIndex === index
    })
    if (scrollIndex === -1) return
    target.scrollToIndex(scrollIndex)
  }, [])

  useEffect(() => {
    const itemCount = options.itemCount
    const initialIndex = options.initialIndex
    if (itemCount === 0) return
    const idx = clampIndex(initialIndex, itemCount)
    setCurrentIndex(idx)
    setActiveIndex(idx)
    const run = () => goToIndex(currentIndexRef.current)
    requestAnimationFrame(() => {
      run()
      requestAnimationFrame(run)
    })
  }, [options.itemCount, options.initialIndex, goToIndex])

  const previousWidthRef = useRef(pageWidth)
  useEffect(() => {
    const previous = previousWidthRef.current
    previousWidthRef.current = pageWidth
    if (pageWidth <= 0 || optionsRef.current.itemCount === 0) return
    if (previous === pageWidth) return
    requestAnimationFrame(() => {
      goToIndex(clampIndex(currentIndexRef.current, optionsRef.current.itemCount))
    })
  }, [pageWidth, goToIndex])

  const handleScroll = useCallback(
    (
      _top: number,
      _left: number,
      centerIndex: number | null,
      isPreview = false,
    ) => {
      if (centerIndex == null || centerIndex < 0) return
      const itemCount = optionsRef.current.itemCount
      if (centerIndex >= itemCount) return

      if (centerIndex !== currentIndexRef.current) {
        setCurrentIndex(centerIndex)
      }
      if (isPreview || centerIndex === activeIndexRef.current) return

      setActiveIndex(centerIndex)
      optionsRef.current.onIndexChange(centerIndex)
    },
    [],
  )

  useEffect(() => {
    const updateContainerWidth = () => {
      setContainerWidth(readElementWidth(containerRef.current))
    }

    updateContainerWidth()
    window.addEventListener('resize', updateContainerWidth)

    const container = containerRef.current
    const resizeObserver =
      container && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateContainerWidth)
        : null
    resizeObserver?.observe(container as HTMLElement)

    const timer = setTimeout(() => {
      updateContainerWidth()
      if (scrollRef.current && optionsRef.current.itemCount > 0) {
        goToIndex(clampIndex(currentIndexRef.current, optionsRef.current.itemCount))
      }
    }, 100)

    return () => {
      window.removeEventListener('resize', updateContainerWidth)
      resizeObserver?.disconnect()
      clearTimeout(timer)
    }
  }, [goToIndex])

  return {
    scrollRef,
    containerRef,
    pageWidth,
    currentIndex,
    activeIndex,
    scrollItems,
    handleScroll,
  }
}
