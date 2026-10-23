import { useEffect, useRef } from 'react'
import {
  commitOverlayLayer,
  revokeOverlayLayer,
  syncOverlayLayerActive,
} from '../../../constants/cwOverlayStack'

type OverlayElementSource = () => HTMLElement | null | undefined

export interface UseCwOverlayLayerOptions {
  layerId: string
  enabled: boolean
  rootEl: OverlayElementSource
  panelEl: OverlayElementSource
  traps?: OverlayElementSource[]
  active: boolean
  dismissOnClickOutside?: () => boolean
  dismissOnEscape?: () => boolean
  onDismiss: () => void
}

/** Dialog / Sheet：panel + traps 注册 overlay dismiss */
export function useCwOverlayLayer(options: UseCwOverlayLayerOptions): void {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const { layerId, enabled, active } = options
  const traps = options.traps

  useEffect(() => {
    if (!enabled) {
      revokeOverlayLayer(layerId)
      return
    }

    const ok = commitOverlayLayer({
      layerId,
      rootEl: optionsRef.current.rootEl() ?? null,
      panelEl: optionsRef.current.panelEl() ?? null,
      trapEls: (optionsRef.current.traps ?? []).map((t) => t() ?? null),
      isActive: () => optionsRef.current.active,
      dismissOnClickOutside: () =>
        optionsRef.current.dismissOnClickOutside?.() ?? true,
      dismissOnEscape: () => optionsRef.current.dismissOnEscape?.() ?? true,
      onDismiss: () => optionsRef.current.onDismiss(),
    })

    if (!ok) revokeOverlayLayer(layerId)

    return () => {
      revokeOverlayLayer(layerId)
    }
  }, [layerId, enabled, traps])

  useEffect(() => {
    syncOverlayLayerActive(optionsRef.current.rootEl() ?? null, active)
  }, [active])
}
