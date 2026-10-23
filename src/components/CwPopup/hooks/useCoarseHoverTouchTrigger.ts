/** 触屏滑动超过该像素则取消待显示的 hover 弹出层，避免滚动误触 */
export const COARSE_HOVER_TOUCH_SCROLL_CANCEL_PX = 10

const PASSIVE = { passive: true } as const

export interface CoarseHoverTouchTriggerHandlers {
  bind: (el: HTMLElement) => void
  unbind: (el: HTMLElement) => void
}

export function createCoarseHoverTouchTrigger(options: {
  enabled: () => boolean
  isVisible: () => boolean
  scheduleShow: () => void
  clearTimers: () => void
}): CoarseHoverTouchTriggerHandlers {
  let touchStartX = 0
  let touchStartY = 0

  const onTouchStart = (e: TouchEvent) => {
    if (!options.enabled()) return
    const t = e.touches[0]
    if (t) {
      touchStartX = t.clientX
      touchStartY = t.clientY
    }
    options.scheduleShow()
  }

  const onTouchMove = (e: TouchEvent) => {
    if (!options.enabled() || options.isVisible()) return
    const t = e.touches[0]
    if (!t) return
    const dx = Math.abs(t.clientX - touchStartX)
    const dy = Math.abs(t.clientY - touchStartY)
    if (dx > COARSE_HOVER_TOUCH_SCROLL_CANCEL_PX || dy > COARSE_HOVER_TOUCH_SCROLL_CANCEL_PX) {
      options.clearTimers()
    }
  }

  return {
    bind: (el) => {
      el.addEventListener('touchstart', onTouchStart, PASSIVE)
      el.addEventListener('touchmove', onTouchMove, PASSIVE)
    },
    unbind: (el) => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
    },
  }
}
