import { useCallback, useEffect, useRef } from 'react'
import type { PopupState } from '../types/state'

export interface UsePopupTimersOptions {
  state: PopupState
  showDelay: number
  hideDelay: number
  onShow: () => void
  onHide: () => void
}

/**
 * 弹出层定时器管理 Hook
 * 负责处理显示和隐藏的延迟逻辑
 */
export function usePopupTimers(options: UsePopupTimersOptions) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const showTimer = useRef<number | null>(null)
  const hideTimer = useRef<number | null>(null)

  const clearTimers = useCallback(() => {
    if (showTimer.current != null) {
      window.clearTimeout(showTimer.current)
      showTimer.current = null
    }
    if (hideTimer.current != null) {
      window.clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }, [])

  /**
   * 延迟显示弹出层
   */
  const scheduleShow = useCallback(() => {
    const { state, showDelay, onShow } = optionsRef.current

    // 清除隐藏定时器
    if (hideTimer.current != null) {
      window.clearTimeout(hideTimer.current)
      hideTimer.current = null
    }

    // 如果已经显示，不重复显示
    if (state.visible) return

    // 如果已有显示定时器，不再重复设置
    if (showTimer.current != null) return

    if (showDelay > 0) {
      showTimer.current = window.setTimeout(() => {
        showTimer.current = null
        optionsRef.current.onShow()
      }, showDelay)
    } else {
      onShow()
    }
  }, [])

  /**
   * 延迟隐藏弹出层
   */
  const scheduleHide = useCallback(() => {
    const { state, hideDelay, onHide } = optionsRef.current

    // 清除显示定时器
    if (showTimer.current != null) {
      window.clearTimeout(showTimer.current)
      showTimer.current = null
    }

    // 如果已经隐藏，不重复隐藏
    if (!state.visible) return

    // 如果已有隐藏定时器，不再重复设置
    if (hideTimer.current != null) return

    if (hideDelay > 0) {
      hideTimer.current = window.setTimeout(() => {
        hideTimer.current = null
        optionsRef.current.onHide()
      }, hideDelay)
    } else {
      onHide()
    }
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  return {
    scheduleShow,
    scheduleHide,
    clearTimers,
  }
}
