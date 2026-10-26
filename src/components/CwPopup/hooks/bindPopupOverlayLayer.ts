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
  /** portal 是否已挂载（refs 是否可能就绪），参与同步时机依赖 */
  containerMounted?: boolean
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
 * React 版：仅在显隐/挂载时机（及点击外部配置）变化后调度一次 rAF 同步，与 vue-ui
 * 的 watch 依赖对齐；不可随每次重渲染同步——位置更新（manual + mousemove）会高频
 * 重渲染，重复重排浮层 host 会让内容丢失 :hover / 重置滚动，表现为 hover 闪烁。
 */
export function useBindPopupOverlayLayer(options: BindPopupOverlayLayerOptions): void {
  const optionsRef = useRef(options)
  optionsRef.current = options
  const { layerId, containerMounted = true, closeOnClickOutside } = options
  const active = options.isActive()

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
  }, [active, containerMounted, closeOnClickOutside, layerId])

  useEffect(() => {
    return () => revokeOverlayLayer(layerId)
  }, [layerId])
}
