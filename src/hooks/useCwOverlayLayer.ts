import { useEffect } from 'react'
import {
  commitOverlayLayer,
  revokeOverlayLayer,
  syncOverlayLayerActive,
} from '../constants/cwOverlayStack'

type OverlayElementSource = () => HTMLElement | null | undefined

export interface UseCwOverlayLayerOptions {
  layerId: string
  enabled: boolean
  rootEl: OverlayElementSource
  panelEl: OverlayElementSource
  traps?: OverlayElementSource[]
  isActive: () => boolean
  dismissOnClickOutside?: () => boolean
  dismissOnEscape?: () => boolean
  onDismiss: () => void
}

/** Dialog / Sheet：panel + traps 注册 overlay dismiss */
export function useCwOverlayLayer(options: UseCwOverlayLayerOptions): void {
  const {
    layerId,
    enabled,
    rootEl,
    panelEl,
    traps = [],
    isActive,
    dismissOnClickOutside,
    dismissOnEscape,
    onDismiss,
  } = options

  // 每次渲染后（DOM 已提交）刷新注册；引用变化即更新，等价于 Vue 的 deep watch
  useEffect(() => {
    if (!enabled) {
      revokeOverlayLayer(layerId)
      return
    }

    const ok = commitOverlayLayer({
      layerId,
      rootEl: rootEl() ?? null,
      panelEl: panelEl() ?? null,
      trapEls: traps.map((t) => t() ?? null),
      isActive,
      dismissOnClickOutside,
      dismissOnEscape,
      onDismiss,
    })

    if (!ok) revokeOverlayLayer(layerId)
    syncOverlayLayerActive(rootEl() ?? null, isActive())
  })

  useEffect(() => {
    return () => {
      revokeOverlayLayer(layerId)
    }
  }, [layerId])
}
