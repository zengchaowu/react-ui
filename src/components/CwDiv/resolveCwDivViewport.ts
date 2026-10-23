import type { RefObject } from 'react'

/** React 版元素来源：DOM 节点、Ref 或嵌套 Ref */
export type CwDivElementSource =
  | HTMLElement
  | RefObject<HTMLElement | null>
  | null
  | undefined

export type CwDivScrollExpose = {
  el?: CwDivElementSource
  viewport?: CwDivElementSource
  content?: CwDivElementSource
}

/** Unwrap nested Ref until an HTMLElement is found */
export function resolveCwDivElement(source: CwDivElementSource): HTMLElement | null {
  let node: unknown = source
  for (let depth = 0; depth < 4; depth += 1) {
    if (typeof HTMLElement !== 'undefined' && node instanceof HTMLElement) return node
    if (node && typeof node === 'object' && 'current' in node) {
      node = (node as { current: unknown }).current
      continue
    }
    break
  }
  return null
}

/**
 * Resolve vertical scroll viewport (`.cw-div__viewport`) from CwDiv handle or expose.
 */
export function resolveCwDivViewport(
  panel: CwDivScrollExpose | null | undefined,
): HTMLElement | null {
  if (!panel) return null
  const fromViewport = resolveCwDivElement(panel.viewport)
  if (fromViewport) return fromViewport
  const root = resolveCwDivElement(panel.el)
  const fromRoot = root?.querySelector('.cw-div__viewport')
  return fromRoot instanceof HTMLElement ? fromRoot : null
}

/** Content layer (`.cw-div__content`) from expose, or under a viewport element */
export function resolveCwDivContent(
  panelOrViewport: CwDivScrollExpose | HTMLElement | null | undefined,
): HTMLElement | null {
  if (!panelOrViewport) return null
  if (panelOrViewport instanceof HTMLElement) {
    const content = panelOrViewport.querySelector('.cw-div__content')
    if (content instanceof HTMLElement) return content
    const first = panelOrViewport.firstElementChild
    return first instanceof HTMLElement ? first : null
  }
  const content = resolveCwDivElement(panelOrViewport.content)
  if (content) return content
  const viewport = resolveCwDivViewport(panelOrViewport)
  return resolveCwDivContent(viewport)
}
