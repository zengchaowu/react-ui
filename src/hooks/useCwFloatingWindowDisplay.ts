import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { readBrowserHostDepsFromGlobalThis } from '@zengchaowu/shared/functions/browser/readBrowserHost'
import type { FloatingWindowBounds } from './useCwFloatingWindowChrome'

export type FloatingWindowMode = 'normal' | 'minimized' | 'maximized'

export interface UseCwFloatingWindowDisplayOptions {
  mode: FloatingWindowMode
  bounds: FloatingWindowBounds
  getMaximizedBounds: () => FloatingWindowBounds
  trackViewportResize?: boolean
}

export function useCwFloatingWindowDisplay(options: UseCwFloatingWindowDisplayOptions) {
  const trackViewportResize = options.trackViewportResize !== false
  const [viewportTick, setViewportTick] = useState(0)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const isMinimized = options.mode === 'minimized'
  const isMaximized = options.mode === 'maximized'

  const displayBounds = useMemo((): FloatingWindowBounds => {
    void viewportTick
    if (optionsRef.current.mode === 'maximized') return optionsRef.current.getMaximizedBounds()
    return { ...optionsRef.current.bounds }
  }, [options.mode, options.bounds, viewportTick])

  const bumpViewportTick = useCallback(() => {
    setViewportTick((tick) => tick + 1)
  }, [])

  useEffect(() => {
    if (!trackViewportResize) return
    const win = readBrowserHostDepsFromGlobalThis().host.window as Window | undefined
    win?.addEventListener('resize', bumpViewportTick)
    return () => win?.removeEventListener('resize', bumpViewportTick)
  }, [trackViewportResize, bumpViewportTick])

  return {
    isMinimized,
    isMinimizeHidden: isMinimized,
    isMaximized,
    displayBounds,
    bumpViewportTick,
  }
}
