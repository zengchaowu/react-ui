/**
 * CwPage 的页面级环境引导（React 版本）。
 *
 * 三条原则：
 * 1. 宿主优先：文档已经初始化过安全区 / 已经锁过视口，就一律跳过，不覆盖宿主的原生壳判定；
 * 2. 引用计数：多页面（路由切换、嵌套页面、同屏双实例）只加一次锁、只绑一次键盘监听，
 *    最后一个实例卸载才还原，且只移除自己加的 class；
 * 3. SSR 安全：所有逻辑都在挂载后执行，并对 `document` 做存在性判断。
 */
import { useEffect } from 'react'
import {
  APP_ROOT_VIEWPORT_LOCK_CLASS,
  bootstrapDocumentAppSafeArea,
} from '@zengchaowu/shared/functions/browser/bootstrapAppSafeArea'
import { bootstrapVirtualKeyboardInsets } from '../../lib/virtualKeyboard'

/** 缺 safe-area 档位时才补一次引导（宿主已引导则整段跳过） */
export function ensureDocumentSafeArea(): void {
  if (typeof document === 'undefined') return
  if (document.documentElement.dataset.appSafeAreaProfile) return
  bootstrapDocumentAppSafeArea({ pinViewportHeight: true })
}

// ---- 视口锁：引用计数 ----
let lockRefCount = 0
/** 锁是不是组件加的；宿主自己加过就不能在卸载时摘掉 */
let lockAddedByUs = false
let releaseKeyboard: (() => void) | null = null

function acquireViewportLock(): () => void {
  if (typeof document === 'undefined') return () => {}
  const root = document.documentElement

  lockRefCount += 1
  if (lockRefCount === 1) {
    lockAddedByUs = !root.classList.contains(APP_ROOT_VIEWPORT_LOCK_CLASS)
    if (lockAddedByUs) {
      root.classList.add(APP_ROOT_VIEWPORT_LOCK_CLASS)
      // 锁了视口才有必要代持键盘监听：把底部安全区随键盘归零
      releaseKeyboard = bootstrapVirtualKeyboardInsets()
    }
  }

  let released = false
  return () => {
    if (released) return
    released = true
    lockRefCount = Math.max(0, lockRefCount - 1)
    if (lockRefCount > 0 || !lockAddedByUs) return
    root.classList.remove(APP_ROOT_VIEWPORT_LOCK_CLASS)
    releaseKeyboard?.()
    releaseKeyboard = null
    lockAddedByUs = false
  }
}

// ---- 开发期自检 ----
let warnedViewportMeta = false

/** iOS 安全区依赖 viewport-fit=cover；缺了只会静默取 0，这里给一次提示 */
function warnMissingViewportCover(): void {
  if (warnedViewportMeta || typeof document === 'undefined') return
  const meta = document.querySelector('meta[name="viewport"]')
  const content = meta?.getAttribute('content') ?? ''
  if (/viewport-fit\s*=\s*cover/i.test(content)) return
  warnedViewportMeta = true
  console.warn(
    '[CwPage] viewport meta 缺少 viewport-fit=cover，iOS 的 env(safe-area-inset-*) 会取 0。'
      + '请在 index.html 中使用：<meta name="viewport" content="width=device-width, initial-scale=1, '
      + 'viewport-fit=cover, interactive-widget=resizes-content">',
  )
}

export interface CwPageEnvOptions {
  /** 挂载时是否补安全区引导 */
  autoSafeArea: boolean
  /** 是否锁 html 视口（应用壳页面开，嵌入画布 / 微应用里关） */
  lockViewport: boolean
}

export function useCwPageEnv(options: CwPageEnvOptions): void {
  const { autoSafeArea, lockViewport } = options

  useEffect(() => {
    if (autoSafeArea) ensureDocumentSafeArea()

    let releaseLock: (() => void) | null = null
    if (lockViewport) {
      releaseLock = acquireViewportLock()
    }

    if (import.meta.env.DEV) warnMissingViewportCover()

    return () => {
      releaseLock?.()
    }
  }, [autoSafeArea, lockViewport])
}
