import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Vue `ref` 语义的 React 适配层：`{ value: T }` 读写即触发宿主组件重渲染，
 * 读取始终命中最新值（与 Vue ref 一致），便于把 composables 一比一移植为 hooks。
 */
export interface ReactiveRef<T> {
  value: T
}

export function useReactiveRef<T>(initial?: T | (() => T)): ReactiveRef<T> {
  const [, setTick] = useState(0)
  const boxRef = useRef<{ v: T } | null>(null)
  if (boxRef.current === null) {
    boxRef.current = {
      v: typeof initial === 'function' ? (initial as () => T)() : (initial as T),
    }
  }
  const box = boxRef.current
  return useMemo<ReactiveRef<T>>(
    () => ({
      get value() {
        return box.v
      },
      set value(v: T) {
        if (Object.is(box.v, v)) return
        box.v = v
        setTick((t) => t + 1)
      },
    }),
    [box],
  )
}

/** Vue `shallowRef` 对应物（本库语义与 useReactiveRef 相同）。 */
export function useReactiveShallowRef<T>(initial?: T | (() => T)): ReactiveRef<T> {
  return useReactiveRef(initial)
}

/** Vue `computed` 对应物：访问 `.value` 时惰性求值，宿主重渲染即得到最新结果。 */
export function useReactiveComputed<T>(getter: () => T): ReactiveRef<T> {
  const getterRef = useRef(getter)
  getterRef.current = getter
  return useMemo<ReactiveRef<T>>(
    () => ({
      get value() {
        return getterRef.current()
      },
      set value(_v: T) {
        throw new Error('Cannot write to a computed ref')
      },
    }),
    [],
  )
}

/**
 * Vue `watch`（非 immediate）对应物：源值变化时在提交后触发回调，首渲染不触发。
 */
export function useWatch<T>(source: () => T, callback: (value: T, prev: T) => void): void {
  const prevRef = useRef<{ v: T } | null>(null)
  if (prevRef.current === null) {
    prevRef.current = { v: source() }
  }
  const callbackRef = useRef(callback)
  callbackRef.current = callback
  const value = source()
  useEffect(() => {
    const prev = prevRef.current
    if (prev === null) return
    if (Object.is(prev.v, value)) return
    const old = prev.v
    prev.v = value
    callbackRef.current(value, old)
  })
}

/**
 * 跨渲染持久化的可变盒子（不触发重渲染），替代 Vue composable 单次执行闭包里的 `let`。
 */
export function useStableBox<T>(initial: T | (() => T)): { value: T } {
  const boxRef = useRef<{ value: T } | null>(null)
  if (boxRef.current === null) {
    boxRef.current = {
      value: typeof initial === 'function' ? (initial as () => T)() : initial,
    }
  }
  return boxRef.current
}

/** Vue `nextTick` 对应物：事件回调中等待本轮 React 提交 + DOM 更新后执行。 */
export function nextTick(callback?: () => void): Promise<void> {
  return new Promise((resolve) => {
    const run = () => {
      callback?.()
      resolve()
    }
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(run)
    } else {
      setTimeout(run, 0)
    }
  })
}
