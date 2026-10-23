import { tryDismissTopOverlayLayer } from './cwOverlayStack'

export type CwBackHandler = () => boolean

const handlers: CwBackHandler[] = []

/** 后注册的先执行。返回 true 表示已消费返回。 */
export function registerCwBackHandler(handler: CwBackHandler): () => void {
  handlers.push(handler)
  let removed = false
  return () => {
    if (removed) return
    removed = true
    const i = handlers.lastIndexOf(handler)
    if (i >= 0) handlers.splice(i, 1)
  }
}

export function runTopCwBackHandler(): boolean {
  for (let i = handlers.length - 1; i >= 0; i--) {
    const handler = handlers[i]
    if (handler?.()) return true
  }
  return false
}

/** Android 返回：先关浮层，再走页面/栈 handler，否则 fallback（通常回桌面）。 */
export function handleCwNativeBackPress(fallback: () => void): void {
  if (tryDismissTopOverlayLayer()) return
  if (runTopCwBackHandler()) return
  fallback()
}
