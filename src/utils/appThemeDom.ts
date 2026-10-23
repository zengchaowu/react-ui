import { useEffect, useState } from 'react'
import type { AppTheme } from '@zengchaowu/shared/functions/dom/appTheme'
import {
  clearAppTheme,
  setAppTheme,
} from '@zengchaowu/shared/functions/dom/appTheme'
import {
  APPEARANCE_MODE_STORAGE_KEY,
  resolveEffectiveTheme,
} from '@zengchaowu/shared/functions/appearance/appearancePrefs'
import { createBrowserAppearanceModeAccess } from '@zengchaowu/shared/functions/appearance/createBrowserAppearanceModeAccess'
import type { AppearanceMode } from '@zengchaowu/shared/types/appearance'

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

export type ApplyEffectiveAppThemeOptions = {
  /** 默认 document.documentElement */
  root?: {
    getAttribute(name: string): string | null
    setAttribute(name: string, value: string): void
    removeAttribute(name: string): void
  }
  /** DOM 写完、事件派发前的钩子（如原生状态栏同步） */
  afterApply?: (theme: AppTheme) => void
}

/** 将有效主题写入 DOM 并派发变更事件 */
export function applyEffectiveAppTheme(
  theme: AppTheme,
  options?: ApplyEffectiveAppThemeOptions,
): void {
  if (typeof document === 'undefined' && !options?.root) return
  const root = options?.root ?? document.documentElement
  if (theme === 'dark') setAppTheme('dark', root)
  else clearAppTheme(root)
  options?.afterApply?.(theme)
  dispatchAppThemeChanged(theme)
}

export type BootstrapAppearanceThemeOptions = {
  read?: () => AppearanceMode
  afterApply?: ApplyEffectiveAppThemeOptions['afterApply']
}

/** 首屏挂载前调用，减少主题闪烁 */
export function bootstrapAppearanceTheme(
  options?: BootstrapAppearanceThemeOptions,
): void {
  if (typeof document === 'undefined') return
  const read = options?.read ?? createBrowserAppearanceModeAccess().read
  applyEffectiveAppTheme(resolveEffectiveTheme(read()), {
    afterApply: options?.afterApply,
  })
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

