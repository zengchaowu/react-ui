/** 超过此位移视为拖拽，松手后抑制浏览器合成的 click */
const DRAG_CLICK_SUPPRESS_MOVE_PX = 8
/** 与 CwImagePreview 手势抑制窗口同量级 */
const DRAG_CLICK_SUPPRESS_MS = 450

/**
 * 拖拽松手后吃掉紧随其后的合成 click（避免点到视频 toggle 播放等）。
 */
export function createSyntheticClickSuppressor() {
  let gestureDragMoved = false
  let suppressClickListener: ((event: MouseEvent) => void) | null = null
  let suppressClickTimer: ReturnType<typeof setTimeout> | null = null

  const clear = () => {
    if (suppressClickListener) {
      document.removeEventListener('click', suppressClickListener, true)
      suppressClickListener = null
    }
    if (suppressClickTimer != null) {
      clearTimeout(suppressClickTimer)
      suppressClickTimer = null
    }
  }

  return {
    reset() {
      gestureDragMoved = false
    },
    noteDelta(deltaX: number, deltaY: number) {
      if (
        Math.abs(deltaX) >= DRAG_CLICK_SUPPRESS_MOVE_PX ||
        Math.abs(deltaY) >= DRAG_CLICK_SUPPRESS_MOVE_PX
      ) {
        gestureDragMoved = true
      }
    },
    suppressAfterDrag() {
      if (!gestureDragMoved) return
      clear()
      const until = Date.now() + DRAG_CLICK_SUPPRESS_MS
      const onClickCapture = (event: MouseEvent) => {
        if (Date.now() >= until) {
          clear()
          return
        }
        event.preventDefault()
        event.stopImmediatePropagation()
        clear()
      }
      suppressClickListener = onClickCapture
      document.addEventListener('click', onClickCapture, true)
      suppressClickTimer = setTimeout(clear, DRAG_CLICK_SUPPRESS_MS + 50)
    },
    dispose: clear,
  }
}
