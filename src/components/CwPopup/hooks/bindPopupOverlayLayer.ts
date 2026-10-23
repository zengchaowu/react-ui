import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { VirtualElement } from '../types'
import { isRealElement } from '../utils/getElement'
import {
  commitOverlayLayer,
  revokeOverlayLayer,
  syncOverlayLayerActive,
  scheduleBringOverlayHostToFront,
} from '../../../constants/cwOverlayStack'

export interface BindPopupOverlayLayerOptions {
  layerId: string
  mountHostEl: () => HTMLElement | null
  popupElement: RefObject<HTMLElement | null>
  bridgeElement: RefObject<HTMLElement | null>
  getTriggerElement: () => HTMLElement | VirtualElement | null
  closeOnClickOutside: boolean
  isActive: () => boolean
  onHide: () => void
  shouldAbortDismiss?: () => boolean
  getExtraTraps?: () => (HTMLElement | null | undefined)[]
}

function collectPopupTraps(
  getTriggerElement: () => HTMLElement | VirtualElement | null,
  bridgeElement: HTMLElement | null,
  getExtraTraps?: () => (HTMLElement | null | undefined)[],
): (HTMLElement | null)[] {
  const trigger = getTriggerElement()
  const traps: (HTMLElement | null)[] = [bridgeElement]
  if (trigger && isRealElement(trigger)) traps.unshift(trigger)
  if (getExtraTraps) {
    for (const el of getExtraTraps()) {
      if (el) traps.push(el)
    }
  }
  return traps
}

/**
 * 函数式 Popup：panel + trigger + bridge traps 注册 overlay dismiss
 * React 版：每次提交后调度一次 rAF 同步，卸载时 revoke。
 */
export function useBindPopupOverlayLayer(options: BindPopupOverlayLayerOptions): void {
  const optionsRef = useRef(options)
  optionsRef.current = options
  const { layerId } = options

  useEffect(() => {
    const syncLayer = () => {
      const {
        mountHostEl,
        popupElement,
        bridgeElement,
        getTriggerElement,
        closeOnClickOutside,
        isActive,
        onHide,
        shouldAbortDismiss,
        getExtraTraps,
      } = optionsRef.current

      const panel = popupElement.current
      const active = isActive()

      if (!active) {
        syncOverlayLayerActive(panel, false)
        revokeOverlayLayer(layerId)
        return
      }

      const ok = commitOverlayLayer({
        layerId,
        rootEl: panel,
        panelEl: panel,
        trapEls: collectPopupTraps(getTriggerElement, bridgeElement.current, getExtraTraps),
        isActive,
        dismissOnClickOutside: () => closeOnClickOutside,
        onDismiss: () => {
          if (shouldAbortDismiss?.()) return
          onHide()
        },
      })

      if (!ok) {
        syncOverlayLayerActive(panel, false)
        revokeOverlayLayer(layerId)
      } else {
        scheduleBringOverlayHostToFront(mountHostEl)
      }
    }

    const frame = requestAnimationFrame(syncLayer)
    return () => cancelAnimationFrame(frame)
  })

  useEffect(() => {
    return () => revokeOverlayLayer(layerId)
  }, [layerId])
}
