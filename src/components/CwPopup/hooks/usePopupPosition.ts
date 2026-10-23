import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { PopupState, PopupContext, PopupPluginFunction } from '../types/state'
import type { VirtualElement } from '../types'
import createSyncPluginSystem from '@zengchaowu/shared/functions/patterns/usePluginSystem'
import { getBasePlacement } from '@zengchaowu/shared/functions/dom/getBasePlacement'
import { calculateBridgeDimensions } from '../functions/calculateBridgeDimensions'
import { usePopupResizeObserver } from './usePopupResizeObserver'
import { useMouseMoveTracker } from './useMouseMoveTracker'
import { isRealElement } from '../utils/getElement'
import { DEFAULT_CONFIG } from '../constants'

interface PluginSystem {
  addPlugin: (plugin: PopupPluginFunction) => void
  execute: (context: PopupContext) => PopupState
}

export interface UsePopupPositionOptions {
  state: PopupState
  popupElement: RefObject<HTMLElement | null>
  pluginElement: RefObject<HTMLElement | null>
  bridgeElement: RefObject<HTMLElement | null>
  getTriggerElement: () => HTMLElement | VirtualElement | null
  plugins: PopupPluginFunction[]
  triggerType?: string
  containerMounted: boolean
  notify: () => void
}

/**
 * 弹出层位置管理 Hook
 */
export function usePopupPosition(options: UsePopupPositionOptions) {
  const {
    state,
    popupElement,
    pluginElement,
    bridgeElement,
    getTriggerElement,
    plugins,
    triggerType,
    containerMounted,
    notify,
  } = options

  const pluginSystemRef = useRef<PluginSystem | null>(null)
  if (!pluginSystemRef.current) {
    const system = createSyncPluginSystem<PopupState, PopupContext>(state)
    plugins.forEach((plugin) => system.addPlugin(plugin))
    pluginSystemRef.current = system
  }

  /**
   * 更新桥接区域的位置和大小
   * 桥接区域填充 trigger 和 popup 之间的空间，防止鼠标移动时弹窗消失
   */
  const updateBridgePosition = useCallback(() => {
    const triggerEl = getTriggerElement()
    const bridge = bridgeElement.current
    const popup = popupElement.current
    if (!bridge || !popup || !triggerEl || !state.position) return

    try {
      const { transform, size } = calculateBridgeDimensions(
        triggerEl.getBoundingClientRect(),
        popup.getBoundingClientRect(),
        getBasePlacement(state.targetPlacement) as 'top' | 'bottom' | 'left' | 'right',
      )
      bridge.style.transform = transform
      bridge.style.width = size.width
      bridge.style.height = size.height
    } catch (error) {
      console.error('[CwPopup] Failed to update bridge position:', error)
    }
  }, [bridgeElement, getTriggerElement, popupElement, state])

  const updatePosition = useCallback((): boolean => {
    const triggerEl = getTriggerElement()
    const popup = popupElement.current
    const pluginEl = pluginElement.current
    if (!state.visible || !popup || !triggerEl || !pluginEl) {
      return false
    }

    try {
      // Popup 使用 fixed 定位，坐标已经是相对于视口的，不需要加上 scrollOffset
      state.scrollOffset = {
        x: 0,
        y: 0,
      }

      const context: PopupContext = {
        referenceElement: triggerEl,
        popupElement: popup,
        pluginElement: pluginEl,
      }

      Object.assign(state, pluginSystemRef.current!.execute(context))
      notify()
      return !!state.position
    } catch (error) {
      console.error('[CwPopup] Failed to update position:', error)
      return false
    }
  }, [getTriggerElement, notify, pluginElement, popupElement, state])

  const onObservedResize = useCallback(() => {
    updatePosition()
    updateBridgePosition()
  }, [updateBridgePosition, updatePosition])

  // ResizeObserver：真实 DOM trigger
  const getTriggerTarget = useCallback(() => {
    const el = getTriggerElement()
    return el && isRealElement(el) ? el : null
  }, [getTriggerElement])

  // 弹层内容变宽/变高时立刻重算（Cascader 多列展开等）
  const getFloatingTarget = useCallback(() => popupElement.current, [popupElement])

  usePopupResizeObserver({
    state,
    targetElement: getTriggerTarget,
    onResize: onObservedResize,
  })

  usePopupResizeObserver({
    state,
    targetElement: getFloatingTarget,
    onResize: onObservedResize,
    enabled: state.visible && containerMounted,
  })

  useMouseMoveTracker({
    state,
    onMove: onObservedResize,
    // 对于 manual 模式，禁用节流以获得更流畅的拖拽体验
    throttleDelay: triggerType === 'manual' ? 0 : DEFAULT_CONFIG.throttleDelay,
  })

  // position 变化后同步桥接区域
  useEffect(() => {
    if (!state.position) return
    const frame = requestAnimationFrame(updateBridgePosition)
    return () => cancelAnimationFrame(frame)
  })

  // 滚动 / 窗口尺寸变化时自动重算（等价 shared useAutoUpdate throttleMs=0）
  useEffect(() => {
    if (!state.visible) return

    let frame: number | null = null
    const schedule = () => {
      if (frame != null) return
      frame = requestAnimationFrame(() => {
        frame = null
        updatePosition()
      })
    }

    document.addEventListener('scroll', schedule, true)
    window.addEventListener('resize', schedule)

    return () => {
      document.removeEventListener('scroll', schedule, true)
      window.removeEventListener('resize', schedule)
      if (frame != null) cancelAnimationFrame(frame)
    }
  }, [state.visible, updatePosition])

  return {
    updatePosition,
    updateBridgePosition,
  }
}
