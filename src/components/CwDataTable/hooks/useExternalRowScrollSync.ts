import { useCallback, useEffect } from 'react'
import type { MutableRefObject, RefObject, UIEvent as ReactUIEvent } from 'react'

export interface UseExternalRowScrollSyncOptions {
  externalRowRef: RefObject<HTMLElement | null>
  headerRef: RefObject<HTMLDivElement | null>
  bodyElRef: RefObject<HTMLElement | null>
  scrollLeft: number
  /** 与表头/表体滚动同步共用的回声拦截标记 */
  isSyncingRef: MutableRefObject<boolean>
  stopSyncing: () => void
}

/** 外部行横向滚动与表头、表体 scrollLeft 双向同步 */
export function useExternalRowScrollSync(options: UseExternalRowScrollSyncOptions) {
  const { externalRowRef, headerRef, bodyElRef, scrollLeft, isSyncingRef, stopSyncing } = options

  const handleExternalRowScroll = useCallback(
    (event: ReactUIEvent<HTMLDivElement>) => {
      if (isSyncingRef.current) return
      const target = event.currentTarget
      isSyncingRef.current = true
      const header = headerRef.current
      if (header && Math.abs(target.scrollLeft - header.scrollLeft) > 1) {
        header.scrollLeft = target.scrollLeft
      }
      const body = bodyElRef.current
      if (body && Math.abs(target.scrollLeft - body.scrollLeft) > 1) {
        body.scrollLeft = target.scrollLeft
      }
      stopSyncing()
    },
    [bodyElRef, headerRef, isSyncingRef, stopSyncing],
  )

  useEffect(() => {
    const el = externalRowRef.current
    if (!el || isSyncingRef.current) return
    if (Math.abs(el.scrollLeft - scrollLeft) <= 1) return
    isSyncingRef.current = true
    el.scrollLeft = scrollLeft
    stopSyncing()
  }, [externalRowRef, scrollLeft, isSyncingRef, stopSyncing])

  return { handleExternalRowScroll }
}
