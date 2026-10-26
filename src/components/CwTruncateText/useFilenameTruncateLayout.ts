import { useCallback, useLayoutEffect, useState } from 'react'
import type { RefObject } from 'react'
import {
  resolveFilenameDisplay,
  type FilenameDisplayResolution,
} from './functions/resolveFilenameDisplay'

const IDLE: FilenameDisplayResolution = {
  text: '',
  abbreviated: false,
  tailRtl: false,
}

export interface UseFilenameTruncateLayoutOptions {
  active: boolean
  sourceText: string
  headChars: number
  rootEl: HTMLElement | null
  rootRef: RefObject<HTMLElement | null>
  measureRef: RefObject<HTMLElement | null>
}

export function useFilenameTruncateLayout(
  options: UseFilenameTruncateLayoutOptions,
) {
  const { active, sourceText, headChars, rootEl, rootRef, measureRef } = options

  const [layout, setLayout] = useState<FilenameDisplayResolution>({ ...IDLE })

  const remeasure = useCallback(() => {
    if (!active) {
      setLayout({ ...IDLE })
      return
    }
    if (!sourceText) {
      setLayout({ text: '', abbreviated: false, tailRtl: false })
      return
    }
    const probe = measureRef.current
    // 读 ref 而不是 rootEl 状态：节点切换时状态可能还指向已卸载的旧节点
    const el = rootRef.current
    if (!el || !probe) {
      setLayout({ text: sourceText, abbreviated: false, tailRtl: false })
      return
    }
    const width = el.clientWidth
    setLayout(
      resolveFilenameDisplay(
        sourceText,
        (candidate) => {
          if (width <= 0) return true
          probe.textContent = candidate
          return probe.scrollWidth <= width + 1
        },
        { headChars },
      ),
    )
    probe.textContent = ''
  }, [active, sourceText, headChars, rootRef, measureRef])

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
