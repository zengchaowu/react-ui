import type { PopupTrigger } from '../types/state'

/**
 * 与 README「Hover 在移动端的规范」一致：仅当设备具备真实悬停能力且精细指针时，
 * 才在 JS 侧启用依赖 mouseenter/mouseleave 的 hover 触发（如 CwPopup trigger: hover）。
 */
export const FINE_POINTER_HOVER_MEDIA = '(hover: hover) and (pointer: fine)'

export function finePointerHoverMatches(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(FINE_POINTER_HOVER_MEDIA).matches
}

export function isHoverFinePointerMode(trigger: PopupTrigger): boolean {
  return trigger === 'hover' && finePointerHoverMatches()
}

export function isHoverCoarseTouchMode(trigger: PopupTrigger): boolean {
  return trigger === 'hover' && !finePointerHoverMatches()
}

/** 触屏 hover 无 mouseleave，默认开启点外关闭 */
export function resolveHoverCloseOnClickOutside(
  trigger: PopupTrigger,
  closeOnClickOutside: boolean,
): boolean {
  if (isHoverCoarseTouchMode(trigger)) return true
  return closeOnClickOutside
}
