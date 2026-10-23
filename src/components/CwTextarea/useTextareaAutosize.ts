import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

export interface UseTextareaAutosizeOptions {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  minRows: number
  maxRows?: number
  value: string
}

interface LineMetrics {
  minHeight: number
  maxHeight: number
  hasMax: boolean
}

const DEFAULT_LINE_HEIGHT = 20

export function useTextareaAutosize(options: UseTextareaAutosizeOptions) {
  const { textareaRef, minRows, maxRows, value } = options

  const metricsRef = useRef<LineMetrics>({
    minHeight: 0,
    maxHeight: Infinity,
    hasMax: false,
  })
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const computeLineMetrics = useCallback(() => {
    const el = textareaRef.current
    if (!el || typeof window === 'undefined') return

    const style = window.getComputedStyle(el)
    const lineHeight = parseFloat(style.lineHeight || '0') || DEFAULT_LINE_HEIGHT
    const padding =
      parseFloat(style.paddingTop || '0') + parseFloat(style.paddingBottom || '0')
    const border =
      parseFloat(style.borderTopWidth || '0') + parseFloat(style.borderBottomWidth || '0')
    const extras = padding + border

    const resolvedMinRows = Math.max(1, minRows)
    const hasMaxRows = typeof maxRows === 'number' && maxRows > 0
    const resolvedMaxRows = hasMaxRows ? Math.max(resolvedMinRows, maxRows) : Infinity

    const minHeight = lineHeight * resolvedMinRows + extras
    const maxHeight = hasMaxRows ? lineHeight * resolvedMaxRows + extras : Infinity

    metricsRef.current = {
      minHeight,
      maxHeight,
      hasMax: hasMaxRows,
    }

    el.style.minHeight = `${minHeight}px`
    if (hasMaxRows) {
      el.style.maxHeight = `${maxHeight}px`
    } else {
      el.style.removeProperty('max-height')
    }
  }, [textareaRef, minRows, maxRows])

  const updateTextareaHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return

    if (metricsRef.current.minHeight === 0) {
      computeLineMetrics()
    }

    el.style.height = 'auto'
    const { minHeight, maxHeight, hasMax } = metricsRef.current
    const scrollHeight = el.scrollHeight
    const target = Math.min(Math.max(scrollHeight, minHeight), maxHeight)

    el.style.height = `${target}px`
    el.style.overflowY = hasMax && scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [textareaRef, computeLineMetrics])

  const handleResize = useCallback(() => {
    computeLineMetrics()
    updateTextareaHeight()
  }, [computeLineMetrics, updateTextareaHeight])

  useEffect(() => {
    computeLineMetrics()
    updateTextareaHeight()

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }

    if (typeof ResizeObserver !== 'undefined') {
      const el = textareaRef.current
      if (el) {
        resizeObserverRef.current = new ResizeObserver(() => handleResize())
        resizeObserverRef.current.observe(el)
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
      }
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null
    }
  }, [computeLineMetrics, handleResize, textareaRef, updateTextareaHeight])

  // 等价于 Vue watch(modelValue) -> nextTick(updateTextareaHeight)
  useLayoutEffect(() => {
    updateTextareaHeight()
  }, [updateTextareaHeight, value])

  return {
    syncHeight: updateTextareaHeight,
    computeMetrics: computeLineMetrics,
  }
}
