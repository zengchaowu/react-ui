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
  measureRef: RefObject<HTMLElement | null>
}

export function useFilenameTruncateLayout(
  options: UseFilenameTruncateLayoutOptions,
) {
  const { active, sourceText, headChars, rootEl, measureRef } = options

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
    if (!rootEl || !probe) {
      setLayout({ text: sourceText, abbreviated: false, tailRtl: false })
      return
    }
    const width = rootEl.clientWidth
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
  }, [active, sourceText, headChars, rootEl, measureRef])

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
