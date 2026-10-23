import { useCallback, useEffect, useRef } from 'react'
import {
  parseRelativeValue,
  calculatePageSnap,
  calculatePageTarget,
  easeOutCubic,
  calculateDragReleasePageSnap,
  pickShortestLoopScrollTarget,
} from '../functions'

type MiddleCopyInfo = {
  top: number
  left: number
  topEnd?: number
  leftEnd?: number
} | null

type ApplyScroll = (
  top: number,
  left: number,
  options?: { emitScroll?: boolean },
) => void

function copySizeOf(info: MiddleCopyInfo, axis: 'horizontal' | 'vertical'): number {
  if (!info) return 0
  if (axis === 'horizontal') {
    return typeof info.leftEnd === 'number' ? Math.max(0, info.leftEnd - info.left) : 0
  }
  return typeof info.topEnd === 'number' ? Math.max(0, info.topEnd - info.top) : 0
}

/**
 * 分页对齐 Hook
 */
export function usePageSnap(options: {
  snapToPage: boolean
  snapThreshold: number
  pageHeight: number | string | undefined
  pageWidth: number | string | undefined
  direction: 'vertical' | 'horizontal' | 'both'
  containerHeight: number
  containerWidth: number
  middleCopyInfo: MiddleCopyInfo
  scrollTopRef: { current: number }
  scrollLeftRef: { current: number }
  applyScroll: ApplyScroll
}) {
  const optionsRef = useRef(options)
  optionsRef.current = options
  const snapRafRef = useRef<number | null>(null)

  const pageHeightValue = () => {
    const current = optionsRef.current
    if (current.direction === 'horizontal') return 0
    return parseRelativeValue(current.pageHeight, current.containerHeight)
  }

  const pageWidthValue = () => {
    const current = optionsRef.current
    if (current.direction === 'vertical') return 0
    return parseRelativeValue(current.pageWidth, current.containerWidth)
  }

  const snapToNearestPageByDrag = useCallback(
    (startTop: number, startLeft: number, currentTop: number, currentLeft: number) => {
      const current = optionsRef.current
      if (!current.snapToPage) return { top: currentTop, left: currentLeft }

      const info = current.middleCopyInfo
      if (!info) return { top: currentTop, left: currentLeft }

      const pageH = pageHeightValue()
      const pageW = pageWidthValue()
      const threshold = current.snapThreshold || 0.2

      let newTop = currentTop
      let newLeft = currentLeft

      if (current.direction === 'horizontal') {
        if (pageW > 0) {
          newLeft = calculateDragReleasePageSnap(startLeft, currentLeft, pageW, threshold)
        }
      } else if (current.direction === 'both') {
        if (pageH > 0) {
          newTop = calculateDragReleasePageSnap(startTop, currentTop, pageH, threshold)
        }
        if (pageW > 0) {
          newLeft = calculateDragReleasePageSnap(startLeft, currentLeft, pageW, threshold)
        }
      } else if (pageH > 0) {
        newTop = calculateDragReleasePageSnap(startTop, currentTop, pageH, threshold)
      }

      return { top: newTop, left: newLeft }
    },
    [],
  )

  const snapToNearestPage = useCallback((currentTop: number, currentLeft: number) => {
    const current = optionsRef.current
    if (!current.snapToPage) return { top: currentTop, left: currentLeft }

    const info = current.middleCopyInfo
    if (!info) return { top: currentTop, left: currentLeft }

    const pageH = pageHeightValue()
    const pageW = pageWidthValue()
    const threshold = current.snapThreshold || 0.2

    let newTop = currentTop
    let newLeft = currentLeft

    if (current.direction === 'horizontal') {
      if (pageW > 0) {
        newLeft = calculatePageSnap(currentLeft, info.left, pageW, threshold)
      }
    } else if (current.direction === 'both') {
      if (pageH > 0) {
        newTop = calculatePageSnap(currentTop, info.top, pageH, threshold)
      }
      if (pageW > 0) {
        newLeft = calculatePageSnap(currentLeft, info.left, pageW, threshold)
      }
    } else if (pageH > 0) {
      newTop = calculatePageSnap(currentTop, info.top, pageH, threshold)
    }

    return { top: newTop, left: newLeft }
  }, [])

  const stopSnapAnimation = useCallback(() => {
    if (snapRafRef.current !== null) {
      cancelAnimationFrame(snapRafRef.current)
      snapRafRef.current = null
    }
  }, [])

  const smoothSnapToPage = useCallback(
    (toTop: number, toLeft: number) => {
      const current = optionsRef.current
      if (!current.snapToPage) return

      let startTop = current.scrollTopRef.current
      let startLeft = current.scrollLeftRef.current
      let targetTop = toTop
      let targetLeft = toLeft

      const info = current.middleCopyInfo
      const copyH = copySizeOf(info, 'vertical')
      const copyW = copySizeOf(info, 'horizontal')
      if (copyH > 0 && Math.abs(targetTop - startTop) > copyH * 0.5) {
        targetTop = pickShortestLoopScrollTarget(startTop, targetTop, copyH)
      }
      if (copyW > 0 && Math.abs(targetLeft - startLeft) > copyW * 0.5) {
        targetLeft = pickShortestLoopScrollTarget(startLeft, targetLeft, copyW)
      }

      // 已在目标上：直接落稳并 emit，避免空等动画
      if (Math.abs(targetTop - startTop) < 0.5 && Math.abs(targetLeft - startLeft) < 0.5) {
        current.applyScroll(targetTop, targetLeft, { emitScroll: true })
        return
      }

      const startTime = Date.now()
      const duration = 300

      const applyFrame = (top: number, left: number, emitScroll: boolean) => {
        const latest = optionsRef.current
        latest.applyScroll(top, left, { emitScroll })
        const jumpTop = latest.scrollTopRef.current - top
        const jumpLeft = latest.scrollLeftRef.current - left
        if (jumpTop !== 0 || jumpLeft !== 0) {
          startTop += jumpTop
          targetTop += jumpTop
          startLeft += jumpLeft
          targetLeft += jumpLeft
        }
      }

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = easeOutCubic(progress)
        const currentTop = startTop + (targetTop - startTop) * easeProgress
        const currentLeft = startLeft + (targetLeft - startLeft) * easeProgress

        if (progress < 1) {
          applyFrame(currentTop, currentLeft, false)
          snapRafRef.current = requestAnimationFrame(animate)
        } else {
          snapRafRef.current = null
          applyFrame(targetTop, targetLeft, true)
        }
      }

      if (snapRafRef.current !== null) {
        cancelAnimationFrame(snapRafRef.current)
        snapRafRef.current = null
      }
      snapRafRef.current = requestAnimationFrame(animate)
    },
    [],
  )

  const getPageTarget = useCallback((deltaY: number, deltaX: number) => {
    const current = optionsRef.current
    const info = current.middleCopyInfo
    if (!info) {
      return { top: current.scrollTopRef.current, left: current.scrollLeftRef.current }
    }

    const pageH = pageHeightValue()
    const pageW = pageWidthValue()
    let newTop = current.scrollTopRef.current
    let newLeft = current.scrollLeftRef.current

    if (current.direction === 'horizontal') {
      if (pageW > 0) {
        newLeft = calculatePageTarget(current.scrollLeftRef.current, info.left, pageW, deltaX || deltaY)
      }
    } else if (current.direction === 'both') {
      if (pageH > 0 && deltaY !== 0) {
        newTop = calculatePageTarget(current.scrollTopRef.current, info.top, pageH, deltaY)
      }
      if (pageW > 0 && deltaX !== 0) {
        newLeft = calculatePageTarget(current.scrollLeftRef.current, info.left, pageW, deltaX)
      }
    } else if (pageH > 0) {
      newTop = calculatePageTarget(current.scrollTopRef.current, info.top, pageH, deltaY)
    }

    const copyH = copySizeOf(info, 'vertical')
    const copyW = copySizeOf(info, 'horizontal')
    if (copyH > 0 && Math.abs(newTop - current.scrollTopRef.current) > copyH * 0.5) {
      newTop = pickShortestLoopScrollTarget(current.scrollTopRef.current, newTop, copyH)
    }
    if (copyW > 0 && Math.abs(newLeft - current.scrollLeftRef.current) > copyW * 0.5) {
      newLeft = pickShortestLoopScrollTarget(current.scrollLeftRef.current, newLeft, copyW)
    }

    return { top: newTop, left: newLeft }
  }, [])

  useEffect(() => stopSnapAnimation, [stopSnapAnimation])

  return {
    pageHeightValue,
    pageWidthValue,
    snapToNearestPage,
    snapToNearestPageByDrag,
    smoothSnapToPage,
    stopSnapAnimation,
    getPageTarget,
  }
}
