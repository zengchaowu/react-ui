import { useEffect, useState, type RefObject } from 'react'
import type { CwGridBreakpointConfig } from './types'
import { resolveGridColumnsFromContainerWidth } from '@zengchaowu/ui-shared/components/CwGrid/gridBreakpoint'

export interface UseGridContainerWidthOptions {
  /** 响应式断点配置；存在时强制测量 */
  breakpoints?: CwGridBreakpointConfig
  /** 未命中断点时的兜底列数 */
  fallbackColumns: number
  /** false 且无 breakpoints 时跳过 ResizeObserver */
  measureEnabled?: boolean
}

export interface UseGridContainerWidthResult {
  usesMeasuredBreakpoints: boolean
  /** 宽度未测到前不用 calc 列宽（避免父级 display:none 初挂载时格子不可见） */
  usesMeasuredLayout: boolean
  activeColumns: number
}

/**
 * React 版 `useGridContainerWidth`：ResizeObserver 实测栅格根节点宽度并解析列数。
 */
export function useGridContainerWidth(
  measureRef: RefObject<HTMLElement>,
  options: UseGridContainerWidthOptions,
): UseGridContainerWidthResult {
  const { breakpoints, fallbackColumns, measureEnabled = true } = options
  const [containerWidth, setContainerWidth] = useState(0)

  const usesMeasuredBreakpoints = breakpoints != null
  const shouldObserve = usesMeasuredBreakpoints || measureEnabled

  useEffect(() => {
    if (!shouldObserve) return undefined
    const element = measureRef.current
    if (!element) return undefined

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width
        if (width != null) setContainerWidth(width)
      })
      observer.observe(element)
    }
    setContainerWidth(element.getBoundingClientRect().width)

    return () => {
      observer?.disconnect()
      observer = null
    }
  }, [shouldObserve, measureRef])

  let activeColumns = fallbackColumns
  if (breakpoints) {
    activeColumns =
      containerWidth <= 0
        ? breakpoints.xs?.columns ?? fallbackColumns
        : resolveGridColumnsFromContainerWidth(containerWidth, breakpoints, fallbackColumns)
  }

  return {
    usesMeasuredBreakpoints,
    usesMeasuredLayout: shouldObserve && containerWidth > 0,
    activeColumns,
  }
}
