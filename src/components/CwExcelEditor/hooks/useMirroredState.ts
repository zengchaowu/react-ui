import { useCallback, useRef, useState } from 'react'

/**
 * useState + 同步镜像 ref。Vue 的 ref 写入后立刻能读到新值；
 * React setState 之后同一事件里读 state 还是旧的，镜像 ref 用来复刻 `.value` 语义。
 */
export function useMirroredState<T>(initial: T | (() => T)) {
  const [state, setState] = useState(initial)
  const ref = useRef(state)
  const set = useCallback((value: T | ((prev: T) => T)) => {
    const next = typeof value === 'function' ? (value as (prev: T) => T)(ref.current) : value
    ref.current = next
    setState(next)
  }, [])
  return [state, set, ref] as const
}
