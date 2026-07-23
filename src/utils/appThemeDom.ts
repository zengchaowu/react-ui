import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import type { AppTheme } from '@zengchaowu/shared/functions/dom/appTheme'

/** 应用级主题变更事件（chat / storybook 等在 setAppTheme 后派发） */
export const ZCW_APP_THEME_CHANGED_EVENT = 'zcw:app-theme-changed'

export function readAppTheme(): AppTheme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

export function dispatchAppThemeChanged(theme: AppTheme): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(ZCW_APP_THEME_CHANGED_EVENT, { detail: { theme } }))
}

/** 主输入为鼠标/触控板（非触屏长按场景）时仍应保留右键菜单 */
export function isFinePointerPrimaryInput(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

/** 供 theme=auto 组件订阅主题切换 */
export function useAppThemeTick(): number {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const bump = () => setTick((t) => t + 1)
    window.addEventListener(ZCW_APP_THEME_CHANGED_EVENT, bump)
    return () => window.removeEventListener(ZCW_APP_THEME_CHANGED_EVENT, bump)
  }, [])
  return tick
}

/** loading 延迟显示（避免闪烁） */
export function useDelayedTrue(source: boolean, delayMs: number): boolean {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!source) {
      setVisible(false)
      return
    }
    if (delayMs <= 0) {
      setVisible(true)
      return
    }
    const timer = setTimeout(() => setVisible(true), delayMs)
    return () => clearTimeout(timer)
  }, [source, delayMs])

  return visible
}

export type { Dispatch, SetStateAction }
