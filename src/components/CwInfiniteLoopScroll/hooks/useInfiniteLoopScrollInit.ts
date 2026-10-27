import { useEffect, useRef } from 'react'
import type { MiddleCopyInfo } from './useInfiniteLoop'

/**
 * 无限循环滚动初始化 Hook
 * 首次拿到中间副本信息后，把滚动位置落到中间副本。
 */
export function useInfiniteLoopScrollInit(options: {
  middleCopyInfo: MiddleCopyInfo
  direction: 'vertical' | 'horizontal' | 'both'
  snapToPage: boolean
  scrollTopRef: { current: number }
  scrollLeftRef: { current: number }
  setScrollTop: (value: number, callback?: () => void) => void
  setScrollLeft: (value: number, callback?: () => void) => void
  onScroll: (top: number, left: number) => void
}) {
  const { middleCopyInfo, direction, snapToPage, setScrollTop, setScrollLeft } = options
  const optionsRef = useRef(options)
  optionsRef.current = options
  const didInitRef = useRef(false)

  useEffect(() => {
    if (didInitRef.current || !middleCopyInfo) return
    didInitRef.current = true

    const current = optionsRef.current
    const shouldEmit = !(snapToPage && direction === 'horizontal')
    if (direction === 'horizontal') {
      setScrollLeft(middleCopyInfo.left, () => {
        if (shouldEmit) current.onScroll(current.scrollTopRef.current, current.scrollLeftRef.current)
      })
    } else {
      setScrollTop(middleCopyInfo.top, () => {
        if (shouldEmit) current.onScroll(current.scrollTopRef.current, current.scrollLeftRef.current)
      })
    }
  }, [middleCopyInfo, direction, snapToPage, setScrollTop, setScrollLeft])
}
