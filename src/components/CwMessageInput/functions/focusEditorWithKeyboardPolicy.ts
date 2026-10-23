type FocusPosition = 'start' | 'end' | number | boolean

/** 同步 DOM 根节点的 virtualKeyboardPolicy（Chromium / 新版 WebView）。 */
export function syncEditorVirtualKeyboardPolicy(
  dom: HTMLElement | null | undefined,
  suppress: boolean,
): void {
  if (!dom) return
  if ('virtualKeyboardPolicy' in dom) {
    ;(dom as HTMLElement & { virtualKeyboardPolicy: string }).virtualKeyboardPolicy =
      suppress ? 'manual' : 'auto'
  }
}

function focusDom(dom: HTMLElement, position?: FocusPosition): void {
  if (position === 'start' || position === 'end') {
    const range = document.createRange()
    range.selectNodeContents(dom)
    range.collapse(position === 'start')
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }
  dom.focus({ preventScroll: true })
}

/**
 * 聚焦编辑器；suppressKeyboard 时尽量不唤起系统输入法（仍尽量保留选区/光标）。
 * - 优先 virtualKeyboardPolicy=manual
 * - iOS 等降级：只读属性瞬时切换
 */
export function focusEditorWithKeyboardPolicy(
  dom: HTMLElement,
  suppressKeyboard: boolean,
  /** 不传则保持当前选区；勿默认 `true`，避免误把光标移到文首 */
  position?: FocusPosition,
): void {
  if (!suppressKeyboard) {
    syncEditorVirtualKeyboardPolicy(dom, false)
    focusDom(dom, position)
    return
  }

  syncEditorVirtualKeyboardPolicy(dom, true)

  if ('virtualKeyboardPolicy' in dom) {
    focusDom(dom, position)
    return
  }

  dom.setAttribute('readonly', 'true')
  dom.setAttribute('inputmode', 'none')
  focusDom(dom, position)
  requestAnimationFrame(() => {
    dom.removeAttribute('readonly')
    dom.removeAttribute('inputmode')
  })
}
