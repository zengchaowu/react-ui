import { useEffect, useRef, type RefObject } from 'react'
import { createTooltipLongPressHandlers } from '@zengchaowu/shared/functions/dom/createTooltipLongPressHandlers'
import { isFinePointerPrimaryInput } from '../../utils/appThemeDom'

export interface ChatMessageTouchLongPressPayload {
  messageId: string
  clientX: number
  clientY: number
  bubbleEl: HTMLElement
}

/** React 版 `useChatMessageTouchLongPress`：移动端长按气泡触发工具条菜单 */
export function useChatMessageTouchLongPress(options: {
  rootRef: RefObject<HTMLElement | null>
  enabled: () => boolean
  onLongPress: (payload: ChatMessageTouchLongPressPayload) => void
}) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    const root = options.rootRef.current
    if (!root || typeof window === 'undefined') return

    let lastClientX = 0
    let lastClientY = 0
    let lastBubbleEl: HTMLElement | null = null
    let lastMessageId: string | null = null
    let nativeSelectBlockEl: HTMLElement | null = null

    const blockNativeSelectStart = (e: Event) => {
      if (!nativeSelectBlockEl) return
      const target = e.target
      if (target instanceof Node && nativeSelectBlockEl.contains(target)) {
        e.preventDefault()
      }
    }

    function armNativeSelectBlock(bubbleEl: HTMLElement) {
      clearNativeSelectBlock()
      nativeSelectBlockEl = bubbleEl
      document.addEventListener('selectstart', blockNativeSelectStart, true)
    }

    function clearNativeSelectBlock() {
      if (!nativeSelectBlockEl) return
      document.removeEventListener('selectstart', blockNativeSelectStart, true)
      nativeSelectBlockEl = null
    }

    const longPress = createTooltipLongPressHandlers({
      enabled: () => optionsRef.current.enabled(),
      onLongPress: () => {
        const messageId = lastMessageId?.trim()
        const bubbleEl = lastBubbleEl
        if (!messageId || !bubbleEl) return
        optionsRef.current.onLongPress({
          messageId,
          clientX: lastClientX,
          clientY: lastClientY,
          bubbleEl,
        })
      },
    })

    function resolveMessageIdFromTarget(target: EventTarget | null): string | null {
      const t = target as HTMLElement | null
      if (!t) return null
      const bubble = t.closest('[data-cw-chat-message-bubble-body]') as HTMLElement | null
      const id = bubble?.getAttribute('data-chat-message-id')?.trim()
      return id && id.length > 0 ? id : null
    }

    function onTouchStart(e: TouchEvent) {
      if (!optionsRef.current.enabled()) return
      const touch = e.touches[0]
      if (!touch) return
      lastClientX = touch.clientX
      lastClientY = touch.clientY
      const bubbleEl = (e.target as HTMLElement | null)?.closest?.(
        '[data-cw-chat-message-bubble-body]',
      ) as HTMLElement | null
      lastBubbleEl = bubbleEl
      lastMessageId = resolveMessageIdFromTarget(e.target)
      if (bubbleEl) {
        window.getSelection()?.removeAllRanges()
        armNativeSelectBlock(bubbleEl)
      }
      longPress.onTouchStart(e)
    }

    function onTouchMove(e: TouchEvent) {
      longPress.onTouchMove(e)
    }

    function onTouchEnd() {
      longPress.onTouchEnd()
      clearNativeSelectBlock()
      lastBubbleEl = null
      lastMessageId = null
    }

    function onTouchCancel() {
      longPress.onTouchCancel()
      clearNativeSelectBlock()
      lastBubbleEl = null
      lastMessageId = null
    }

    function onClickCapture(e: MouseEvent) {
      if (longPress.consumeSuppressClick()) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    /** 移动端长按会合成 contextmenu，需拦截以免先出系统/竖排菜单再出工具条 */
    function onContextMenuCapture(e: Event) {
      if (!optionsRef.current.enabled()) return
      if (isFinePointerPrimaryInput()) return
      e.preventDefault()
      e.stopPropagation()
    }

    root.addEventListener('touchstart', onTouchStart, { passive: true })
    root.addEventListener('touchmove', onTouchMove, { passive: true })
    root.addEventListener('touchend', onTouchEnd, { passive: true })
    root.addEventListener('touchcancel', onTouchCancel, { passive: true })
    root.addEventListener('click', onClickCapture, true)
    root.addEventListener('contextmenu', onContextMenuCapture, true)

    return () => {
      root.removeEventListener('touchstart', onTouchStart)
      root.removeEventListener('touchmove', onTouchMove)
      root.removeEventListener('touchend', onTouchEnd)
      root.removeEventListener('touchcancel', onTouchCancel)
      root.removeEventListener('click', onClickCapture, true)
      root.removeEventListener('contextmenu', onContextMenuCapture, true)
      longPress.clearTimer()
      clearNativeSelectBlock()
    }
  }, [options.rootRef])
}
