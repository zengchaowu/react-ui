import { useEffect, useState, type CSSProperties, type RefObject } from 'react'

export interface UseDraggableDialogOptions {
  enabled: boolean
  targetRef: RefObject<HTMLElement | null>
  handleRef: RefObject<HTMLElement | null>
  ignoreInteractiveInHandle?: boolean
}

/** 点在按钮/链接/表单控件上不触发拖拽（用于 header 含关闭按钮等） */
const INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, [contenteditable="true"], [data-cw-dialog-no-drag]'

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest(INTERACTIVE_SELECTOR))
}

/**
 * 弹窗拖拽（React 版 useDraggable 等价实现）。
 * 拖拽把手按下后整块 content 使用 absolute 定位跟随指针。
 */
export function useDraggableDialog(options: UseDraggableDialogOptions) {
  const { enabled, targetRef, handleRef, ignoreInteractiveInHandle = false } = options
  const [style, setStyle] = useState<CSSProperties>({})
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setStyle({})
      setIsDragging(false)
      return
    }

    const moveEl = targetRef.current
    if (!moveEl) return
    const listenEl = handleRef.current ?? moveEl

    let positionInited = false
    let dragging = false
    let startX = 0
    let startY = 0

    const updatePositionedStyle = (x: number, y: number) => {
      setStyle({
        position: 'absolute',
        top: `${y}px`,
        left: `${x}px`,
      })
    }

    const initPosition = () => {
      if (positionInited) return
      const rect = moveEl.getBoundingClientRect()
      const offsetParent = moveEl.offsetParent ?? document.body
      const parentRect = offsetParent.getBoundingClientRect()
      updatePositionedStyle(rect.left - parentRect.left, rect.top - parentRect.top)
      positionInited = true
    }

    const onMove = (clientX: number, clientY: number) => {
      if (!dragging) return
      const offsetParent = moveEl.offsetParent ?? document.body
      const parentRect = offsetParent.getBoundingClientRect()
      updatePositionedStyle(
        clientX - startX - parentRect.left,
        clientY - startY - parentRect.top,
      )
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return
      e.preventDefault()
      onMove(e.clientX, e.clientY)
    }

    const finishDrag = () => {
      if (!dragging) return
      dragging = false
      setIsDragging(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    function onMouseUp() {
      finishDrag()
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging || e.touches.length !== 1) return
      e.preventDefault()
      onMove(e.touches[0].clientX, e.touches[0].clientY)
    }

    const onTouchEnd = () => {
      if (!dragging) return
      dragging = false
      setIsDragging(false)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('touchcancel', onTouchEnd)
    }

    const onMouseDown = (e: MouseEvent) => {
      if (ignoreInteractiveInHandle && isInteractiveTarget(e.target)) return
      e.stopPropagation()
      e.preventDefault()
      initPosition()
      dragging = true
      setIsDragging(true)
      const rect = moveEl.getBoundingClientRect()
      startX = e.clientX - rect.left
      startY = e.clientY - rect.top
      document.addEventListener('mousemove', onMouseMove, { passive: false })
      document.addEventListener('mouseup', onMouseUp)
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      if (ignoreInteractiveInHandle && isInteractiveTarget(e.target)) return
      e.stopPropagation()
      initPosition()
      dragging = true
      setIsDragging(true)
      const touch = e.touches[0]
      const rect = moveEl.getBoundingClientRect()
      startX = touch.clientX - rect.left
      startY = touch.clientY - rect.top
      document.addEventListener('touchmove', onTouchMove, { passive: false })
      document.addEventListener('touchend', onTouchEnd)
      document.addEventListener('touchcancel', onTouchEnd)
    }

    initPosition()
    listenEl.addEventListener('mousedown', onMouseDown)
    listenEl.addEventListener('touchstart', onTouchStart)

    return () => {
      listenEl.removeEventListener('mousedown', onMouseDown)
      listenEl.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [enabled, targetRef, handleRef, ignoreInteractiveInHandle])

  return { style, isDragging }
}
