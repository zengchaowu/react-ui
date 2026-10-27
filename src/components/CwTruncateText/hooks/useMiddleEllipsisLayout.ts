import { useCallback, useLayoutEffect, useState } from 'react'
import type { RefObject } from 'react'
import {
  resolveMiddleEllipsisDisplay,
  type MiddleEllipsisResolution,
} from '../functions/resolveMiddleEllipsisDisplay'

const IDLE: MiddleEllipsisResolution = { text: '', abbreviated: false }

export interface UseMiddleEllipsisLayoutOptions {
  active: boolean
  sourceText: string
  rootEl: HTMLElement | null
  rootRef: RefObject<HTMLElement | null>
  measureRef: RefObject<HTMLElement | null>
}

export function useMiddleEllipsisLayout(
  options: UseMiddleEllipsisLayoutOptions,
) {
  const { active, sourceText, rootEl, rootRef, measureRef } = options

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
    // 读 ref 而不是 rootEl 状态：节点切换时状态可能还指向已卸载的旧节点
    const el = rootRef.current
    if (!el || !probe) {
      setLayout({ text: sourceText, abbreviated: false })
      return
    }
    const width = el.clientWidth
    setLayout(
      resolveMiddleEllipsisDisplay(sourceText, (candidate) => {
        if (width <= 0) return true
        probe.textContent = candidate
        return probe.scrollWidth <= width + 1
      }),
    )
    probe.textContent = ''
  }, [active, sourceText, rootRef, measureRef])

  useLayoutEffect(() => {
    remeasure()
    const el = rootRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const resizeObserver = new ResizeObserver(() => remeasure())
    resizeObserver.observe(el)
    return () => {
      resizeObserver.disconnect()
    }
  }, [remeasure, rootEl, rootRef])

  return { layout, remeasure }
}
