import { useCallback, useEffect, useRef, useState } from 'react'
import type { PopupState } from '../types/state'
import { scheduleBringOverlayHostToFront } from '../../../constants/cwOverlayStack'
import { DEFAULT_CONFIG } from '../constants'
import { nextAnimationFrame } from '../utils/popupStateHelpers'

export interface UsePopupContainerOptions {
  state: PopupState
  onVisibleChange?: (visible: boolean) => void
  getMountContainer?: () => HTMLElement | null
}

/**
 * 弹出层容器 Hook（React 版）
 * 负责首次 show 时挂载 createPortal 容器，并维护 popup / plugin / bridge / host 的 DOM ref。
 */
export function usePopupContainer(options: UsePopupContainerOptions) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const { state } = options

  const [containerMounted, setContainerMounted] = useState(false)
  const containerMountedRef = useRef(false)
  const [mountContainer, setMountContainer] = useState<HTMLElement | null>(null)

  const hostRef = useRef<HTMLDivElement>(null)
  const popupElement = useRef<HTMLDivElement>(null)
  const pluginElement = useRef<HTMLDivElement>(null)
  const bridgeElement = useRef<HTMLDivElement>(null)

  const ensureContainer = useCallback(() => {
    const target =
      optionsRef.current.getMountContainer?.() ??
      (typeof document !== 'undefined' ? document.body : null)
    if (!target) return

    setMountContainer((prev) => (prev === target ? prev : target))

    if (!containerMountedRef.current) {
      containerMountedRef.current = true
      setContainerMounted(true)
    }
  }, [])

  /** 等待 Portal ref 就绪（show() 期间最多重试 N 帧） */
  const waitForElements = useCallback(async (): Promise<boolean> => {
    const maxAttempts = DEFAULT_CONFIG.showRepositionMaxAttempts
    for (let i = 0; i < maxAttempts; i++) {
      if (popupElement.current && pluginElement.current) return true
      await nextAnimationFrame()
    }
    return !!(popupElement.current && pluginElement.current)
  }, [])

  const bringMountHostToFront = useCallback(() => {
    const host = hostRef.current
    if (host) scheduleBringOverlayHostToFront(host)
  }, [])

  // 面板 role / aria
  useEffect(() => {
    const el = popupElement.current
    if (!el) return
    el.setAttribute('role', 'tooltip')
    el.setAttribute('aria-live', 'polite')
  })

  // maxHeight 约束
  useEffect(() => {
    const el = popupElement.current
    if (!el) return
    const maxHeight = state.constraints?.maxHeight
    if (typeof maxHeight === 'number' && maxHeight > 0) {
      el.style.setProperty('max-height', `${maxHeight}px`)
    } else {
      el.style.removeProperty('max-height')
    }
  })

  // visible 变化回调（跳过首次，与 Vue watch 非 immediate 对齐）
  const isFirstVisibleEffect = useRef(true)
  useEffect(() => {
    if (isFirstVisibleEffect.current) {
      isFirstVisibleEffect.current = false
      return
    }
    optionsRef.current.onVisibleChange?.(state.visible)
  }, [state, state.visible])

  return {
    containerMounted,
    mountContainer,
    hostRef,
    popupElement,
    pluginElement,
    bridgeElement,
    ensureContainer,
    waitForElements,
    bringMountHostToFront,
  }
}
