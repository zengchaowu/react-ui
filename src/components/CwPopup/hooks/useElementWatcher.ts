import { useEffect, useRef } from 'react'

export interface UseElementWatcherOptions {
  /** 已提交的元素（React 中由父级传入） */
  element: HTMLElement | null
  onElementAvailable: () => void
}

/**
 * 等待元素可用后执行回调（React 版：元素就绪的那次提交后触发）
 */
export function useElementWatcher(options: UseElementWatcherOptions): void {
  const { element, onElementAvailable } = options
  const callbackRef = useRef(onElementAvailable)
  callbackRef.current = onElementAvailable

  useEffect(() => {
    if (element) callbackRef.current()
  }, [element])
}
