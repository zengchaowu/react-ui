import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { TurnstileWidgetSize } from '@zengchaowu/ui-shared/components/CwTurnstileCaptchaDialog/types'

const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js'

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string
      execute: (widgetId?: string) => void
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

let scriptPromise: Promise<void> | null = null

function ensureTurnstilePreconnect(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector('link[data-turnstile-preconnect]')) return

  for (const href of [
    'https://challenges.cloudflare.com',
    'https://challenges.cloudflare.com/cdn-cgi',
  ]) {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = href
    link.setAttribute('data-turnstile-preconnect', '1')
    document.head.appendChild(link)
  }
}

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Turnstile 仅支持浏览器环境'))
  }
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  ensureTurnstilePreconnect()

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${TURNSTILE_SCRIPT}?render=explicit`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('人机验证脚本加载失败'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

/** 提前加载 Turnstile 脚本，减少验证弹窗内等待时间 */
export function preloadTurnstileScript(): Promise<void> {
  return loadTurnstileScript()
}

/** 解析站点 env / 配置中的 widget size */
export function resolveTurnstileWidgetSize(
  raw?: string | null,
): TurnstileWidgetSize {
  const value = String(raw ?? '')
    .trim()
    .toLowerCase()
  if (value === 'normal' || value === 'compact' || value === 'invisible') {
    return value
  }
  return 'invisible'
}

export interface UseTurnstileOptions {
  widgetSize?: TurnstileWidgetSize
}

export interface UseTurnstileReturn {
  ensureWidget: () => Promise<void>
  waitForVerification: () => Promise<string>
  destroy: () => void
  widgetSize: TurnstileWidgetSize
  isVisible: boolean
}

export function useTurnstile(
  siteKey: string,
  containerRef: RefObject<HTMLElement | null>,
  options?: UseTurnstileOptions,
): UseTurnstileReturn {
  const widgetSize = options?.widgetSize ?? 'invisible'
  const isVisible = widgetSize !== 'invisible'

  const siteKeyRef = useRef(siteKey)
  siteKeyRef.current = siteKey
  const widgetSizeRef = useRef(widgetSize)
  widgetSizeRef.current = widgetSize
  const isVisibleRef = useRef(isVisible)
  isVisibleRef.current = isVisible

  const widgetIdRef = useRef<string | null>(null)
  const pendingResolveRef = useRef<((token: string) => void) | null>(null)
  const pendingRejectRef = useRef<((error: Error) => void) | null>(null)

  const clearPending = useCallback((): void => {
    pendingResolveRef.current = null
    pendingRejectRef.current = null
  }, [])

  const ensureWidget = useCallback(async (): Promise<void> => {
    const key = siteKeyRef.current.trim()
    const container = containerRef.current
    if (!key || !container) return
    await loadTurnstileScript()
    if (widgetIdRef.current) return

    widgetIdRef.current = window.turnstile!.render(container, {
      sitekey: key,
      size: widgetSizeRef.current,
      callback: (token: string) => {
        pendingResolveRef.current?.(token)
      },
      'error-callback': () => {
        pendingRejectRef.current?.(new Error('人机验证失败，请重试'))
      },
      'expired-callback': () => {
        pendingRejectRef.current?.(new Error('人机验证已过期，请重试'))
      },
    })
  }, [containerRef])

  const waitForVerification = useCallback(async (): Promise<string> => {
    await ensureWidget()
    const widgetId = widgetIdRef.current
    if (!widgetId || !window.turnstile) {
      throw new Error('人机验证未配置')
    }

    return new Promise<string>((resolve, reject) => {
      pendingResolveRef.current = resolve
      pendingRejectRef.current = reject
      if (!isVisibleRef.current) {
        window.turnstile!.execute(widgetId)
      }
    }).finally(() => {
      clearPending()
      if (widgetIdRef.current) {
        window.turnstile?.reset(widgetIdRef.current)
      }
    })
  }, [ensureWidget, clearPending])

  const destroy = useCallback((): void => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.remove(widgetIdRef.current)
    }
    widgetIdRef.current = null
    clearPending()
  }, [clearPending])

  useEffect(() => {
    return () => {
      destroy()
    }
  }, [destroy])

  return { ensureWidget, waitForVerification, destroy, widgetSize, isVisible }
}
