import { useCallback, useLayoutEffect, useState } from 'react'
import type { RefObject } from 'react'
import {
  resolveMiddleEllipsisDisplay,
  type MiddleEllipsisResolution,
} from './functions/resolveMiddleEllipsisDisplay'

const IDLE: MiddleEllipsisResolution = { text: '', abbreviated: false }

export interface UseMiddleEllipsisLayoutOptions {
  active: boolean
  sourceText: string
  rootEl: HTMLElement | null
  measureRef: RefObject<HTMLElement | null>
}

export function useMiddleEllipsisLayout(
  options: UseMiddleEllipsisLayoutOptions,
) {
  const { active, sourceText, rootEl, measureRef } = options

  const [layout, setLayout] = useState<MiddleEllipsisResolution>({ ...IDLE })

  const remeasure = useCallback(() => {
    if (!active) {
      setLayout({ ...IDLE })
      return
    }
    if (!sourceText) {
      setLayout({ text: '', abbreviated: false })
      return
    }
    const probe = measureRef.current
    if (!rootEl || !probe) {
      setLayout({ text: sourceText, abbreviated: false })
      return
    }
    const width = rootEl.clientWidth
    setLayout(
      resolveMiddleEllipsisDisplay(sourceText, (candidate) => {
        if (width <= 0) return true
        probe.textContent = candidate
        return probe.scrollWidth <= width + 1
      }),
    )
    probe.textContent = ''
  }, [active, sourceText, rootEl, measureRef])

  useLayoutEffect(() => {
    remeasure()
    if (!rootEl || typeof ResizeObserver === 'undefined') return
    const resizeObserver = new ResizeObserver(() => remeasure())
    resizeObserver.observe(rootEl)
    return () => {
      resizeObserver.disconnect()
    }
  }, [remeasure, rootEl])

  return { layout, remeasure }
}
