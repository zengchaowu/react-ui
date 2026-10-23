/**
 * Only adjust the editor scrollTop when the editor itself is scrollable.
 * Never scroll shell/page ancestors: growFromBottom abspos editor creates
 * shell scrollable overflow, which lifts bottom-anchored toolbar buttons.
 */
export function scrollComposerSelectionIntoView(root: HTMLElement) {
  if (!root.isConnected) return

  const style = getComputedStyle(root)
  const overflowY = style.overflowY
  const allowsScroll =
    overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay'
  if (!allowsScroll) return
  if (root.scrollHeight <= root.clientHeight + 1) return

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0).cloneRange()
  const coords = range.getBoundingClientRect()
  if (coords.width === 0 && coords.height === 0) return
  const rect = root.getBoundingClientRect()
  const pad = 4
  if (coords.bottom > rect.bottom - pad) {
    root.scrollTop += coords.bottom - (rect.bottom - pad)
  } else if (coords.top < rect.top + pad) {
    root.scrollTop -= rect.top + pad - coords.top
  }
}

export function scheduleScrollComposerSelectionIntoView(root: HTMLElement) {
  void Promise.resolve().then(() => {
    requestAnimationFrame(() => {
      if (root.isConnected) scrollComposerSelectionIntoView(root)
    })
  })
}
