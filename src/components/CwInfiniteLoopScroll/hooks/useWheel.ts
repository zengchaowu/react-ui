import { useCallback, useRef } from 'react'
import { calculateWheelDelta } from '../functions'

/**
 * 滚轮事件处理 Hook
 */
export function useWheel(options: {
  disabled: boolean
  readonly: boolean
  direction: 'vertical' | 'horizontal' | 'both'
  snapToPage: boolean
  scrollTopRef: { current: number }
  scrollLeftRef: { current: number }
  stopMomentum: () => void
  getPageTarget: (deltaY: number, deltaX: number) => { top: number; left: number }
  setPendingScrollTop: (value: number) => void
  setPendingScrollLeft: (value: number) => void
  addPendingDelta: (deltaTop: number, deltaLeft: number) => void
  updateScrollPosition: (callback?: () => void) => void
  checkAndJumpToMiddle: () => void
  onScroll: (top: number, left: number) => void
}) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const handleWheel = useCallback((event: WheelEvent) => {
    const current = optionsRef.current
    if (current.disabled || current.readonly) return
    event.preventDefault()

    current.stopMomentum()

    if (current.snapToPage) {
      // 分页模式：按页滚动
      const target = current.getPageTarget(event.deltaY, event.deltaX)
      current.setPendingScrollTop(target.top)
      current.setPendingScrollLeft(target.left)
      current.updateScrollPosition(() => {
        optionsRef.current.checkAndJumpToMiddle()
        optionsRef.current.onScroll(
          optionsRef.current.scrollTopRef.current,
          optionsRef.current.scrollLeftRef.current,
        )
      })
    } else {
      // 普通模式：自由滚动
      const { deltaTop, deltaLeft } = calculateWheelDelta(
        event.deltaY,
        event.deltaX,
        current.direction,
      )

      if (deltaLeft !== 0 || deltaTop !== 0) {
        current.addPendingDelta(deltaTop, deltaLeft)
      }

      current.updateScrollPosition(() => {
        optionsRef.current.checkAndJumpToMiddle()
        optionsRef.current.onScroll(
          optionsRef.current.scrollTopRef.current,
          optionsRef.current.scrollLeftRef.current,
        )
      })
    }
  }, [])

  return { handleWheel }
}
