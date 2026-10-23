import { useCallback, useEffect, useRef, useState } from 'react'
import { clearAppTheme, type AppTheme } from '@zengchaowu/shared/functions/dom/appTheme'
import {
  APPEARANCE_MODE_STORAGE_KEY,
  resolveEffectiveTheme,
} from '@zengchaowu/shared/functions/appearance/appearancePrefs'
import { createBrowserAppearanceModeAccess } from '@zengchaowu/shared/functions/appearance/createBrowserAppearanceModeAccess'
import type { AppearanceMode } from '@zengchaowu/shared/types/appearance'
import { applyEffectiveAppTheme } from '../utils/appThemeDom'

export type CreateUseAppearanceModeOptions = {
  /** 覆盖默认 applyEffectiveAppTheme（如 chat 原生状态栏） */
  applyTheme?: (theme: AppTheme) => void
  /** DOM 同步后的额外副作用（如刷新壁纸） */
  onAfterSync?: () => void
  /** 是否返回 effectiveTheme（browser 曾用） */
  includeEffectiveTheme?: boolean
  /** 是否在 qiankun 卸载时 clearAppTheme；默认读 globalThis.__POWERED_BY_QIANKUN__ */
  isQiankun?: () => boolean
}

export type UseAppearanceModeResult = {
  mode: AppearanceMode
  setMode: (next: AppearanceMode) => void
  effectiveTheme?: AppTheme
}

function defaultIsQiankun(): boolean {
  return Boolean(
    (globalThis as { __POWERED_BY_QIANKUN__?: boolean }).__POWERED_BY_QIANKUN__,
  )
}

/**
 * 工厂：各站外观 hook 共用（media / storage / qiankun 清理）。
 * 每个站在模块顶层调用一次，得到单例 useXxxAppearanceMode。
 */
export function createUseAppearanceMode(
  options: CreateUseAppearanceModeOptions = {},
): () => UseAppearanceModeResult {
  const prefs = createBrowserAppearanceModeAccess()

  return function useAppearanceMode(): UseAppearanceModeResult {
    const [mode, setModeState] = useState<AppearanceMode>(() => prefs.read())
    const modeRef = useRef(mode)
    modeRef.current = mode

    const applyTheme = useCallback(
      (theme: AppTheme) => {
        if (options.applyTheme) options.applyTheme(theme)
        else applyEffectiveAppTheme(theme)
      },
      [],
    )

    const syncDomTheme = useCallback(
      (next: AppearanceMode) => {
        applyTheme(resolveEffectiveTheme(next))
        options.onAfterSync?.()
      },
      [applyTheme],
    )

    const setMode = useCallback(
      (next: AppearanceMode) => {
        if (modeRef.current === next) return
        modeRef.current = next
        setModeState(next)
        prefs.write(next)
        syncDomTheme(next)
      },
      [prefs, syncDomTheme],
    )

    useEffect(() => {
      if (typeof window === 'undefined' || !window.matchMedia) return
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const onChange = () => {
        if (modeRef.current === 'system') syncDomTheme(modeRef.current)
      }
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    }, [syncDomTheme])

    useEffect(() => {
      if (typeof window === 'undefined') return
      const onStorage = (event: StorageEvent) => {
        if (event.storageArea !== localStorage) return
        if (event.key != null && event.key !== APPEARANCE_MODE_STORAGE_KEY) return
        const next = prefs.read()
        if (modeRef.current === next) return
        modeRef.current = next
        setModeState(next)
      }
      window.addEventListener('storage', onStorage)
      return () => window.removeEventListener('storage', onStorage)
    }, [prefs])

    useEffect(() => {
      syncDomTheme(modeRef.current)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const isQiankun = options.isQiankun ?? defaultIsQiankun
    useEffect(() => {
      if (!isQiankun()) return
      return () => {
        if (typeof document !== 'undefined') clearAppTheme(document.documentElement)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
      mode,
      setMode,
      ...(options.includeEffectiveTheme
        ? { effectiveTheme: resolveEffectiveTheme(mode) }
        : {}),
    }
  }
}
