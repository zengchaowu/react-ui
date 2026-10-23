import type { VirtualElement } from '../types'

/**
 * 从 ref / 元素中获取实际的 HTMLElement
 */
export function getElement(el: HTMLElement | null | undefined): HTMLElement | null {
  if (!el) return null
  if (el instanceof HTMLElement) return el
  return null
}

/**
 * 从 ref 中获取参考元素（支持虚拟元素）
 * 返回真实 HTMLElement 或虚拟元素
 */
export function getReferenceElement(
  el: HTMLElement | VirtualElement | null | undefined,
): HTMLElement | VirtualElement | null {
  if (!el) return null

  if (el instanceof HTMLElement) return el

  // 虚拟元素（有 getBoundingClientRect 方法）
  if (typeof el.getBoundingClientRect === 'function') return el

  return null
}

/**
 * 判断是否为真实 DOM 元素（非虚拟元素）
 */
export function isRealElement(el: unknown): el is HTMLElement {
  return el instanceof HTMLElement
}
