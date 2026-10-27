import { useRef } from 'react'
import { checkAndJumpToMiddle as checkAndJumpToMiddleFn } from '../functions'
import type { MiddleCopyInfo } from './useInfiniteLoop'

/**
 * 无限循环跳转逻辑 Hook
 * 检查当前滚动位置是否越过中间副本的安全边界，越界时跳回中间副本。
 */
export function useInfiniteLoopJump(options: {
  scrollTopRef: { current: number }
  scrollLeftRef: { current: number }
  direction: 'vertical' | 'horizontal' | 'both'
  singleCopyHeight: number
  singleCopyWidth: number
  middleCopyInfo: MiddleCopyInfo
  containerHeight: number
  containerWidth: number
  setPendingScrollTop: (value: number) => void
  setPendingScrollLeft: (value: number) => void
  updateScrollPositionDirect: (top: number, left: number, callback?: () => void) => void
  onScroll: (top: number, left: number) => void
}) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  function checkAndJumpToMiddle(emitOptions?: { emitScroll?: boolean }) {
    const current = optionsRef.current
    const result = checkAndJumpToMiddleFn(
      current.scrollTopRef.current,
      current.scrollLeftRef.current,
      current.direction,
      current.singleCopyHeight,
      current.singleCopyWidth,
      current.middleCopyInfo,
      current.containerHeight,
      current.containerWidth,
    )

    if (!result.needsUpdate) return

    current.setPendingScrollTop(result.newTop)
    current.setPendingScrollLeft(result.newLeft)
    current.updateScrollPositionDirect(result.newTop, result.newLeft, () => {
      if (emitOptions?.emitScroll === false) return
      current.onScroll(current.scrollTopRef.current, current.scrollLeftRef.current)
    })
  }

  return { checkAndJumpToMiddle }
}
