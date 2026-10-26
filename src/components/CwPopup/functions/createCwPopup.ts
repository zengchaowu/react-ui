import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import type { CwPopupInstance, CwPopupOptions, VirtualElement } from '../types'
import type { PopupState } from '../types/state'
import { usePopupState } from '../hooks/usePopupState'
import { usePopupContainer } from '../hooks/usePopupContainer'
import { usePopupPosition } from '../hooks/usePopupPosition'
import { usePopupEvents } from '../hooks/usePopupEvents'
import { useBindPopupOverlayLayer } from '../hooks/bindPopupOverlayLayer'
import { useKeyboard } from '../hooks/useKeyboard'
import { useTriggerResizeObserver } from '../hooks/useTriggerResizeObserver'
import { clearPopupPosition, afterAnimationFrame } from '../utils/popupStateHelpers'
import { revokeOverlayLayer } from '../../../constants/cwOverlayStack'
import { validateCwPopupOptions } from './validateCwPopupOptions'
import { DEFAULT_CONFIG } from '../constants'

export interface CreateCwPopupOptions extends CwPopupOptions {
  /** 获取参考元素（真实 DOM 或虚拟元素） */
  getTriggerElement: () => HTMLElement | VirtualElement | null
}

export interface CreateCwPopupResult {
  instance: CwPopupInstance
  state: PopupState
  containerMounted: boolean
  mountContainer: HTMLElement | null
  hostRef: RefObject<HTMLDivElement>
  popupElement: RefObject<HTMLDivElement>
  pluginElement: RefObject<HTMLDivElement>
  bridgeElement: RefObject<HTMLDivElement>
}

/**
 * 创建弹出层实例（React Hook 版函数式 API，供 CwPopup 使用）
 */
export function createCwPopup(options: CreateCwPopupOptions): CreateCwPopupResult {
  const validatedRef = useRef(false)
  if (!validatedRef.current) {
    validateCwPopupOptions(options)
    validatedRef.current = true
  }

  const optionsRef = useRef(options)
  optionsRef.current = options

  const {
    placement = DEFAULT_CONFIG.placement,
    trigger: triggerType = DEFAULT_CONFIG.trigger,
    plugins = [],
    showDelay = DEFAULT_CONFIG.showDelay,
    hideDelay = DEFAULT_CONFIG.hideDelay,
    closeOnClickOutside = DEFAULT_CONFIG.closeOnClickOutside,
    dismissGraceMs,
    closeOnScroll = false,
    extraTraps,
    getTriggerElement,
  } = options

  const overlayLayerIdRef = useRef(
    `cw-popup-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  )

  const { state, notify } = usePopupState(placement, triggerType)

  const container = usePopupContainer({
    state,
    onVisibleChange: options.onVisibleChange,
    getMountContainer: options.getMountContainer,
  })

  const position = usePopupPosition({
    state,
    popupElement: container.popupElement,
    pluginElement: container.pluginElement,
    bridgeElement: container.bridgeElement,
    getTriggerElement,
    plugins,
    triggerType,
    containerMounted: container.containerMounted,
    notify,
  })

  const { ensureContainer, waitForElements, bringMountHostToFront } = container
  const { updatePosition: updatePositionCore, updateBridgePosition } = position

  const suppressOutsideCloseUntilRef = useRef(0)
  const showTaskRef = useRef<Promise<void> | null>(null)
  const clearTimersRef = useRef<() => void>(() => {})

  const updatePosition = useCallback(() => updatePositionCore(), [updatePositionCore])

  const show = useCallback(async (): Promise<void> => {
    if (showTaskRef.current) return showTaskRef.current

    showTaskRef.current = (async () => {
      try {
        if (dismissGraceMs && dismissGraceMs > 0) {
          suppressOutsideCloseUntilRef.current = Date.now() + dismissGraceMs
        }
        clearPopupPosition(state)
        state.visible = true
        ensureContainer()
        notify()
        await waitForElements()
        updatePosition()
        await afterAnimationFrame()
        updatePosition()
        updateBridgePosition()
        bringMountHostToFront()
      } catch (error) {
        console.error('[CwPopup] Failed to show popup:', error)
        throw error
      } finally {
        showTaskRef.current = null
      }
    })()

    return showTaskRef.current
  }, [
    bringMountHostToFront,
    dismissGraceMs,
    ensureContainer,
    notify,
    state,
    updateBridgePosition,
    updatePosition,
    waitForElements,
  ])

  const hide = useCallback(() => {
    clearTimersRef.current()
    state.visible = false
    clearPopupPosition(state)
    notify()
  }, [notify, state])

  const toggle = useCallback(() => {
    if (state.visible) hide()
    else void show()
  }, [hide, show, state])

  const events = usePopupEvents({
    state,
    getTriggerElement,
    popupElement: container.popupElement,
    bridgeElement: container.bridgeElement,
    triggerType,
    showDelay,
    hideDelay,
    onShow: show,
    onHide: hide,
    onToggle: toggle,
  })

  clearTimersRef.current = events.clearTimers

  useKeyboard({ state, onHide: hide })

  useTriggerResizeObserver({
    getTriggerElement,
    onResize: options.onTriggerResize,
  })

  useBindPopupOverlayLayer({
    layerId: overlayLayerIdRef.current,
    mountHostEl: () => container.hostRef.current,
    popupElement: container.popupElement,
    bridgeElement: container.bridgeElement,
    getTriggerElement,
    closeOnClickOutside,
    isActive: () => state.visible,
    onHide: hide,
    containerMounted: container.containerMounted,
    shouldAbortDismiss: () =>
      suppressOutsideCloseUntilRef.current > 0 &&
      Date.now() < suppressOutsideCloseUntilRef.current,
    getExtraTraps: extraTraps,
  })

  const closeOnScrollEnabled = closeOnScroll
  useEffect(() => {
    if (!state.visible || !closeOnScrollEnabled) return
    if (typeof document === 'undefined') return

    const onScrollClose = () => hide()
    document.addEventListener('scroll', onScrollClose, true)
    return () => document.removeEventListener('scroll', onScrollClose, true)
  }, [state, state.visible, closeOnScrollEnabled, hide])

  const maxHeight = state.constraints?.maxHeight ?? null
  const visible = state.visible
  useEffect(() => {
    optionsRef.current.onMaxHeightChange?.(visible ? maxHeight : null)
  }, [visible, maxHeight])

  const destroy = useCallback(() => {
    try {
      hide()
      revokeOverlayLayer(overlayLayerIdRef.current)
    } catch (error) {
      console.error('[CwPopup] Error during destroy:', error)
    }
  }, [hide])

  const instance = useMemo<CwPopupInstance>(
    () => ({
      state,
      show,
      hide,
      toggle,
      updatePosition,
      destroy,
      getPopupElement: () => container.popupElement.current,
      getBridgeElement: () => container.bridgeElement.current,
    }),
    [state, show, hide, toggle, updatePosition, destroy, container.popupElement, container.bridgeElement],
  )

  return {
    instance,
    state,
    containerMounted: container.containerMounted,
    mountContainer: container.mountContainer,
    hostRef: container.hostRef,
    popupElement: container.popupElement,
    pluginElement: container.pluginElement,
    bridgeElement: container.bridgeElement,
  }
}
