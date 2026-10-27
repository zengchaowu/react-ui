import type { RefObject } from 'react'
import type { PopupTrigger } from '@zengchaowu/ui-shared/components/CwPopup/types/state'

export interface UseHoverEventsOptions {
  triggerType: PopupTrigger
  onMouseEnter: () => void
  onMouseLeave: () => void
}

/**
 * 弹出层 Hover 事件管理 Hook
 * 负责处理元素的 mouseenter 和 mouseleave 事件绑定
 */
export function useHoverEvents(options: UseHoverEventsOptions) {
  const { triggerType, onMouseEnter, onMouseLeave } = options

  /**
   * 绑定 hover 事件到指定元素
   */
  const bindHoverEvents = (element: HTMLElement, boundKey: string): boolean => {
    if (triggerType !== 'hover') return false
    if (!element) return false
    if (element.dataset[boundKey] === 'true') return false

    element.addEventListener('mouseenter', onMouseEnter, { passive: true })
    element.addEventListener('mouseleave', onMouseLeave, { passive: true })
    element.dataset[boundKey] = 'true'
    return true
  }

  /**
   * 解绑指定元素的 hover 事件
   */
  const unbindHoverEvents = (element: HTMLElement, boundKey: string) => {
    if (!element) return

    element.removeEventListener('mouseenter', onMouseEnter)
    element.removeEventListener('mouseleave', onMouseLeave)
    delete element.dataset[boundKey]
  }

  /**
   * 绑定 ref 对应元素的 hover 事件
   */
  const bindHoverEventsToRef = (
    elementRef: RefObject<HTMLElement | null>,
    boundKey: string,
  ) => {
    if (elementRef.current) {
      bindHoverEvents(elementRef.current, boundKey)
    }
  }

  /**
   * 解绑 ref 对应元素的 hover 事件
   */
  const unbindHoverEventsFromRef = (
    elementRef: RefObject<HTMLElement | null>,
    boundKey: string,
  ) => {
    if (elementRef.current) {
      unbindHoverEvents(elementRef.current, boundKey)
    }
  }

  return {
    bindHoverEvents,
    unbindHoverEvents,
    bindHoverEventsToRef,
    unbindHoverEventsFromRef,
  }
}
