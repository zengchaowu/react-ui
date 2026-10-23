import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { PopupState, PopupTrigger } from '../types/state'
import type { VirtualElement } from '../types'
import { usePopupTimers } from './usePopupTimers'
import { useHoverEvents } from './useHoverEvents'
import { createCoarseHoverTouchTrigger } from './useCoarseHoverTouchTrigger'
import { createFinePointerHoverMediaWatch } from './useFinePointerHoverMediaWatch'
import { isRealElement } from '../utils/getElement'
import {
  finePointerHoverMatches,
  isHoverCoarseTouchMode,
  isHoverFinePointerMode,
} from '../utils/finePointerHoverMedia'

export interface UsePopupEventsOptions {
  state: PopupState
  getTriggerElement: () => HTMLElement | VirtualElement | null
  popupElement: RefObject<HTMLElement | null>
  bridgeElement: RefObject<HTMLElement | null>
  triggerType: PopupTrigger
  showDelay: number
  hideDelay: number
  onShow: () => void
  onHide: () => void
  onToggle: () => void
}

const PASSIVE = { passive: true } as const

/**
 * 弹出层事件管理 Hook
 * React 版：trigger / popup / bridge 的事件绑定与解绑由 effect 生命周期驱动。
 */
export function usePopupEvents(options: UsePopupEventsOptions) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const { state, triggerType } = options

  const timers = usePopupTimers({
    state,
    showDelay: options.showDelay,
    hideDelay: options.hideDelay,
    onShow: options.onShow,
    onHide: options.onHide,
  })

  // hover 事件对象只需创建一次（triggerType 为创建期配置，与 Vue 一致）
  const hoverEventsRef = useRef<ReturnType<typeof useHoverEvents> | null>(null)
  if (!hoverEventsRef.current) {
    hoverEventsRef.current = useHoverEvents({
      triggerType,
      onMouseEnter: timers.scheduleShow,
      onMouseLeave: timers.scheduleHide,
    })
  }
  const hoverEvents = hoverEventsRef.current

  const handleClick = useCallback(() => {
    const { state: currentState, onHide } = optionsRef.current
    if (optionsRef.current.triggerType !== 'click') return
    if (currentState.visible) {
      timers.clearTimers()
      onHide()
    } else {
      timers.scheduleShow()
    }
  }, [timers])

  const onFinePointerHoverMediaChange = useCallback(() => {
    const current = optionsRef.current
    if (current.triggerType !== 'hover') return
    const el = current.getTriggerElement()
    if (el && isRealElement(el)) {
      hoverEvents.unbindHoverEvents(el, 'triggerHoverBound')
      if (finePointerHoverMatches()) {
        hoverEvents.bindHoverEvents(el, 'triggerHoverBound')
      }
    }
    if (!finePointerHoverMatches() && current.state.visible) {
      timers.clearTimers()
      current.onHide()
    }
  }, [hoverEvents, timers])

  const coarseTouchRef = useRef<ReturnType<typeof createCoarseHoverTouchTrigger> | null>(null)
  if (!coarseTouchRef.current) {
    coarseTouchRef.current = createCoarseHoverTouchTrigger({
      enabled: () => isHoverCoarseTouchMode(optionsRef.current.triggerType),
      isVisible: () => optionsRef.current.state.visible,
      scheduleShow: timers.scheduleShow,
      clearTimers: timers.clearTimers,
    })
  }

  const finePointerMediaRef = useRef<ReturnType<typeof createFinePointerHoverMediaWatch> | null>(null)
  if (!finePointerMediaRef.current) {
    finePointerMediaRef.current = createFinePointerHoverMediaWatch({
      enabled: () => optionsRef.current.triggerType === 'hover',
      onChange: onFinePointerHoverMediaChange,
    })
  }

  // trigger 事件绑定（仅挂载时一次；triggerType 变化时重绑）
  useEffect(() => {
    const finePointerMedia = finePointerMediaRef.current
    const coarseTouch = coarseTouchRef.current
    const el = optionsRef.current.getTriggerElement()
    if (!el || !isRealElement(el)) return

    if (triggerType !== 'manual') {
      if (triggerType === 'click') {
        el.addEventListener('click', handleClick, PASSIVE)
      }

      if (triggerType === 'hover') {
        if (isHoverFinePointerMode(triggerType)) {
          hoverEvents.bindHoverEvents(el, 'triggerHoverBound')
          finePointerMedia?.attach()
        } else {
          coarseTouch?.bind(el)
        }
      }

      el.setAttribute('aria-haspopup', 'true')
      el.setAttribute('aria-expanded', String(optionsRef.current.state.visible))
    }

    return () => {
      if (triggerType !== 'manual') {
        if (triggerType === 'click') {
          el.removeEventListener('click', handleClick)
        }

        if (triggerType === 'hover') {
          hoverEvents.unbindHoverEvents(el, 'triggerHoverBound')
          coarseTouch?.unbind(el)
          finePointerMedia?.detach()
        }

        el.removeAttribute('aria-haspopup')
        el.removeAttribute('aria-expanded')
      }
    }
  }, [triggerType, handleClick, hoverEvents])

  // visible 变化：aria + popup / bridge hover 绑定
  const visible = state.visible
  useEffect(() => {
    const { getTriggerElement, popupElement, bridgeElement } = optionsRef.current

    const triggerEl = getTriggerElement()
    if (triggerEl && isRealElement(triggerEl)) {
      triggerEl.setAttribute('aria-expanded', String(visible))
    }

    const bindHoverIfFinePointer = (el: HTMLElement | null, boundKey: string) => {
      if (!el || !isHoverFinePointerMode(optionsRef.current.triggerType)) return
      hoverEvents.bindHoverEvents(el, boundKey)
    }

    if (visible) {
      bindHoverIfFinePointer(popupElement.current, 'popupHoverBound')
      bindHoverIfFinePointer(bridgeElement.current, 'bridgeHoverBound')
    }

    return () => {
      if (popupElement.current) {
        hoverEvents.unbindHoverEvents(popupElement.current, 'popupHoverBound')
      }
      if (bridgeElement.current) {
        hoverEvents.unbindHoverEvents(bridgeElement.current, 'bridgeHoverBound')
      }
    }
  }, [visible, triggerType, hoverEvents])

  // 卸载：解绑 hover 与媒体监听
  useEffect(() => {
    const finePointerMedia = finePointerMediaRef.current
    return () => {
      finePointerMedia?.detach()
      const { popupElement, bridgeElement } = optionsRef.current
      hoverEvents.unbindHoverEventsFromRef(popupElement, 'popupHoverBound')
      hoverEvents.unbindHoverEventsFromRef(bridgeElement, 'bridgeHoverBound')
    }
  }, [hoverEvents])

  return {
    clearTimers: timers.clearTimers,
  }
}
